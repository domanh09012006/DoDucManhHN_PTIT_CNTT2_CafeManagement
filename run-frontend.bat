@echo off
echo ================================================================
echo   CMS - Cafe Management System
echo   Frontend Dev Server
echo ================================================================
echo.

set "PATH=D:\CoffeeManagement\node_shim;%PATH%"
set "NODE=C:\Users\HPC\AppData\Local\ms-playwright-go\1.57.0\node.exe"
set "NPM=D:\CoffeeManagement\npm_pkg\package\bin\npm-cli.js"

echo [1/1] Starting Vite dev server at http://localhost:5173 ...
%NODE% %NPM% run dev
pause
