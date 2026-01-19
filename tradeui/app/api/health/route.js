import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // Check if backend is available
    let backendStatus = 'unavailable';
    let backendMessage = '';
    
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        backendStatus = 'ok';
        backendMessage = data.message || 'Backend is running';
      }
    } catch (error) {
      backendMessage = error.message;
    }

    return NextResponse.json({
      success: true,
      data: {
        frontend: 'ok',
        backend: backendStatus,
        backendUrl: BACKEND_URL,
        backendMessage,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        data: {
          frontend: 'ok',
          backend: 'error',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
