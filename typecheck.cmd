@echo off
cd /d "%~dp0"
call npm run typecheck
exit /b %ERRORLEVEL%
