$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectDir 'backend/.env'
$requestedPort = $env:PORT
if (!(Test-Path -LiteralPath $envFile)) { throw 'Copia backend/.env.example a backend/.env y completa tus datos de Supabase.' }
foreach ($line in Get-Content -LiteralPath $envFile) {
  if ($line.Trim() -eq '' -or $line.TrimStart().StartsWith('#')) { continue }
  $parts = $line.Split('=', 2)
  if ($parts.Count -eq 2) {
    $value = $parts[1].Trim()
    if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) { $value = $value.Substring(1, $value.Length - 2) }
    [Environment]::SetEnvironmentVariable($parts[0].Trim(), $value, 'Process')
  }
}
foreach ($required in @('SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_DB_URL','SUPABASE_DB_USER','SUPABASE_DB_PASSWORD')) {
  $value = [Environment]::GetEnvironmentVariable($required, 'Process')
  if ([string]::IsNullOrWhiteSpace($value) -or $value.StartsWith('TU-')) { throw "Falta completar $required en backend/.env." }
}
if ($requestedPort) { $env:PORT = $requestedPort }
if (!$env:PORT) { $env:PORT = '8081' }
$portNumber = 0
if (![int]::TryParse($env:PORT, [ref]$portNumber) -or $portNumber -lt 1 -or $portNumber -gt 65535) { throw 'PORT debe ser un numero entre 1 y 65535.' }
if (!$env:FRONTEND_ORIGIN -or $env:FRONTEND_ORIGIN -match '^http://(localhost|127\.0\.0\.1)(:\d+)?$') { $env:FRONTEND_ORIGIN = "http://localhost:$portNumber" }
$env:SPRING_PROFILES_ACTIVE = 'supabase'
$listener = Get-NetTCPConnection -LocalPort $portNumber -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  try {
    $running = Invoke-RestMethod -Uri "http://localhost:$portNumber/api/config" -TimeoutSec 3
    if ($running.name -like 'Caba*' -and $running.demo -eq $false) {
      Write-Host "Cabana con Supabase ya esta funcionando: http://localhost:$portNumber/pages/inicio.html"
      exit 0
    }
  } catch {}
  throw "El puerto $portNumber esta ocupado. Cierra la consola del servidor anterior con Ctrl+C o elige otro puerto con `$env:PORT='8082'."
}
Write-Host "Iniciando Cabana conectado a Supabase. Abre http://localhost:$portNumber/pages/inicio.html"
$exitCode = 0
Push-Location $projectDir
try {
  $jarPath = Join-Path $projectDir 'cabana.jar'
  if (Test-Path -LiteralPath $jarPath) { & java -jar $jarPath }
  else {
    Set-Location (Join-Path $projectDir 'backend')
    & .\mvnw.cmd spring-boot:run
  }
  $exitCode = $LASTEXITCODE
} finally { Pop-Location }
exit $exitCode
