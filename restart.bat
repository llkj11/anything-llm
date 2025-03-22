@echo off
echo Stopping any running processes...
taskkill /F /IM node.exe /T 2>nul

echo Cleaning Vite cache...
cd frontend
if exist "node_modules\.vite" (
    rmdir /S /Q "node_modules\.vite"
)

echo Starting the backend server...
start cmd /c "cd server && node index.js"

echo Waiting for server to start...
timeout /t 5

echo Starting the frontend with forced dependency optimization...
start cmd /c "cd frontend && npx vite --force"

echo Done! Please wait for both processes to start.
echo Server running on http://localhost:3264
echo Frontend running on http://localhost:5173 