@echo off
title Inicializador Tres3Dos
echo ================================
echo Inicializando Proyecto Tres3Dos
echo ================================
echo.

echo Instalando dependencias del backend...
cd backend
call npm install
echo.

echo Instalando dependencias del frontend...
cd ../frontend
call npm install
echo.

echo Inicializando base de datos...
cd ../backend/db
call node init.js
echo.

echo ================================
echo ✅ Backend y Frontend listos
echo ================================
echo.

cd ../../
start cmd /k "cd backend && npm run backend"
start cmd /k "cd frontend && npm run dev"

echo Accede a:
echo - Backend:  http://localhost:4000
echo - Frontend: http://localhost:5173
echo.

pause