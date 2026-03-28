@echo off
setlocal
cd /d "%~dp0"

if not exist "package.json" (
  echo.
  echo [IrisComm] package.json not found. Open the inner IrisCommieMommi folder, not __MACOSX.
  echo.
  pause
  exit /b 1
)

echo [IrisComm] npm install in:
echo %CD%
echo.
call npm install
if errorlevel 1 pause
