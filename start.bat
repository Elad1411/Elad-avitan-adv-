@echo off
chcp 65001 >nul
title עו"ד אלעד אביטן - הפעלת האתר
color 0A

echo.
echo  ============================================================
echo    משרד עורכי הדין אלעד אביטן - הפעלת האתר
echo    גרסה 2.0 - בדיקה עצמית ותיקון אוטומטי
echo  ============================================================
echo.

:: ================================================================
::  STEP 0 - בדיקת Node.js
:: ================================================================
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [שגיאה] Node.js לא מותקן!
    echo.
    echo  הורד והתקן מ: https://nodejs.org
    echo  בחר את הכפתור הירוק LTS והתחל מחדש.
    echo.
    pause
    exit /b 1
)
for /f %%v in ('node --version') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% זוהה

:: בדיקת גרסה מינימלית (22+)
for /f "tokens=1 delims=." %%a in ('node --version') do set MAJOR_VER=%%a
set MAJOR_VER=%MAJOR_VER:v=%
if %MAJOR_VER% LSS 18 (
    color 0C
    echo.
    echo  [שגיאה] Node.js %NODE_VER% ישן מדי. נדרש גרסה 22 ומעלה.
    echo  הורד מ: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: ================================================================
::  STEP 1 - ניקוי גרסאות שבורות
:: ================================================================
echo.
echo  [בדיקה] בודק תקינות node_modules...

:: בדוק אם next קיים ועובד
if exist "node_modules\.bin\next.cmd" (
    node node_modules\.bin\next --version >nul 2>&1
    if errorlevel 1 (
        echo  [ניקוי] node_modules שבור - מוחק ומתקין מחדש...
        rmdir /s /q node_modules 2>nul
        if exist "package-lock.json" del /f /q package-lock.json 2>nul
    ) else (
        echo  [OK] node_modules תקין
    )
) else (
    if exist "node_modules" (
        echo  [ניקוי] node_modules חסר קבצי Next.js - מוחק...
        rmdir /s /q node_modules 2>nul
        if exist "package-lock.json" del /f /q package-lock.json 2>nul
    )
)

:: ================================================================
::  STEP 2 - התקנת תלויות
:: ================================================================
if not exist "node_modules\" (
    echo.
    echo  [1/4] מתקין תלויות ^(npm install^)...
    echo        אנא המתן, עשוי לקחת מספר דקות...
    echo.
    npm install
    if errorlevel 1 (
        color 0C
        echo.
        echo  [שגיאה] ההתקנה נכשלה. נסה שוב.
        pause
        exit /b 1
    )
    echo  [OK] התלויות הותקנו בהצלחה
) else (
    echo  [OK] תלויות קיימות ותקינות
)

:: ================================================================
::  STEP 3 - הגדרת מסד נתונים
:: ================================================================
if not exist ".env.local" (
    echo.
    echo  [2/4] מגדיר מסד נתונים ראשוני...
    node scripts/setup-db.js
    if errorlevel 1 (
        color 0C
        echo  [שגיאה] הגדרת מסד הנתונים נכשלה.
        pause
        exit /b 1
    )
    echo  [OK] מסד הנתונים הוגדר
) else (
    echo  [OK] מסד נתונים קיים
    :: בדוק שקובץ הDB קיים, אם לא - הרץ שוב
    if not exist "data\law.db" (
        echo  [תיקון] קובץ DB חסר - מריץ הגדרה מחדש...
        node scripts/setup-db.js
    )
)

:: ================================================================
::  STEP 4 - בדיקת עצמית (Self-Audit)
:: ================================================================
echo.
echo  [3/4] בדיקה עצמית של קבצי הפרויקט...
set AUDIT_FAIL=0

call :CHECK_FILE "app\page.js"             "דף ראשי"
call :CHECK_FILE "app\layout.js"           "Layout"
call :CHECK_FILE "app\globals.css"         "עיצוב"
call :CHECK_FILE "middleware.js"           "Middleware"
call :CHECK_FILE "lib\db.js"              "מסד נתונים"
call :CHECK_FILE "app\api\auth\[...nextauth]\route.js"  "Auth API"
call :CHECK_FILE "scripts\setup-db.js"    "Setup script"
call :CHECK_FILE ".env.local"             "הגדרות סביבה"

if %AUDIT_FAIL%==1 (
    color 0C
    echo.
    echo  [שגיאה] קבצים חסרים - הפרויקט לא שלם.
    echo  נסה: git pull
    echo.
    pause
    exit /b 1
)
echo  [OK] כל קבצי הפרויקט תקינים

:: ================================================================
::  STEP 5 - בנייה (מנקה ובונה מחדש אם שבורה)
:: ================================================================

:: בדוק אם .next שבור
if exist ".next\" (
    if not exist ".next\BUILD_ID" (
        echo  [ניקוי] תיקיית .next שבורה - מוחק ובונה מחדש...
        rmdir /s /q .next 2>nul
    )
)

if not exist ".next\" (
    echo.
    echo  [4/4] בונה את האתר ^(npm run build^)...
    echo        אנא המתן, עשוי לקחת 2-5 דקות...
    echo.
    call npm run build
    if errorlevel 1 (
        color 0C
        echo.
        echo  [שגיאה] הבנייה נכשלה. מנקה ומנסה שנית...
        rmdir /s /q .next 2>nul
        call npm run build
        if errorlevel 1 (
            color 0C
            echo  [שגיאה] הבנייה נכשלה שוב. בדוק שגיאות מעל.
            pause
            exit /b 1
        )
    )
    echo  [OK] האתר נבנה בהצלחה
) else (
    echo  [OK] גרסה בנויה קיימת ותקינה
)

:: ================================================================
::  STEP 6 - קבלת כתובת IP
:: ================================================================
for /f %%i in ('powershell -NoProfile -Command "try { (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1).IPAddress } catch { 'לא נמצא' }"') do set LOCAL_IP=%%i

:: ================================================================
::  הכל תקין - מפעיל
:: ================================================================
echo.
echo  ============================================================
color 0B
echo.
echo   כל הבדיקות עברו בהצלחה!
echo   האתר עולה...
echo.
echo   [מחשב זה]
echo    http://localhost:3000
echo.
echo   [גישה מהנייד - אותו WiFi]
echo    http://%LOCAL_IP%:3000
echo.
echo   [פורטל לקוחות]
echo    http://%LOCAL_IP%:3000/portal
echo.
echo   [פאנל ניהול]
echo    http://%LOCAL_IP%:3000/admin
echo    משתמש: admin  סיסמה: admin123
echo.
echo   לעצירה: לחץ Ctrl+C
echo  ============================================================
echo.
color 0A

:: פתח דפדפן
start http://localhost:3000

:: הפעל שרת
npx next start -H 0.0.0.0 -p 3000

pause
goto :EOF

:: ================================================================
::  פונקציית בדיקת קובץ
:: ================================================================
:CHECK_FILE
if not exist %1 (
    echo  [חסר] %~2 ^(%~1^)
    set AUDIT_FAIL=1
) else (
    echo  [OK]  %~2
)
goto :EOF
