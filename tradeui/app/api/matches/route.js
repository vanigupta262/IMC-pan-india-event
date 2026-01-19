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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    try {
      const url = userId 
        ? `${BACKEND_URL}/matches?user_id=${userId}`
        : `${BACKEND_URL}/matches`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const matches = await response.json();
        
        // Transform backend match format to frontend format
        const transformedMatches = matches.map((match) => ({
          id: `match-${match.id}`,
          backendId: match.id,
          status: match.status,
          createdAt: match.created_at,
          startedAt: match.started_at,
          completedAt: match.completed_at,
          participants: match.participants?.map((p) => ({
            playerId: p.player_id,
            rank: p.rank,
            finalEconomy: p.final_economy,
          })) || [],
        }));

        return NextResponse.json({
          success: true,
          data: transformedMatches,
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
          id: 'match-1',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000),
          completedAt: new Date(Date.now() - 86000000),
          participants: [
            { playerId: 0, rank: 1, finalEconomy: 15000 },
            { playerId: 1, rank: 2, finalEconomy: 12000 },
          ],
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
    const { lobbyId, userId = 1 } = body;

    try {
      // Create match in backend
      const response = await fetch(`${BACKEND_URL}/matches?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lobby_id: lobbyId ? parseInt(lobbyId.replace('lobby-', '')) : null,
        }),
      });

      if (response.ok) {
        const match = await response.json();
        return NextResponse.json({
          success: true,
          data: {
            id: `match-${match.id}`,
            backendId: match.id,
            status: match.status,
            createdAt: match.created_at,
          },
          message: 'Match created successfully',
        });
      }

      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.detail || 'Failed to create match' },
        { status: response.status }
      );
    } catch (backendError) {
      console.log('Backend not available:', backendError.message);
      return NextResponse.json(
        { success: false, error: 'Backend not available' },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
