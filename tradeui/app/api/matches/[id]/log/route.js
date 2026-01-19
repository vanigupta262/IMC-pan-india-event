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
      const response = await fetch(`${BACKEND_URL}/matches/${matchId}/log`);
      
      if (response.ok) {
        const log = await response.json();
        
        return NextResponse.json({
          success: true,
          data: log,
        });
      }

      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.detail || 'Match log not found' },
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
