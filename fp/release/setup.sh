#!/bin/bash
set -e

echo "================================"
echo " Inicializando Proyecto Tres3Dos"
echo "================================"
echo

echo "Instalando dependencias del backend..."
cd backend
npm install
echo

echo "Instalando dependencias del frontend..."
cd ../frontend
npm install
echo

echo "Inicializando base de datos..."
cd ../backend/db
node init.js
echo

echo "================================"
echo " ✅ Backend y Frontend listos"
echo "================================"
echo

cd ../../

# Lanzar backend y frontend en terminales separados
echo "Iniciando servidores..."
gnome-terminal -- bash -c "cd backend && npm run backend; exec bash" 2>/dev/null \
|| xterm -e "cd backend && npm run backend" 2>/dev/null \
|| konsole --hold -e "cd backend && npm run backend" 2>/dev/null &

gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash" 2>/dev/null \
|| xterm -e "cd frontend && npm run dev" 2>/dev/null \
|| konsole --hold -e "cd frontend && npm run dev" 2>/dev/null &

echo
echo "Accede a:"
echo "- Backend:  http://localhost:4000"
echo "- Frontend: http://localhost:5173"
echo

read -p "Presiona ENTER para salir..."