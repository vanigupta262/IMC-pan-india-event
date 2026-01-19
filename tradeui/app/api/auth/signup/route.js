import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token-' + email,
        user: {
          id: 'user-' + Date.now(),
          username: username,
          email: email,
          role: 'user',
          createdAt: new Date(),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
