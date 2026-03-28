@echo off
cd /d "%~dp0"
if not exist "package.json" (
  echo Open the inner IrisCommieMommi folder ^(not __MACOSX^).
  pause
  exit /b 1
)
echo Freeing dev ports, then starting Next.js...
call npm run dev:free
