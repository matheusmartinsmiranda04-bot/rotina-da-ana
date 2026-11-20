@echo off
rem Abre a Rotina da Ana no navegador, iniciando o servidor local (somente neste computador).
cd /d "%~dp0"
start "Rotina da Ana - servidor" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0servidor.ps1"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8787/"
