$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$docsRoot = Join-Path $root 'docs'
$mdFiles = Get-ChildItem -Path $docsRoot -Recurse -Filter *.md
$results = New-Object System.Collections.Generic.List[object]
$broken = New-Object System.Collections.Generic.List[object]
foreach ($file in $mdFiles) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  $regex = '\]\((?!https?:|mailto:|#|/)([^)]+)\)'
  foreach ($m in [regex]::Matches($content, $regex)) {
    $rel = $m.Groups[1].Value
    $pathPart = $rel.Split('#')[0].Split('?')[0]
    $candidate = $pathPart -replace '/', [IO.Path]::DirectorySeparatorChar
    $target = Join-Path $file.DirectoryName $candidate
    $exists = Test-Path -LiteralPath $target
    $obj = [pscustomobject]@{File=$file.FullName; Link=$rel; Resolved=$target; Exists=$exists}
    [void]$results.Add($obj)
    if (-not $exists) { [void]$broken.Add($obj) }
  }
}
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# Relatório de Verificação de Links da Documentação') | Out-Null
$lines.Add('') | Out-Null
$lines.Add('Data: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Out-Null
$lines.Add('') | Out-Null
if ($broken.Count -eq 0) {
  $lines.Add('**Nenhum link relativo quebrado encontrado.**') | Out-Null
} else {
  $lines.Add('## Links Quebrados') | Out-Null
  foreach ($b in $broken) {
    $relPath = $b.File.Replace($root + [IO.Path]::DirectorySeparatorChar, '')
    $lines.Add('- ['+$relPath+'] link: "' + $b.Link + '" -> resolved: "' + $b.Resolved + '"') | Out-Null
  }
}
$lines.Add('') | Out-Null
$lines.Add('## Amostra de Links Verificados') | Out-Null
$sample = $results | Select-Object -First 200
foreach ($r in $sample) {
  $relPath = $r.File.Replace($root + [IO.Path]::DirectorySeparatorChar, '')
  $lines.Add('- ['+$relPath+'] -> "' + $r.Link + '" -> ' + ($(if($r.Exists){'OK'} else {'BROKEN'}))) | Out-Null
}
$reportDir = Join-Path $docsRoot 'reviews'
if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir | Out-Null }
$dest = Join-Path $reportDir 'DOCS_LINK_CHECK.md'
$lines.ToArray() -join "`n" | Out-File -Encoding UTF8 -LiteralPath $dest
if ($broken.Count -gt 0) {
  Write-Error ("Link-check encontrou {0} link(s) quebrado(s)." -f $broken.Count)
  exit 1
}
Write-Host ("OK: {0} links verificados. Relatório em {1}" -f $results.Count, $dest)
