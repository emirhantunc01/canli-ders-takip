@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 veya ustu kurulmali.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm install
  if errorlevel 1 (pause & exit /b 1)
)
node scripts/start.mjs
