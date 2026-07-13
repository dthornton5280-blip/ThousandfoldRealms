param([string]$Output = "_site")

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$site = [IO.Path]::GetFullPath((Join-Path $root $Output))
if (-not $site.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to build outside the repository: $site"
}
if (Test-Path -LiteralPath $site) {
  Remove-Item -LiteralPath $site -Recurse -Force
}
New-Item -ItemType Directory -Path $site | Out-Null
Copy-Item -Path (Join-Path $root "source\*") -Destination $site -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "version.json") -Destination (Join-Path $site "version.json")

$overrideSource = Join-Path $root "live-overrides"
$overrideTarget = Join-Path $site "live-overrides"
New-Item -ItemType Directory -Path $overrideTarget | Out-Null
Get-ChildItem $overrideSource -File |
  Where-Object { $_.Extension -in ".css", ".js" } |
  Copy-Item -Destination $overrideTarget

$css = (Get-ChildItem $overrideSource -Filter "*.css" | Sort-Object Name | ForEach-Object {
  "<link rel=`"stylesheet`" href=`"./live-overrides/$($_.Name)?v=local`">"
}) -join ""
$js = (Get-ChildItem $overrideSource -Filter "*.js" | Sort-Object Name | ForEach-Object {
  "<script src=`"./live-overrides/$($_.Name)?v=local`"></script>"
}) -join ""
$indexPath = Join-Path $site "index.html"
$html = [IO.File]::ReadAllText($indexPath)
if (-not $html.Contains('<script src="src/main.js"></script>')) {
  throw "Canonical main-script assembly marker is missing."
}
$html = $html.Replace("</head>", "<!-- GIT_LIVE_OVERRIDE_STYLES -->$css</head>")
$html = $html.Replace(
  '<script src="src/main.js"></script>',
  "<!-- GIT_LIVE_OVERRIDE_RUNTIME -->$js<script src=`"src/main.js`"></script>"
)
[IO.File]::WriteAllText($indexPath, $html, [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $site "404.html"), $html, [Text.UTF8Encoding]::new($false))
New-Item -ItemType File -Path (Join-Path $site ".nojekyll") | Out-Null
Write-Output "Built deployment-shaped local site at $site"
