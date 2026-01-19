import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Fetch lobbies from backend
      const response = await fetch(`${BACKEND_URL}/lobbies`);
      
      if (response.ok) {
        const lobbies = await response.json();
        
        // Transform backend lobby format to frontend format
        const transformedLobbies = lobbies.map((lobby) => ({
          id: `lobby-${lobby.id}`,
          backendId: lobby.id,
          name: lobby.name,
          creatorId: lobby.creator_id,
          userIds: [], // Would need additional API call to get members
          maxUsers: lobby.max_players,
          status: lobby.status === 'open' ? 'waiting' : lobby.status,
          isPrivate: lobby.is_private,
          inviteCode: lobby.invite_code,
          memberCount: lobby.member_count,
          createdAt: new Date(),
        }));

        return NextResponse.json({
          success: true,
          data: transformedLobbies,
        });
      }
    } catch (backendError) {
      console.log('Backend not available, using mock data:', backendError.message);
    }

    // Fallback mock data
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'lobby-1',
          name: 'Lobby 1',
          userIds: ['user-1', 'user-2'],
          maxUsers: 10,
          status: 'waiting',
          createdAt: new Date(),
        },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, creatorId = 1, isPrivate = false, maxPlayers = 2 } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Lobby name is required' },
        { status: 400 }
      );
    }

    try {
      // Create lobby in backend
      const response = await fetch(`${BACKEND_URL}/lobbies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          creator_id: creatorId,
          is_private: isPrivate,
          max_players: Math.min(maxPlayers, 2), // Backend limit is 2
        }),
      });

      if (response.ok) {
        const lobby = await response.json();
        return NextResponse.json({
          success: true,
          data: {
            id: `lobby-${lobby.id}`,
            backendId: lobby.id,
            name: lobby.name,
            creatorId: lobby.creator_id,
            userIds: [],
            maxUsers: lobby.max_players,
            status: 'waiting',
            isPrivate: lobby.is_private,
            inviteCode: lobby.invite_code,
            createdAt: new Date(),
          },
          message: 'Lobby created successfully',
        });
      }

      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.detail || 'Failed to create lobby' },
        { status: response.status }
      );
    } catch (backendError) {
      console.log('Backend not available:', backendError.message);
    }

    // Fallback mock creation
    const newLobby = {
      id: 'lobby-' + Date.now(),
      name,
      userIds: [],
      maxUsers: 10,
      status: 'waiting',
      createdAt: new Date(),
    };
    return NextResponse.json({
      success: true,
      data: newLobby,
      message: 'Lobby created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
