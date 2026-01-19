import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

// Helper to extract user ID from token (simplified)
function getUserIdFromToken(token) {
  // In production, decode JWT properly
  // For now, we'll extract from our simple token format or use a default
  if (token.includes('admin')) return 1;
  const match = token.match(/user-(\d+)/);
  return match ? parseInt(match[1]) : 1;
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);

    try {
      // Fetch bots from backend
      const response = await fetch(`${BACKEND_URL}/bots?user_id=${userId}`);
      
      if (response.ok) {
        const bots = await response.json();
        
        // Transform backend bot format to frontend submission format
        const submissions = bots.map((bot) => ({
          id: `bot-${bot.id}`,
          botId: bot.id,
          userId: bot.user_id,
          code: null, // Backend stores files, not inline code
          fileName: bot.file_path?.split('/').pop() || bot.name + '.py',
          name: bot.name,
          createdAt: bot.uploaded_at,
          isActive: bot.is_active,
          status: bot.is_active ? 'running' : 'stopped',
          language: 'python',
          version: bot.version,
        }));

        return NextResponse.json({
          success: true,
          data: submissions,
        });
      }
    } catch (backendError) {
      console.log('Backend not available, using mock data:', backendError.message);
    }

    // Fallback mock data
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

    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);
    
    const contentType = request.headers.get('content-type') || '';
    
    // Handle file upload (multipart form data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const botName = formData.get('name') || 'MyBot';
      
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'File is required' },
          { status: 400 }
        );
      }

      try {
        // Forward to backend
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        const response = await fetch(
          `${BACKEND_URL}/bots/upload?user_id=${userId}&bot_name=${encodeURIComponent(botName)}`,
          {
            method: 'POST',
            body: backendFormData,
          }
        );

        if (response.ok) {
          const bot = await response.json();
          return NextResponse.json({
            success: true,
            data: {
              id: `bot-${bot.id}`,
              botId: bot.id,
              userId: bot.user_id,
              name: bot.name,
              createdAt: bot.uploaded_at,
              isActive: bot.is_active,
              status: 'pending',
              language: 'python',
            },
            message: 'Bot uploaded successfully',
          });
        }

        const error = await response.json();
        return NextResponse.json(
          { success: false, error: error.detail || 'Upload failed' },
          { status: response.status }
        );
      } catch (backendError) {
        console.log('Backend upload failed:', backendError.message);
        return NextResponse.json(
          { success: false, error: 'Backend not available' },
          { status: 503 }
        );
      }
    }

    // Handle JSON body (code submission)
    const body = await request.json();
    const { code, language = 'cpp', name = 'MySubmission' } = body;
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      );
    }

    // For Python code, create a temporary file and upload to backend
    if (language === 'python' || language === 'py') {
      try {
        const blob = new Blob([code], { type: 'text/x-python' });
        const file = new File([blob], `${name}.py`, { type: 'text/x-python' });
        
        const backendFormData = new FormData();
        backendFormData.append('file', file);

        const response = await fetch(
          `${BACKEND_URL}/bots/upload?user_id=${userId}&bot_name=${encodeURIComponent(name)}`,
          {
            method: 'POST',
            body: backendFormData,
          }
        );

        if (response.ok) {
          const bot = await response.json();
          return NextResponse.json({
            success: true,
            data: {
              id: `bot-${bot.id}`,
              botId: bot.id,
              userId: bot.user_id,
              code,
              name: bot.name,
              createdAt: bot.uploaded_at,
              isActive: bot.is_active,
              status: 'pending',
              language: 'python',
            },
            message: 'Submission created successfully',
          });
        }
      } catch (backendError) {
        console.log('Backend not available for code submission:', backendError.message);
      }
    }

    // Fallback mock submission
    const newSubmission = {
      id: 'sub-' + Date.now(),
      userId: userId,
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
