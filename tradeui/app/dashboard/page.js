'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSubmissionStore } from '@/lib/stores/submission-store';
import { CodeEditor } from '@/components/modules/CodeEditor';
import { SubmissionHistory } from '@/components/modules/SubmissionHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User, Bot, Users, Gamepad2, BarChart3, Code2, Upload, Loader2 } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

const DEFAULT_CODE = `#include <iostream>
using namespace std;


class TradingStrategy {
public:
    void execute() {
        
        cout << "Trading strategy executed!" << endl;
    }
};

int main() {
    TradingStrategy strategy;
    strategy.execute();
    return 0;
}
`;

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { 
    submissions, 
    activeSubmission, 
    isLoading, 
    fetchSubmissions, 
    createSubmission, 
    activateSubmission 
  } = useSubmissionStore();

  const [currentCode, setCurrentCode] = useState(DEFAULT_CODE);
  const [bots, setBots] = useState([]);
  const [botsLoading, setBotsLoading] = useState(false);
  const [botName, setBotName] = useState('');
  const [botFile, setBotFile] = useState(null);
  const [botMessage, setBotMessage] = useState({ type: '', text: '' });

  const showBotMessage = (type, text) => {
    setBotMessage({ type, text });
    setTimeout(() => setBotMessage({ type: '', text: '' }), 5000);
  };

  const loadBots = async () => {
    if (!user?.id) return;
    setBotsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/bots?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBots(data);
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setBotsLoading(false);
    }
  };

  const uploadBot = async (e) => {
    e.preventDefault();
    if (!botFile || !botName) {
      showBotMessage('error', 'Please provide bot name and file');
      return;
    }
    setBotsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', botFile);
      const response = await fetch(
        `${BACKEND_URL}/bots/upload?user_id=${user.id}&bot_name=${encodeURIComponent(botName)}`,
        { method: 'POST', body: formData }
      );
      if (response.ok) {
        showBotMessage('success', `Bot "${botName}" uploaded!`);
        setBotName('');
        setBotFile(null);
        document.getElementById('bot-file').value = '';
        loadBots();
      } else {
        const error = await response.json();
        showBotMessage('error', error.detail || 'Upload failed');
      }
    } catch (error) {
      showBotMessage('error', 'Failed to upload bot');
    } finally {
      setBotsLoading(false);
    }
  };

  const toggleBot = async (botId, activate) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/bots/${botId}/${activate ? 'activate' : 'deactivate'}`,
        { method: 'POST' }
      );
      if (response.ok) loadBots();
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSubmissions();
    loadBots();
  }, [user, router]);

  
  useEffect(() => {
    if (activeSubmission?.code) {
      setCurrentCode(activeSubmission.code);
    }
  }, [activeSubmission]);

  const handleSave = async (code) => {
    const result = await createSubmission(code);
    if (result.success) {
      
      console.log('Submission created successfully');
    }
  };

  const handleSwap = async (submissionId) => {
    const result = await activateSubmission(submissionId);
    if (result.success) {
      
      console.log('Submission activated successfully');
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
              
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <Button variant="secondary" size="sm" className="gap-2">
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
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin')}
                >
                  Admin Panel
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Bot Message Banner */}
      {botMessage.text && (
        <div className={`px-4 py-2 text-center text-sm font-medium ${
          botMessage.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {botMessage.text}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column: Code Editor */}
          <div className="space-y-4">
            <div className="h-[500px]">
              <CodeEditor
                initialCode={currentCode}
                onSave={handleSave}
                isLoading={isLoading}
              />
            </div>
            <SubmissionHistory
              submissions={submissions}
              activeSubmissionId={activeSubmission?.id}
              onSwap={handleSwap}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: My Bots */}
          <div className="space-y-4">
            {/* Upload Bot */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="w-5 h-5" />
                  Upload Bot
                </CardTitle>
                <CardDescription>Upload a Python bot file (.py) to compete</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={uploadBot} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Label htmlFor="bot-name" className="text-xs">Bot Name</Label>
                    <Input
                      id="bot-name"
                      placeholder="e.g., GreedyBot v1"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="bot-file" className="text-xs">Bot File (.py)</Label>
                    <Input
                      id="bot-file"
                      type="file"
                      accept=".py"
                      onChange={(e) => setBotFile(e.target.files[0])}
                      className="h-9"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={botsLoading} size="sm">
                      {botsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span className="ml-1">Upload</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* My Bots List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="w-5 h-5" />
                  My Bots ({bots.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {botsLoading ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : bots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No bots uploaded yet. Upload your first bot above!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {bots.map((bot) => (
                      <div
                        key={bot.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                          bot.is_active 
                            ? 'bg-green-50 border-green-500' 
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm">{bot.name}</div>
                          <div className="text-xs text-gray-500">
                            v{bot.version} | {new Date(bot.uploaded_at).toLocaleDateString()}
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
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
        </div>
      </main>
    </div>
  );
}
