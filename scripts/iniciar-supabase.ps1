$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectDir 'backend/.env'
if (!(Test-Path -LiteralPath $envFile)) { throw 'Copia backend/.env.example a backend/.env y completa tus datos de Supabase.' }
foreach ($line in Get-Content -LiteralPath $envFile) {
  if ($line.Trim() -eq '' -or $line.TrimStart().StartsWith('#')) { continue }
  $parts = $line.Split('=', 2)
  if ($parts.Count -eq 2) { [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim().Trim('"').Trim("'"), 'Process') }
}
$env:SPRING_PROFILES_ACTIVE = 'supabase'
Push-Location (Join-Path $projectDir 'backend')
try { & .\mvnw.cmd spring-boot:run } finally { Pop-Location }
