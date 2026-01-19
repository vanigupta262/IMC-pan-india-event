import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const isGloballyPaused = Math.random() > 0.5; 
    return NextResponse.json({
      success: true,
      data: {
        isGloballyPaused,
      },
      message: `All submissions ${isGloballyPaused ? 'paused' : 'resumed'} successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
