@echo off
cd /d "%~dp0"
set "SPRING_PROFILES_ACTIVE=demo"
echo Abre http://localhost:8080 en tu navegador cuando termine el inicio.
if exist "%~dp0cabana.jar" (
  java -jar "%~dp0cabana.jar"
) else (
  echo Iniciando desde el codigo fuente. La primera vez descarga Maven y las dependencias.
  cd /d "%~dp0backend"
  call mvnw.cmd spring-boot:run
)
pause
