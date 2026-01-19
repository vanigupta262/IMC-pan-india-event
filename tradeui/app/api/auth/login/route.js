import { NextResponse } from 'next/server';
import { backendAuth } from '@/lib/backend-client';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Try to authenticate with the backend
    // Note: The FastAPI backend doesn't have a login endpoint yet,
    // so we'll query for users and verify locally for now
    // In production, you'd want to add a proper /auth/login endpoint to the backend
    
    try {
      // For now, we'll use a simple approach:
      // 1. Try to find user by email (would need backend endpoint)
      // 2. Since backend doesn't have login, we use mock auth for demo
      
      // Check if backend is available
      const healthCheck = await fetch(`${BACKEND_URL}/health`);
      
      if (healthCheck.ok) {
        // Backend is running - use simplified auth
        // Admin check
        if (email === 'admin@example.com' && password === 'admin123') {
          return NextResponse.json({
            success: true,
            data: {
              token: 'backend-jwt-token-admin',
              user: {
                id: 1,
                username: 'Admin',
                email: email,
                role: 'admin',
                createdAt: new Date(),
              },
            },
          });
        }
        
        // For regular users, we'll accept any password for demo
        // In production, add proper /auth/login to backend with password verification
        return NextResponse.json({
          success: true,
          data: {
            token: 'backend-jwt-token-' + email,
            user: {
              id: Date.now(),
              username: email.split('@')[0],
              email: email,
              role: 'user',
              createdAt: new Date(),
            },
          },
        });
      }
    } catch (backendError) {
      console.log('Backend not available, using mock auth:', backendError.message);
    }

    // Fallback to mock auth if backend is not available
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
