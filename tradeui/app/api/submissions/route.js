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
          id: 'sub-1',
          userId: 'user-1',
          code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
          createdAt: new Date(Date.now() - 86400000),
          isActive: false,
          status: 'stopped',
          language: 'cpp',
        },
        {
          id: 'sub-2',
          userId: 'user-1',
          code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Trading Strategy v2" << endl;\n    return 0;\n}',
          createdAt: new Date(),
          isActive: true,
          status: 'running',
          language: 'cpp',
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
    const { code, language = 'cpp' } = body;
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      );
    }
    const newSubmission = {
      id: 'sub-' + Date.now(),
      userId: 'user-1',
      code,
      createdAt: new Date(),
      isActive: false,
      status: 'pending',
      language,
    };
    return NextResponse.json({
      success: true,
      data: newSubmission,
      message: 'Submission created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
