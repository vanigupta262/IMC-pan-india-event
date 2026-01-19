import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (email === 'admin@example.com' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-admin',
          user: {
            id: 'admin-1',
            username: 'Admin User',
            email: email,
            role: 'admin',
            createdAt: new Date(),
          },
        },
      });
    }
    if (email && password === 'password') {
      return NextResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-' + email,
          user: {
            id: 'user-' + Date.now(),
            username: email.split('@')[0],
            email: email,
            role: 'user',
            createdAt: new Date(),
          },
        },
      });
    }
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
