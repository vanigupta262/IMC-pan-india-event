'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User, Bot, Users, Gamepad2, BarChart3, Code2, Upload, Loader2 } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

export default function BotsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const [bots, setBots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [botName, setBotName] = useState('');
  const [botFile, setBotFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadBots();
  }, [user, router]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadBots = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/bots?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBots(data);
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadBot = async (e) => {
    e.preventDefault();
    if (!botFile || !botName) {
      showMessage('error', 'Please provide bot name and file');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', botFile);

      const response = await fetch(
        `${BACKEND_URL}/bots/upload?user_id=${user.id}&bot_name=${encodeURIComponent(botName)}`,
        { method: 'POST', body: formData }
      );

      if (response.ok) {
        showMessage('success', `Bot "${botName}" uploaded successfully!`);
        setBotName('');
        setBotFile(null);
        // Reset file input
        document.getElementById('bot-file').value = '';
        loadBots();
      } else {
        const error = await response.json();
        showMessage('error', error.detail || 'Upload failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to upload bot');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBot = async (botId, activate) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/bots/${botId}/${activate ? 'activate' : 'deactivate'}`,
        { method: 'POST' }
      );
      if (response.ok) {
        loadBots();
      }
    } catch (error) {
      console.error('Failed to toggle bot:', error);
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
                    Editor
                  </Button>
                </Link>
                <Link href="/dashboard/bots">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Bot className="w-4 h-4" />
                    My Bots
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
          {/* Upload Bot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Bot
              </CardTitle>
              <CardDescription>Upload a Python bot file (.py) to compete</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={uploadBot} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="bot-name">Bot Name</Label>
                  <Input
                    id="bot-name"
                    placeholder="e.g., GreedyBot v1"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="bot-file">Bot File (.py)</Label>
                  <Input
                    id="bot-file"
                    type="file"
                    accept=".py"
                    onChange={(e) => setBotFile(e.target.files[0])}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span className="ml-2">Upload</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* My Bots List */}
          <Card>
            <CardHeader>
              <CardTitle>My Bots ({bots.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Loading bots...</p>
                </div>
              ) : bots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No bots uploaded yet. Upload your first bot above!
                </div>
              ) : (
                <div className="space-y-3">
                  {bots.map((bot) => (
                    <div
                      key={bot.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                        bot.is_active 
                          ? 'bg-green-50 border-green-500' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{bot.name}</div>
                        <div className="text-sm text-gray-500">
                          Version: {bot.version} | Uploaded: {new Date(bot.uploaded_at).toLocaleDateString()}
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            bot.is_active ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {bot.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant={bot.is_active ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleBot(bot.id, !bot.is_active)}
                      >
                        {bot.is_active ? 'Deactivate' : 'Activate'}
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
