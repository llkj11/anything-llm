@echo off
title AnythingLLM Quick Start

:: Change to script directory
cd /d "%~dp0"

:: Delegate to start-dev.bat
if exist start-dev.bat (
    call start-dev.bat
) else (
    echo ERROR: start-dev.bat not found. Please ensure it is in the same folder.
)
pause