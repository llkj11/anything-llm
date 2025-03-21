@echo off
echo Audio Format Converter for OpenAI Transcription
echo ==============================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

REM Check if ffmpeg is installed
where ffmpeg >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: ffmpeg is not installed or not in PATH.
  echo The conversion script requires ffmpeg.
  echo Please install ffmpeg from https://ffmpeg.org/download.html
  echo.
  echo Press any key to continue anyway...
  pause >nul
)

echo Running audio converter...
echo.

REM Run the converter script
node "%~dp0audio-format-converter.js"

echo.
echo Conversion complete!
pause 