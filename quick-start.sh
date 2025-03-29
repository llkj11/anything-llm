#!/bin/bash
# quick-start.sh - A script to simplify working with AnythingLLM

# Color codes for prettier output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display banner
echo -e "${BLUE}┌─────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│               AnythingLLM                   │${NC}"
echo -e "${BLUE}│         Quick Start Helper Script           │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────┘${NC}"
echo ""

# Function to check if Node.js is installed
check_node() {
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed! Please install Node.js 18+ and try again.${NC}"
    exit 1
  fi
  
  # Check node version
  NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version 18+ is required. You have version $(node -v)${NC}"
    exit 1
  fi
}

# Function to clean up running processes
cleanup() {
  # Find and kill node processes related to our app
  echo -e "${YELLOW}Cleaning up any existing AnythingLLM processes...${NC}"
  
  if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash or CMD)
    taskkill //F //IM node.exe //FI "WINDOWTITLE eq *AnythingLLM*" > /dev/null 2>&1
  else
    # Unix-like systems
    pkill -f "node.*anything-llm" > /dev/null 2>&1
  fi
  
  echo -e "${GREEN}Cleanup complete.${NC}"
}

# Function to install dependencies
install_dependencies() {
  echo -e "${YELLOW}Installing dependencies...${NC}"
  
  # Install server dependencies
  cd server && npm install --legacy-peer-deps
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install server dependencies.${NC}"
    exit 1
  fi
  
  # Install frontend dependencies
  cd ../frontend && npm install --legacy-peer-deps
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install frontend dependencies.${NC}"
    exit 1
  fi
  
  cd ..
  echo -e "${GREEN}Dependencies installed successfully.${NC}"
}

# Function to start the server
start_server() {
  echo -e "${YELLOW}Starting AnythingLLM server...${NC}"
  
  cleanup
  
  # Start server in development mode
  cd server && npm run dev &
  
  # Wait for server to start
  sleep 3
  
  echo -e "${GREEN}Server running at:${NC} http://localhost:3001"
  echo -e "${YELLOW}Press Ctrl+C to stop the server.${NC}"
  
  # Keep script running
  wait
}

# Main menu
show_menu() {
  echo -e "${BLUE}Choose an option:${NC}"
  echo "1) Start AnythingLLM server"
  echo "2) Install/update dependencies"
  echo "3) Clean up running processes"
  echo "4) Exit"
  
  read -p "Enter your choice [1-4]: " choice
  
  case $choice in
    1)
      check_node
      start_server
      ;;
    2)
      check_node
      install_dependencies
      show_menu
      ;;
    3)
      cleanup
      show_menu
      ;;
    4)
      echo -e "${GREEN}Goodbye!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid option. Please try again.${NC}"
      show_menu
      ;;
  esac
}

# Handle CTRL+C gracefully
trap cleanup EXIT

# Start the menu
check_node
show_menu 