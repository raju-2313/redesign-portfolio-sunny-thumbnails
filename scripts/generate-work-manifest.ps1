$projectRoot = Split-Path -Parent $PSScriptRoot
$thumbnailDirectory = Join-Path $projectRoot 'assets\images\thumbnails'
$manifestPath = Join-Path $projectRoot 'js\data\thumbnails.js'
$files = Get-ChildItem -Path $thumbnailDirectory -File |
  Where-Object { $_.Extension -match '^\.(jpg|jpeg)$' } |
  Sort-Object Name |
  ForEach-Object { $_.Name }

$json = $files | ConvertTo-Json -Compress
"window.WORK_IMAGES = $json;" | Set-Content -Path $manifestPath -Encoding UTF8
Write-Output "Generated $($files.Count) image entries in js\data\thumbnails.js"
