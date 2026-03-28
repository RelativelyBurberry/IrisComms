@echo off
setlocal
cd /d "%~dp0"
if not exist "package.json" (
  echo Wrong folder. Use the inner IrisCommieMommi folder with package.json.
  pause
  exit /b 1
)
echo Freeing common dev ports (Next, Vite, webpack, Node inspect^)...
call npm run ports:free
exit /b %ERRORLEVEL%
