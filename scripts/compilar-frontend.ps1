# Compila el frontend Angular (frontend-angular/dist) si todavia no existe o si se pide con -Forzar.
# Spring Boot empaqueta esa carpeta como contenido estatico. Requiere Node.js 22.12+ o 24+.
param([switch]$Forzar)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$web = Join-Path $projectDir 'frontend-angular'
$index = Join-Path $web 'dist/cabana/browser/index.html'
if ((Test-Path -LiteralPath $index) -and -not $Forzar) { exit 0 }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'Falta Node.js para compilar el frontend Angular. Instala Node 22 LTS o superior desde https://nodejs.org y vuelve a intentar.'
}
Push-Location $web
try {
  if (-not (Test-Path -LiteralPath (Join-Path $web 'node_modules'))) {
    Write-Host 'Instalando dependencias de Angular (solo la primera vez)...'
    & npm ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci fallo.' }
  }
  Write-Host 'Compilando el frontend Angular...'
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw 'La compilacion de Angular fallo.' }
} finally { Pop-Location }
