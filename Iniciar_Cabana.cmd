@echo off
cd /d "%~dp0"
if exist "%~dp0backend\.env" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-supabase.ps1"
) else (
  set "SPRING_PROFILES_ACTIVE=demo"
  if not defined PORT set "PORT=8080"
  call :demo
)
pause
exit /b

:demo
set "FRONTEND_ORIGIN=http://localhost:%PORT%"
echo Abre http://localhost:%PORT% en tu navegador cuando termine el inicio.
if exist "%~dp0cabana.jar" (
  java -jar "%~dp0cabana.jar"
) else (
  echo Iniciando desde el codigo fuente. La primera vez descarga Maven y las dependencias.
  cd /d "%~dp0backend"
  call mvnw.cmd spring-boot:run
)
exit /b
