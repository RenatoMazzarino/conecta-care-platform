$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'docs-link-check.mjs'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error 'Node.js nao encontrado no PATH. Instale Node 24.x para rodar o link-check.'
  exit 1
}
node $script
