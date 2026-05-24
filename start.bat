@echo off
title FinTrack Start
color 0B

echo.
echo ========================================
echo   FINTRACK - INICIANDO SERVIDORES
echo ========================================
echo.

echo [1/2] Iniciando Backend (puerto 8000)...
start cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak

echo [2/2] Iniciando Frontend (puerto 5173)...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   ✓ SERVIDORES INICIADOS
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo Docs API: http://localhost:8000/docs
echo.
echo Las ventanas se cerraran cuando termine cada servidor.
echo Presiona cualquier tecla para cerrar esta ventana...
echo.
pause
