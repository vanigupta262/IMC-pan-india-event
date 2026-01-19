'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shuffle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function distributeLobbyAlgorithm(users, maxUsersPerLobby = 10) {
  const unassignedUsers = users.filter(u => !u.lobbyId);
  
  if (unassignedUsers.length === 0) {
    return { lobbies: [], userAssignments: [] };
  }

  const lobbies = [];
  const userAssignments = [];
  
  let currentLobby = null;
  let lobbyCount = 0;

  unassignedUsers.forEach((user, index) => {
    // Create new lobby if needed
    if (!currentLobby || currentLobby.userIds.length >= maxUsersPerLobby) {
      lobbyCount++;
      currentLobby = {
        id: `lobby-${Date.now()}-${lobbyCount}`,
        name: `Lobby ${lobbyCount}`,
        userIds: [],
        maxUsers: maxUsersPerLobby,
        status: 'waiting',
      };
      lobbies.push(currentLobby);
    }

    // Assign user to current lobby
    currentLobby.userIds.push(user.id);
    userAssignments.push({
      userId: user.id,
      lobbyId: currentLobby.id,
    });
  });

  return { lobbies, userAssignments };
}

export function LobbyManager({ 
  lobbies = [], 
  users = [],
  onDistribute,
  onCreateLobby,
  isLoading = false 
}) {
  const unassignedCount = users.filter(u => !u.lobbyId).length;

  const getLobbyUsers = (lobbyId) => {
    return users.filter(u => u.lobbyId === lobbyId);
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800',
      running: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.waiting;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lobby Management ({lobbies.length} lobbies)
            </CardTitle>
            <CardDescription className="mt-1">
              {unassignedCount} unassigned users
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCreateLobby}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
              Create Lobby
            </Button>
            <Button
              onClick={onDistribute}
              disabled={isLoading || unassignedCount === 0}
            >
              <Shuffle className="w-4 h-4" />
              Auto-Distribute
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lobbies.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No lobbies created yet</p>
              <p className="text-sm">Use auto-distribute or create manually</p>
            </div>
          ) : (
            lobbies.map((lobby) => {
              const lobbyUsers = getLobbyUsers(lobby.id);
              const fillPercentage = (lobbyUsers.length / lobby.maxUsers) * 100;

              return (
                <Card key={lobby.id} variant="outlined" padding="sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{lobby.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          ID: {lobby.id.slice(0, 8)}
                        </p>
                      </div>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(lobby.status)
                      )}>
                        {lobby.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Capacity</span>
                        <span className="font-medium">
                          {lobbyUsers.length} / {lobby.maxUsers}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all rounded-full',
                            fillPercentage === 100 ? 'bg-green-500' :
                            fillPercentage >= 70 ? 'bg-blue-500' :
                            'bg-yellow-500'
                          )}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>

                    {lobbyUsers.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Members:</p>
                        <div className="flex flex-wrap gap-1">
                          {lobbyUsers.slice(0, 5).map((user) => (
                            <span
                              key={user.id}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {user.username}
                            </span>
                          ))}
                          {lobbyUsers.length > 5 && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                              +{lobbyUsers.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
