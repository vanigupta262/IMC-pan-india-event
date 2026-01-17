#!/usr/bin/env python3
"""
Simple development server for IGTS IMC Event frontend
Serves static files and proxies API requests to FastAPI backend
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuration
FRONTEND_PORT = 3000
FRONTEND_DIR = Path(__file__).parent

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS support"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS preflight"""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[Frontend] {self.address_string()} - {format % args}")

def main():
    """Start the development server"""
    
    # Check if frontend files exist
    if not (FRONTEND_DIR / 'index.html').exists():
        print("❌ Error: index.html not found in frontend directory")
        sys.exit(1)
    
    try:
        with socketserver.TCPServer(("", FRONTEND_PORT), CORSRequestHandler) as httpd:
            print("=" * 60)
            print("🎮 IGTS × IMC Event 2 - Frontend Development Server")
            print("=" * 60)
            print(f"✅ Frontend running at: http://localhost:{FRONTEND_PORT}")
            print(f"📁 Serving files from: {FRONTEND_DIR}")
            print()
            print("📋 Quick Links:")
            print(f"   • Main UI: http://localhost:{FRONTEND_PORT}")
            print(f"   • Backend API: http://localhost:8000")
            print(f"   • API Docs: http://localhost:8000/docs")
            print()
            print("💡 Tips:")
            print("   • Make sure the backend is running (python3 backend/app.py)")
            print("   • Register an account in the UI to get started")
            print("   • Upload a bot from the bots/ folder")
            print()
            print("Press Ctrl+C to stop the server")
            print("=" * 60)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down frontend server...")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n❌ Error: Port {FRONTEND_PORT} is already in use")
            print(f"   Try: lsof -ti:{FRONTEND_PORT} | xargs kill")
        else:
            print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
