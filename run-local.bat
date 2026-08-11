@echo off
setlocal

rem ---------------------------------------------------------------------------
rem  Runs the wedding site on this computer for testing.
rem
rem    Double-click this file            -> live dev server, edits appear instantly
rem    run-local.bat preview             -> builds and serves the REAL deployed site
rem    run-local.bat check               -> checks the setup and exits
rem ---------------------------------------------------------------------------

cd /d "%~dp0"

echo.
echo   The Kluang Line - local test server
echo   ===================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo   Node.js is not installed.
    echo   Get the LTS version from https://nodejs.org then run this again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do echo   Node %%v

if not exist "node_modules\" (
    echo.
    echo   First run - installing dependencies. This takes a minute.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo   Install failed. Read the messages above.
        pause
        exit /b 1
    )
)

set "ENVOK=no"
if exist ".env" set "ENVOK=yes"
if exist ".env.local" set "ENVOK=yes"

if "%ENVOK%"=="yes" (
    echo   Supabase keys found.
) else (
    echo.
    echo   NOTE: no .env or .env.local file here.
    echo   The site will still run, but the RSVP form cannot save and will
    echo   tell guests to WhatsApp you instead.
    echo   To fix: copy .env.example to .env.local and paste your two
    echo   Supabase values into it.
)

if /i "%~1"=="check" (
    echo.
    echo   Setup looks fine. Run this file without "check" to start the server.
    echo.
    pause
    exit /b 0
)

if /i "%~1"=="preview" goto preview

echo.
echo   Starting the dev server. Your browser will open by itself.
echo   Any edit you save shows up immediately - no need to restart.
echo.
echo   To test on your actual phone, connect it to the same Wi-Fi and open
echo   the "Network" address printed below. This is the best way to check
echo   the site, since most guests will open it on a phone.
echo.
echo   Press Ctrl+C to stop, then answer Y.
echo.
call npm run dev -- --host --open
goto done

:preview
echo.
echo   Building the real site, then serving exactly what gets deployed.
echo   Use this to check the finished build before pushing to GitHub.
echo.
call npm run build
if errorlevel 1 (
    echo.
    echo   Build failed. Read the messages above.
    pause
    exit /b 1
)
echo.
echo   Press Ctrl+C to stop, then answer Y.
echo.
call npm run preview -- --host --open

:done
echo.
echo   Server stopped.
pause
endlocal
