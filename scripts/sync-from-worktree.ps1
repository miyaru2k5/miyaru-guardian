# One-shot sync: Grok worktree -> D:\AI168\miyaru-guardian
$ErrorActionPreference = "Stop"

$src = "C:\Users\Admin\.grok\worktrees\ai168-miyaru-guardian\profile"
$dst = "D:\AI168\miyaru-guardian"

if (-not (Test-Path $src)) { Write-Error "Worktree not found: $src" }
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }

& robocopy $src $dst /E /PURGE `
  /XD node_modules .next .git .vercel coverage .turbo `
  /XF bun.lockb watch-sync.log `
  /R:1 /W:1 /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

$code = $LASTEXITCODE
if ($code -ge 8) { Write-Error "robocopy failed with exit $code" }

@("proxy.ts", ".eslintrc.json") | ForEach-Object {
  $p = Join-Path $dst $_
  if (Test-Path $p) { Remove-Item $p -Force -ErrorAction SilentlyContinue }
}

Write-Host ("[{0}] Synced -> {1} (robocopy={2})" -f (Get-Date -Format "HH:mm:ss"), $dst, $code)
exit 0
