$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$env:SPRING_PROFILES_ACTIVE = 'demo'
Push-Location (Join-Path $projectDir 'backend')
try {
  $jarPath = Join-Path $projectDir 'cabana.jar'
  if (Test-Path -LiteralPath $jarPath) { & java -jar $jarPath }
  else { & .\mvnw.cmd spring-boot:run }
} finally { Pop-Location }
