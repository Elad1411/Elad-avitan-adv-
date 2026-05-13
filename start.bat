@echo off
chcp 65001 >nul

echo.
echo  ============================================================
echo    Elad Avitan Law - Starting Website
echo  ============================================================
echo.

:: ---- Check Node.js ----
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js is not installed!
    echo.
    echo  Download from: https://nodejs.org
    echo  Choose the green LTS button and restart.
    echo.
    pause
    exit /b 1
)
for /f %%v in ('node --version') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% found

:: ---- Clean broken node_modules ----
if exist "node_modules\" (
    if not exist "node_modules\.bin\next.cmd" (
        echo  [FIX] Broken node_modules - removing...
        rmdir /s /q node_modules
        if exist "package-lock.json" del /f /q package-lock.json
    ) else (
        echo  [OK] node_modules OK
    )
)

:: ---- Install dependencies ----
if not exist "node_modules\" (
    echo.
    echo  [1/3] Installing dependencies...
    echo        Please wait, may take a few minutes...
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo  [ERROR] npm install failed. See errors above.
        pause
        exit /b 1
    )
    echo  [OK] Dependencies installed
)

:: ---- Setup database ----
if not exist ".env.local" (
    echo.
    echo  [2/3] Setting up database...
    node scripts/setup-db.js
    if errorlevel 1 (
        echo  [ERROR] Database setup failed.
        pause
        exit /b 1
    )
    echo  [OK] Database ready
) else (
    echo  [OK] Database exists
    if not exist "data\law.db" (
        echo  [FIX] DB file missing - repairing...
        node scripts/setup-db.js
    )
)

:: ---- Clean broken build ----
if exist ".next\" (
    if not exist ".next\BUILD_ID" (
        echo  [FIX] Broken build folder - removing...
        rmdir /s /q .next
    )
)

:: ---- Build ----
if not exist ".next\" (
    echo.
    echo  [3/3] Building website...
    echo        Please wait, may take 2-5 minutes...
    echo.
    call npm run build
    if errorlevel 1 (
        echo.
        echo  [ERROR] Build failed. Check errors above.
        pause
        exit /b 1
    )
    echo  [OK] Website built
) else (
    echo  [OK] Build exists
)

:: ---- Get local IP using ipconfig ----
set LOCAL_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set RAW=%%a
    set RAW=%RAW: =%
    if not defined LOCAL_IP set LOCAL_IP=%RAW%
)
if not defined LOCAL_IP set LOCAL_IP=YOUR-PC-IP

echo.
echo  ============================================================
echo.
echo   Website is running!
echo.
echo   [This computer]    http://localhost:3000
echo   [Mobile - WiFi]    http://%LOCAL_IP%:3000
echo   [Client portal]    http://%LOCAL_IP%:3000/portal
echo   [Admin panel]      http://%LOCAL_IP%:3000/admin
echo   [Admin login]      admin / admin123
echo.
echo   Press Ctrl+C to stop
echo  ============================================================
echo.

start http://localhost:3000

npx next start -H 0.0.0.0 -p 3000

pause
