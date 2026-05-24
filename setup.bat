@echo off
title FinTrack Setup
color 0A

echo.
echo ========================================
echo   FINTRACK - SETUP INICIAL
echo ========================================
echo.

echo [1/3] Instalando dependencias del Backend...
cd /d "%~dp0backend"
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Fallo instalacion backend
    pause
    exit /b 1
)
echo [OK] Backend instalado
echo.

echo [2/3] Instalando dependencias del Frontend...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo instalacion frontend
    pause
    exit /b 1
)
echo [OK] Frontend instalado
echo.

echo [3/3] Verificando instalacion...
cd /d "%~dp0backend"
python -c "import fastapi; import sqlalchemy; print('✓ Python deps OK')" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Verificacion Python fallo
    pause
    exit /b 1
)

cd /d "%~dp0frontend"
if exist node_modules\nul (
    echo ✓ Node deps OK
) else (
    echo ERROR: node_modules no encontrado
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ SETUP COMPLETADO EXITOSAMENTE
echo ========================================
echo.
echo Ahora puedes ejecutar: start.bat
echo.
pause
