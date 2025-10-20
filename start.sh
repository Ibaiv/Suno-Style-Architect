#!/bin/bash
echo "🎵 Starting Suno Style Architect..."
echo "📂 Current directory: $(pwd)"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    exit 1
fi

echo "🐍 Python version: $(python3 --version)"
echo ""

# Start the server
echo "🚀 Launching server..."
python3 server.py