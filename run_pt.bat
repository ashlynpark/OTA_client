@echo off
setlocal enabledelayedexpansion

echo Opening Command Prompt...
echo.

echo Navigating to the project directory...
echo.

cd /d "server"

echo.
echo Running 'npm start' on server...
echo.

start cmd /k "npm start"

cd /d "..\client"

echo.
echo Running 'npm start' on client...
echo.

start cmd /k "npm start"

echo.
echo Batch script execution complete.
pause
