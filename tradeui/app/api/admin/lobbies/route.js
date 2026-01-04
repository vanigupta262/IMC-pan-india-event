import { NextResponse } from 'next/server';
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
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
    const { name } = body;
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Lobby name is required' },
        { status: 400 }
      );
    }
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
