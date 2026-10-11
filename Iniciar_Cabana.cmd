@echo off
cd /d "%~dp0"
set "SPRING_PROFILES_ACTIVE=demo"
if not defined PORT set "PORT=8080"
set "FRONTEND_ORIGIN=http://localhost:%PORT%"
echo Abre http://localhost:%PORT% en tu navegador cuando termine el inicio.
if exist "%~dp0cabana.jar" (
  java -jar "%~dp0cabana.jar"
) else (
  echo Iniciando desde el codigo fuente. La primera vez descarga Maven y las dependencias.
  cd /d "%~dp0backend"
  call mvnw.cmd spring-boot:run
)
pause
