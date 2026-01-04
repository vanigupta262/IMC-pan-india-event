import { NextResponse } from 'next/server';
export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { userId, lobbyId } = body;
    if (!userId || !lobbyId) {
      return NextResponse.json(
        { success: false, error: 'userId and lobbyId are required' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `User ${userId} moved to lobby ${lobbyId} successfully`,
      data: {
        userId,
        lobbyId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
