@echo off
echo GPT-4o Transcription Models Test Script
echo =====================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Check if the OpenAI package is installed locally in tests directory
if not exist "%~dp0node_modules\openai" (
  echo Installing OpenAI package in tests directory...
  cd "%~dp0"
  npm install openai
)

REM Prompt for API key if not already set
if "%OPENAI_API_KEY%"=="" (
  echo Enter your OpenAI API key:
  set /p OPENAI_API_KEY=
)

REM Check if test audio file exists and download if needed
if not exist "%~dp0test-audio.mp3" (
  echo No test audio file found. Attempting to download...
  node "%~dp0download-test-audio.js"
  if not exist "%~dp0test-audio.mp3" (
    echo Failed to download test audio file.
    echo Please download a sample MP3 file and save it as test-audio.mp3 in this directory.
    echo.
    echo You can download sample audio files from:
    echo https://file-examples.com/index.php/sample-audio-files/sample-mp3-download/
    echo.
    pause
    exit /b 1
  )
)

echo Running transcription tests...
echo.

REM Run the test script
node "%~dp0test-gpt4o-transcription.js"

echo.
echo Test complete!
pause 