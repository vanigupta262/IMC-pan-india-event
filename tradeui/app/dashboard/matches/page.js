'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Bot, Users, Gamepad2, BarChart3, Code2, Loader2, Play, Trophy, Clock, FileText, RefreshCw } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

export default function MatchesPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const [matches, setMatches] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runningMatch, setRunningMatch] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedLogs, setSelectedLogs] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadMatches();
  }, [user, router]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadMatches = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Load all matches
      const allRes = await fetch(`${BACKEND_URL}/matches`);
      if (allRes.ok) {
        const allData = await allRes.json();
        setMatches(allData);
        setMyMatches(allData.filter(m => 
          m.player1_id === user.id || m.player2_id === user.id
        ));
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runMatch = async (matchId) => {
    setRunningMatch(matchId);
    try {
      const response = await fetch(`${BACKEND_URL}/matches/${matchId}/run`, {
        method: 'POST'
      });

      if (response.ok) {
        showMessage('success', 'Match completed!');
        loadMatches();
      } else {
        const error = await response.json();
        showMessage('error', error.detail || 'Failed to run match');
      }
    } catch (error) {
      showMessage('error', 'Failed to run match');
    } finally {
      setRunningMatch(null);
    }
  };

  const viewLogs = async (matchId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/matches/${matchId}/logs`);
      if (response.ok) {
        const logs = await response.json();
        setSelectedLogs({ matchId, logs });
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    return `px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Trade Simulation</h1>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Code2 className="w-4 h-4" />
                    Editor & Bots
                  </Button>
                </Link>
                <Link href="/dashboard/lobbies">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    Lobbies
                  </Button>
                </Link>
                <Link href="/dashboard/matches">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Matches
                  </Button>
                </Link>
                <Link href="/dashboard/stats">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Stats
                  </Button>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
              </div>
              
              {user.role === 'admin' && (
                <Button variant="outline" onClick={() => router.push('/admin')}>
                  Admin Panel
                </Button>
              )}
              
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Message Banner */}
      {message.text && (
        <div className={`px-4 py-3 text-center text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border-b border-green-200'
            : 'bg-red-100 text-red-800 border-b border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={loadMatches} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* My Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                My Matches ({myMatches.length})
              </CardTitle>
              <CardDescription>Matches you've participated in</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : myMatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No matches yet. Join a lobby and start competing!
                </div>
              ) : (
                <div className="space-y-3">
                  {myMatches.map((match) => (
                    <div key={match.id} className="p-4 rounded-lg bg-gray-50 border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Match #{match.id}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(match.created_at).toLocaleString()}
                            <span className={getStatusBadge(match.status)}>
                              {match.status}
                            </span>
                          </div>
                          {match.status === 'completed' && match.winner_id && (
                            <div className="text-sm mt-1">
                              <span className={match.winner_id === user.id ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                {match.winner_id === user.id ? '🏆 You Won!' : 'You Lost'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {match.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => runMatch(match.id)}
                              disabled={runningMatch === match.id}
                            >
                              {runningMatch === match.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              <span className="ml-1">Run</span>
                            </Button>
                          )}
                          {match.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewLogs(match.id)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Logs
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                All Matches ({matches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No matches have been played yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-2">Match ID</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Created</th>
                        <th className="pb-2">Winner</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.slice(0, 20).map((match) => (
                        <tr key={match.id} className="border-b border-gray-100">
                          <td className="py-3 font-medium">#{match.id}</td>
                          <td className="py-3">
                            <span className={getStatusBadge(match.status)}>
                              {match.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {new Date(match.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-sm">
                            {match.winner_id ? `Player #${match.winner_id}` : '-'}
                          </td>
                          <td className="py-3">
                            {match.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => viewLogs(match.id)}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs Modal */}
          {selectedLogs && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Match #{selectedLogs.matchId} Logs</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedLogs(null)}>×</Button>
                </CardHeader>
                <CardContent className="overflow-auto max-h-[60vh]">
                  <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto">
                    {typeof selectedLogs.logs === 'string' 
                      ? selectedLogs.logs 
                      : JSON.stringify(selectedLogs.logs, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
