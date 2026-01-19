import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const matchId = params.id.replace('match-', '');

    try {
      const response = await fetch(`${BACKEND_URL}/matches/${matchId}`);
      
      if (response.ok) {
        const match = await response.json();
        
        return NextResponse.json({
          success: true,
          data: {
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
          },
        });
      }

      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
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

export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const matchId = params.id.replace('match-', '');

    try {
      // Run the match
      const response = await fetch(`${BACKEND_URL}/matches/${matchId}/run`, {
        method: 'POST',
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
            startedAt: match.started_at,
            completedAt: match.completed_at,
            participants: match.participants?.map((p) => ({
              playerId: p.player_id,
              rank: p.rank,
              finalEconomy: p.final_economy,
            })) || [],
          },
          message: 'Match executed successfully',
        });
      }

      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.detail || 'Failed to run match' },
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
