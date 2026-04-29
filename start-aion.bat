@echo off
setlocal
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=

if exist "%~dp0node_modules\electron\dist\electron.exe" (
  "%~dp0node_modules\electron\dist\electron.exe" .
) else (
  npm start
)
