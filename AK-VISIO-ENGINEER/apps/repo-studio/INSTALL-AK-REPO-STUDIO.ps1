$ErrorActionPreference="Stop"
$root=Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "AK Repo Studio installer/bootstrap"
$v=$null
try { $v=node --version 2>$null } catch {}
if(-not $v){ Write-Host "Node.js 24.x is required. Install Node.js 24 LTS first." -ForegroundColor Yellow; exit 1 }
if(-not $v.StartsWith("v24.")){ Write-Host "Detected $v. This project targets Node.js 24.x." -ForegroundColor Yellow }
Write-Host "Ready. Double-click RUN-AK-REPO-STUDIO.bat to launch." -ForegroundColor Green
