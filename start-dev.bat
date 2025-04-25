@echo off
title AnythingLLM Development Environment
color 0B

:: Ensure working directory is the script's folder
cd /d "%~dp0"

:: Check Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ERROR: Node.js is not installed! Please install Node.js 18+.
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=2 delims=v." %%a in ('node -v') do set "NODE_MAJOR=%%a"
echo Detected Node.js major version: %NODE_MAJOR%
if %NODE_MAJOR% LSS 18 (
    color 0C
    echo ERROR: Node.js version 18+ is required. You have version %NODE_MAJOR%.
    pause
    exit /b 1
)

:: Install server dependencies
echo Installing server dependencies...
pushd server
npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo Failed to install server dependencies.
    pause
    exit /b 1
)
popd

:: Install frontend dependencies
echo Installing frontend dependencies...
pushd frontend
npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo Failed to install frontend dependencies.
    pause
    exit /b 1
)
popd

:: Start server and frontend in separate cmd windows
echo Starting AnythingLLM server...
start "AnythingLLM Server" cmd /k "cd server && npm run dev"

echo Starting AnythingLLM frontend...
start "AnythingLLM Frontend" cmd /k "cd frontend && npm start"

:: Wait a moment for servers to start
timeout /t 5 >nul

:: Open frontend in default browser
echo Opening frontend in browser...
start "" http://localhost:5173

echo.
echo Development environment is up and running.
echo You can use the server at http://localhost:3001
echo.
pause
exit /b 0