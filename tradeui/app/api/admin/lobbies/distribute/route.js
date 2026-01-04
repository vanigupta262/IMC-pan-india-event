import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const maxUsersPerLobby = 10;
    const mockUsers = [
      { id: 'user-1', username: 'alice', lobbyId: null },
      { id: 'user-2', username: 'bob', lobbyId: null },
      { id: 'user-3', username: 'charlie', lobbyId: null },
    ];
    const unassignedUsers = mockUsers.filter(u => !u.lobbyId);
    const lobbies = [];
    const updatedUsers = [...mockUsers];
    let currentLobby = null;
    let lobbyCount = 0;
    unassignedUsers.forEach((user) => {
      if (!currentLobby || currentLobby.userIds.length >= maxUsersPerLobby) {
        lobbyCount++;
        currentLobby = {
          id: `lobby-${Date.now()}-${lobbyCount}`,
          name: `Lobby ${lobbyCount}`,
          userIds: [],
          maxUsers: maxUsersPerLobby,
          status: 'waiting',
          createdAt: new Date(),
        };
        lobbies.push(currentLobby);
      }
      currentLobby.userIds.push(user.id);
      const userIndex = updatedUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        updatedUsers[userIndex].lobbyId = currentLobby.id;
      }
    });
    return NextResponse.json({
      success: true,
      data: {
        lobbies,
        users: updatedUsers,
      },
      message: `Distributed ${unassignedUsers.length} users into ${lobbies.length} lobbies`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
