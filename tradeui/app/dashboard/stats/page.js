'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Bot, Users, Gamepad2, BarChart3, Code2, Loader2, Trophy, Target, Activity, Server, RefreshCw } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

export default function StatsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const [stats, setStats] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [user, router]);

  const loadStats = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Load user stats
      const statsRes = await fetch(`${BACKEND_URL}/stats/user/${user.id}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Load system status
      const statusRes = await fetch(`${BACKEND_URL}/status`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
      }

      // Load leaderboard
      const lbRes = await fetch(`${BACKEND_URL}/stats/leaderboard`);
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setLeaderboard(lbData);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
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
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Matches
                  </Button>
                </Link>
                <Link href="/dashboard/stats">
                  <Button variant="secondary" size="sm" className="gap-2">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={loadStats} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Bots</p>
                    <p className="text-2xl font-bold">{stats?.total_bots ?? '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Gamepad2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Matches Played</p>
                    <p className="text-2xl font-bold">{stats?.matches_played ?? '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wins</p>
                    <p className="text-2xl font-bold">{stats?.wins ?? '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Win Rate</p>
                    <p className="text-2xl font-bold">
                      {stats?.matches_played > 0 
                        ? `${((stats.wins / stats.matches_played) * 100).toFixed(1)}%`
                        : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : systemStatus ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Activity className={`w-6 h-6 mx-auto mb-2 ${systemStatus.status === 'operational' ? 'text-green-500' : 'text-red-500'}`} />
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold capitalize">{systemStatus.status || 'Unknown'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="font-semibold">{systemStatus.total_users ?? '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Bot className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm text-gray-500">Total Bots</p>
                    <p className="font-semibold">{systemStatus.total_bots ?? '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-gray-500">Total Matches</p>
                    <p className="font-semibold">{systemStatus.total_matches ?? '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Unable to load system status
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Leaderboard
              </CardTitle>
              <CardDescription>Top players by wins</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No leaderboard data available yet
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id || index}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.user_id === user.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-orange-300 text-orange-900' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium">
                          {entry.username || `Player #${entry.user_id}`}
                          {entry.user_id === user.id && ' (You)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-semibold">{entry.wins} wins</span>
                        <span className="text-gray-500">{entry.matches_played} matches</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
