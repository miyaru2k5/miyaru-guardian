# Continuous sync every 3s: worktree -> D:\AI168\miyaru-guardian
$ErrorActionPreference = "Continue"

$src = "C:\Users\Admin\.grok\worktrees\ai168-miyaru-guardian\profile"
$dst = "D:\AI168\miyaru-guardian"
$logDir = Join-Path $dst "scripts"
$logFile = Join-Path $logDir "watch-sync.log"

function Write-Log {
  param([string]$Msg)
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Msg
  try {
    if (-not (Test-Path $logDir)) {
      New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    Add-Content -Path $logFile -Value $line
  } catch {}
}

if (-not (Test-Path $src)) {
  Write-Log "FATAL: missing worktree $src"
  exit 1
}
if (-not (Test-Path $dst)) {
  New-Item -ItemType Directory -Path $dst -Force | Out-Null
}

Write-Log "=== continuous sync START (every 3s) ==="
Write-Log "FROM $src"
Write-Log "TO   $dst"

while ($true) {
  try {
    & robocopy.exe $src $dst /E /PURGE /XD node_modules .next .git .vercel coverage .turbo /XF bun.lockb watch-sync.log /R:1 /W:1 /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
    $code = $LASTEXITCODE
    foreach ($name in @("proxy.ts", ".eslintrc.json")) {
      $p = Join-Path $dst $name
      if (Test-Path $p) {
        Remove-Item $p -Force -ErrorAction SilentlyContinue
      }
    }
    if ($code -ge 8) {
      Write-Log "robocopy error=$code"
    }
    elseif ($code -gt 0) {
      Write-Log "synced changes robocopy=$code"
    }
  }
  catch {
    Write-Log ("error " + $_.Exception.Message)
  }
  Start-Sleep -Seconds 3
}
