'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAdminStore } from '@/lib/stores/admin-store';
import { AdminTable } from '@/components/modules/AdminTable';
import { LobbyManager } from '@/components/modules/LobbyManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pause, Play, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    users,
    lobbies,
    isGloballyPaused,
    isLoading,
    fetchUsers,
    fetchLobbies,
    distributeUsers,
    moveUser,
    toggleGlobalPause,
    createLobby,
    refreshAll,
  } = useAdminStore();

  useEffect(() => {
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    
    refreshAll();
  }, [user, router]);

  const handleDistribute = async () => {
    const result = await distributeUsers();
    if (result.success) {
      console.log('Users distributed successfully');
    }
  };

  const handleMoveUser = async (userId, lobbyId) => {
    const result = await moveUser(userId, lobbyId);
    if (result.success) {
      console.log('User moved successfully');
    }
  };

  const handleTogglePause = async () => {
    const result = await toggleGlobalPause();
    if (result.success) {
      console.log(`Submissions ${result.isPaused ? 'paused' : 'resumed'}`);
    }
  };

  const handleCreateLobby = async () => {
    const name = prompt('Enter lobby name:');
    if (name) {
      const result = await createLobby(name);
      if (result.success) {
        console.log('Lobby created successfully');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user || user.role !== 'admin') {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAll}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Global Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Global Controls</CardTitle>
            <CardDescription>
              Manage system-wide settings and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  Submission Control
                </h3>
                <p className="text-sm text-gray-600">
                  {isGloballyPaused 
                    ? 'All submissions are currently paused' 
                    : 'All submissions are running'}
                </p>
              </div>
              <Button
                variant={isGloballyPaused ? 'default' : 'destructive'}
                onClick={handleTogglePause}
                disabled={isLoading}
              >
                {isGloballyPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume All
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause All
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lobby Manager */}
        <LobbyManager
          lobbies={lobbies}
          users={users}
          onDistribute={handleDistribute}
          onCreateLobby={handleCreateLobby}
          isLoading={isLoading}
        />

        {/* User Management Table */}
        <AdminTable
          users={users}
          lobbies={lobbies}
          onMoveUser={handleMoveUser}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
