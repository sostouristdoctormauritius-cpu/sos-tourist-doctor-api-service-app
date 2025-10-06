@echo off
TITLE Restart Refactored Services

ECHO =================================================================
ECHO  Stopping services for refactored API...
ECHO =================================================================

ECHO.
ECHO Stopping process on port 3000 (Refactored API)...
FOR /f "tokens=5" %%a IN ('netstat -ano ^| findstr :3000') DO (
    ECHO Killing process %%a on port 3000
    taskkill /PID %%a /F 2>nul
)

ECHO. 
ECHO Stopping process on port 54321 (Supabase API)...
FOR /f "tokens=5" %%a IN ('netstat -ano ^| findstr :54321') DO (
    ECHO Killing process %%a on port 54321
    taskkill /PID %%a /F 2>nul
)

ECHO.
ECHO Stopping process on port 54322 (Supabase DB)...
FOR /f "tokens=5" %%a IN ('netstat -ano ^| findstr :54322') DO (
    ECHO Killing process %%a on port 54322
    taskkill /PID %%a /F 2>nul
)

ECHO.
ECHO Stopping Supabase...
REM Ensure you are in the correct directory to run supabase commands if they are not global
cd /d "C:\Users\deven\Desktop\SOS\sos-tourist-doctor-api-refactored"
supabase stop

ECHO.
ECHO Note: Docker Desktop should be manually stopped if needed
ECHO.
ECHO Waiting for services to stop...
timeout /t 5 /nobreak

ECHO =================================================================
ECHO  Starting services for refactored API...
ECHO =================================================================

ECHO.
ECHO Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

ECHO.
ECHO Waiting for Docker to start...
timeout /t 20 /nobreak

ECHO.
ECHO Starting Supabase...
REM Ensure you are in the correct directory to run supabase commands if they are not global
cd /d "C:\Users\deven\Desktop\SOS\sos-tourist-doctor-api-refactored"
supabase start

ECHO.
ECHO Waiting for Supabase to initialize...
timeout /t 10 /nobreak

ECHO.
ECHO Starting refactored API server...
cd /d "C:\Users\deven\Desktop\SOS\sos-tourist-doctor-api-refactored"
start "refactored-api" cmd /k "npm start"

ECHO.
ECHO =================================================================
ECHO  All services started for refactored API.
ECHO =================================================================