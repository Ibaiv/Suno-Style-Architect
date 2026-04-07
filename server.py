#!/usr/bin/env python3
"""
Simple HTTP Server for Suno Style Architect
Serves the application locally with CORS headers to handle API requests.
"""
import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse


class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP Request Handler with CORS support"""
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:8000')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200, "OK")
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def main():
    """Start the development server"""
    PORT = 8000
    
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"🎵 Suno Style Architect Development Server")
            print(f"📡 Server running at: http://localhost:{PORT}")
            print(f"📁 Serving directory: {os.getcwd()}")
            print(f"🌐 Open your browser and navigate to: http://localhost:{PORT}")
            print("📝 Press Ctrl+C to stop the server\n")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Please stop any other servers or change the port.")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()