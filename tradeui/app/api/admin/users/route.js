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

    // Note: The backend doesn't have a /users endpoint to list all users
    // In production, you'd add this endpoint to the backend
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'user-1',
          username: 'alice',
          email: 'alice@example.com',
          role: 'user',
          lobbyId: 'lobby-1',
          activeSubmissionId: 'sub-1',
          createdAt: new Date(),
        },
        {
          id: 'user-2',
          username: 'bob',
          email: 'bob@example.com',
          role: 'user',
          lobbyId: 'lobby-1',
          activeSubmissionId: 'sub-2',
          createdAt: new Date(),
        },
        {
          id: 'user-3',
          username: 'charlie',
          email: 'charlie@example.com',
          role: 'user',
          lobbyId: null,
          activeSubmissionId: null,
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
