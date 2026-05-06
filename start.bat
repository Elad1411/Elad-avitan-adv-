@echo off
chcp 65001 >nul
title עו"ד אלעד אביטן - הפעלת האתר
color 0A

echo.
echo  ============================================================
echo    משרד עורכי הדין אלעד אביטן - הפעלת האתר
echo  ============================================================
echo.

:: ---- בדיקת Node.js ----
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

:: ---- התקנת תלויות ----
if not exist "node_modules\" (
    echo.
    echo  [1/3] מתקין תלויות ^(npm install^)...
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
    echo  [OK] תלויות קיימות
)

:: ---- הגדרת מסד נתונים ----
if not exist ".env.local" (
    echo.
    echo  [2/3] מגדיר מסד נתונים ראשוני...
    node scripts/setup-db.js
    echo  [OK] מסד הנתונים הוגדר
) else (
    echo  [OK] מסד נתונים קיים
)

:: ---- בניית האתר ----
if not exist ".next\" (
    echo.
    echo  [3/3] בונה את האתר ^(npm run build^)...
    echo        אנא המתן, עשוי לקחת 2-5 דקות...
    echo.
    call npm run build
    if errorlevel 1 (
        color 0C
        echo.
        echo  [שגיאה] הבנייה נכשלה.
        pause
        exit /b 1
    )
    echo  [OK] האתר נבנה בהצלחה
) else (
    echo  [OK] גרסה בנויה קיימת
)

:: ---- קבלת כתובת IP ----
for /f %%i in ('powershell -NoProfile -Command "try { (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1).IPAddress } catch { '0.0.0.0' }"') do set LOCAL_IP=%%i

echo.
echo  ============================================================
color 0B
echo.
echo   האתר פועל בהצלחה!
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
echo   [פאנל ניהול - admin / admin123]
echo    http://%LOCAL_IP%:3000/admin
echo.
echo   לעצירה: לחץ Ctrl+C
echo  ============================================================
echo.
color 0A

:: ---- פתיחת דפדפן ----
start http://localhost:3000

:: ---- הפעלת השרת ----
npx next start -H 0.0.0.0 -p 3000

pause
