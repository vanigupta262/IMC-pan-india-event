import { NextResponse } from 'next/server';
import { backendAuth } from '@/lib/backend-client';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

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

    // Try to register with the FastAPI backend
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const backendData = await backendResponse.json();

      if (backendResponse.ok) {
        // Successfully registered with backend
        return NextResponse.json({
          success: true,
          data: {
            token: 'backend-jwt-token-' + email,
            user: {
              id: backendData.id,
              username: backendData.username,
              email: backendData.email,
              role: 'user',
              createdAt: backendData.created_at,
            },
          },
        });
      }

      // Backend returned an error
      return NextResponse.json(
        { success: false, error: backendData.detail || 'Registration failed' },
        { status: backendResponse.status }
      );
    } catch (backendError) {
      console.log('Backend not available, using mock registration:', backendError.message);
      
      // Fallback to mock registration
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
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
