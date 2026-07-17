param([int]$Port = 8765)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$builder = Join-Path $PSScriptRoot "build_local_site.ps1"
$site = Join-Path $root "_site"

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $builder

$url = "http://127.0.0.1:$Port/?desktop=latest"
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  try {
    $existing = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
    if ($existing.Content -notmatch "THOUSANDFOLD REALMS") {
      throw "Port $Port is being used by another application."
    }
  } catch {
    throw "The game could not use localhost port $Port because another application is listening there."
  }
} else {
  $python = (Get-Command python.exe -ErrorAction Stop).Source
  $arguments = @("-m", "http.server", "$Port", "--bind", "127.0.0.1", "--directory", "`"$site`"")
  Start-Process -FilePath $python -ArgumentList $arguments -WorkingDirectory $root -WindowStyle Hidden

  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 150
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1
      if ($response.StatusCode -eq 200 -and $response.Content -match "THOUSANDFOLD REALMS") {
        $ready = $true
        break
      }
    } catch {}
  }
  if (-not $ready) {
    throw "The latest local game build did not become ready on $url."
  }
}

Start-Process -FilePath $url
