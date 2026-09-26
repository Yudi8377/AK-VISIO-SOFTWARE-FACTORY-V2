@echo off
setlocal
title AK Repo Studio
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js 24.x belum terpasang.
  echo Install Node.js 24 LTS, lalu jalankan launcher ini kembali.
  pause
  exit /b 1
)
echo Starting AK Repo Studio...
start "" "http://127.0.0.1:4317"
node server.mjs
pause
