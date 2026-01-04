import { NextResponse } from 'next/server';


export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    
    
    
    
    return NextResponse.json({
      success: true,
      message: `Submission ${id} activated successfully`,
      data: {
        id,
        isActive: true,
        status: 'running',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
