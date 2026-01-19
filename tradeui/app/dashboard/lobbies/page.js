'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User, Bot, Users, Gamepad2, BarChart3, Code2, Plus, Loader2, Lock, Globe, Key, Play } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

export default function LobbiesPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const [lobbies, setLobbies] = useState([]);
  const [myLobbies, setMyLobbies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lobbyName, setLobbyName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadLobbies();
  }, [user, router]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadLobbies = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Load all public lobbies
      const publicRes = await fetch(`${BACKEND_URL}/lobbies`);
      if (publicRes.ok) {
        const publicData = await publicRes.json();
        setLobbies(publicData.filter(l => !l.is_private && l.status === 'waiting'));
      }

      // Load user's lobbies
      const myRes = await fetch(`${BACKEND_URL}/lobbies/my?user_id=${user.id}`);
      if (myRes.ok) {
        const myData = await myRes.json();
        setMyLobbies(myData);
      }
    } catch (error) {
      console.error('Failed to load lobbies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createLobby = async (e) => {
    e.preventDefault();
    if (!lobbyName) {
      showMessage('error', 'Please provide a lobby name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/lobbies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lobbyName,
          creator_id: user.id,
          is_private: isPrivate,
          max_players: 2
        })
      });

      if (response.ok) {
        const lobby = await response.json();
        showMessage('success', `Lobby "${lobbyName}" created!${lobby.invite_code ? ` Invite code: ${lobby.invite_code}` : ''}`);
        setLobbyName('');
        setIsPrivate(false);
        loadLobbies();
      } else {
        const error = await response.json();
        showMessage('error', error.detail || 'Failed to create lobby');
      }
    } catch (error) {
      showMessage('error', 'Failed to create lobby');
    } finally {
      setIsLoading(false);
    }
  };

  const joinLobby = async (lobbyId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/lobbies/${lobbyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      if (response.ok) {
        showMessage('success', 'Joined lobby successfully!');
        loadLobbies();
      } else {
        const error = await response.json();
        showMessage('error', error.detail || 'Failed to join lobby');
      }
    } catch (error) {
      showMessage('error', 'Failed to join lobby');
    }
  };

  const joinWithInvite = async (e) => {
    e.preventDefault();
    if (!inviteCode) {
      showMessage('error', 'Please enter an invite code');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/lobbies/join/${inviteCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      if (response.ok) {
        showMessage('success', 'Joined private lobby!');
        setInviteCode('');
        loadLobbies();
      } else {
        const error = await response.json();
        showMessage('error', error.detail || 'Invalid invite code');
      }
    } catch (error) {
      showMessage('error', 'Failed to join with invite code');
    }
  };

  const startMatch = async (lobbyId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/lobbies/${lobbyId}/start`, {
        method: 'POST'
      });

      if (response.ok) {
        showMessage('success', 'Match started!');
        loadLobbies();
        router.push('/dashboard/matches');
      } else {
        const error = await response.json();
        showMessage('error', error.detail || 'Failed to start match');
      }
    } catch (error) {
      showMessage('error', 'Failed to start match');
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
                  <Button variant="secondary" size="sm" className="gap-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Lobby */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Lobby
              </CardTitle>
              <CardDescription>Create a new lobby to compete with others</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createLobby} className="space-y-4">
                <div>
                  <Label htmlFor="lobby-name">Lobby Name</Label>
                  <Input
                    id="lobby-name"
                    placeholder="e.g., Pro Traders Only"
                    value={lobbyName}
                    onChange={(e) => setLobbyName(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-private"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is-private" className="flex items-center gap-1 cursor-pointer">
                    <Lock className="w-4 h-4" />
                    Private Lobby (invite code required)
                  </Label>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span className="ml-2">Create Lobby</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join with Invite Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Join Private Lobby
              </CardTitle>
              <CardDescription>Enter an invite code to join a private lobby</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={joinWithInvite} className="flex gap-4">
                <Input
                  placeholder="Enter invite code..."
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Join</Button>
              </form>
            </CardContent>
          </Card>

          {/* My Lobbies */}
          <Card>
            <CardHeader>
              <CardTitle>My Lobbies ({myLobbies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : myLobbies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You haven't joined any lobbies yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myLobbies.map((lobby) => (
                    <div key={lobby.id} className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {lobby.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            {lobby.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Players: {lobby.player_count || 0}/{lobby.max_players} | Status: {lobby.status}
                            {lobby.invite_code && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                                Code: {lobby.invite_code}
                              </span>
                            )}
                          </div>
                        </div>
                        {lobby.status === 'waiting' && (lobby.player_count || 0) >= 2 && (
                          <Button size="sm" onClick={() => startMatch(lobby.id)}>
                            <Play className="w-4 h-4 mr-1" />
                            Start Match
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Public Lobbies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Public Lobbies ({lobbies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                </div>
              ) : lobbies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No public lobbies available. Create one!
                </div>
              ) : (
                <div className="space-y-3">
                  {lobbies.map((lobby) => (
                    <div key={lobby.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border">
                      <div>
                        <div className="font-semibold">{lobby.name}</div>
                        <div className="text-sm text-gray-500">
                          Players: {lobby.player_count || 0}/{lobby.max_players}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => joinLobby(lobby.id)}
                        disabled={(lobby.player_count || 0) >= lobby.max_players}
                      >
                        {(lobby.player_count || 0) >= lobby.max_players ? 'Full' : 'Join'}
                      </Button>
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
