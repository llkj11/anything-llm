#!/bin/bash

echo "GPT-4o Transcription Models Test Script"
echo "====================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed or not in PATH."
  echo "Please install Node.js from https://nodejs.org/"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if the OpenAI package is installed in tests directory
if [ ! -d "$SCRIPT_DIR/node_modules/openai" ]; then
  echo "Installing OpenAI package in tests directory..."
  cd "$SCRIPT_DIR"
  npm install openai
fi

# Prompt for API key if not already set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Enter your OpenAI API key:"
  read -r OPENAI_API_KEY
  export OPENAI_API_KEY
fi

# Check if test audio file exists and download if needed
if [ ! -f "$SCRIPT_DIR/test-audio.mp3" ]; then
  echo "No test audio file found. Attempting to download..."
  node "$SCRIPT_DIR/download-test-audio.js"
  
  if [ ! -f "$SCRIPT_DIR/test-audio.mp3" ]; then
    echo "Failed to download test audio file."
    echo "Please download a sample MP3 file and save it as test-audio.mp3 in this directory."
    echo
    echo "You can download sample audio files from:"
    echo "https://file-examples.com/index.php/sample-audio-files/sample-mp3-download/"
    echo
    read -rp "Press Enter to exit..."
    exit 1
  fi
fi

echo "Running transcription tests..."
echo

# Run the test script
node "$SCRIPT_DIR/test-gpt4o-transcription.js"

echo
echo "Test complete!"
read -rp "Press Enter to exit..." 