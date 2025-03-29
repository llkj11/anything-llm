@echo off
title AnythingLLM Quick Start Helper
color 0B

:: Display banner
echo.
echo  AnythingLLM Quick Start Helper Script
echo  =====================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ERROR: Node.js is not installed! Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set node_major=%%a
)
set node_major=%node_major:~1%
if %node_major% LSS 18 (
    color 0C
    echo ERROR: Node.js version 18+ is required. You have version %node_major%
    pause
    exit /b 1
)

:menu
cls
color 0B
echo.
echo  AnythingLLM Quick Start Helper Script
echo  =====================================
echo.
echo  Choose an option:
echo  1) Start AnythingLLM server
echo  2) Install/update dependencies
echo  3) Clean up running processes
echo  4) Exit
echo.

set /p choice=Enter your choice [1-4]: 

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto install_dependencies
if "%choice%"=="3" goto cleanup
if "%choice%"=="4" goto exit
goto invalid_choice

:invalid_choice
color 0C
echo Invalid option. Please try again.
timeout /t 2 >nul
goto menu

:cleanup
echo.
echo Cleaning up any existing AnythingLLM processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *AnythingLLM*" >nul 2>nul
echo Cleanup complete.
timeout /t 2 >nul
goto menu

:install_dependencies
echo.
echo Installing dependencies...
cd server && npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo Failed to install server dependencies.
    pause
    exit /b 1
)

cd ..\frontend && npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo Failed to install frontend dependencies.
    pause
    exit /b 1
)

cd ..
echo Dependencies installed successfully.
timeout /t 2 >nul
goto menu

:start_server
echo.
echo Starting AnythingLLM server...
call :cleanup
cd server
START "AnythingLLM Server" cmd /c npm run dev
echo.
color 0A
echo Server running at: http://localhost:3001
echo Press any key to stop the server and return to menu...
pause >nul
call :cleanup
goto menu

:exit
echo.
color 0A
echo Goodbye!
timeout /t 2 >nul
exit /b 0 