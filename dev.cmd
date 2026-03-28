@echo off
setlocal
cd /d "%~dp0"

if not exist "package.json" (
  echo.
  echo [IrisComm] package.json not found in this folder.
  echo Run this file from: IrisComms2\IrisCommieMommi\IrisCommieMommi
  echo Do NOT use the __MACOSX folder — it has no app code.
  echo.
  pause
  exit /b 1
)

echo [IrisComm] Starting dev server from:
echo %CD%
echo.
call npm run dev
