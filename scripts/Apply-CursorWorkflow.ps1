#Requires -Version 5.1
<#
.SYNOPSIS
  Copy template/dot-cursor into a target repo as .cursor/

.PARAMETER TargetRepo
  Absolute path to the git repository root.

.PARAMETER Force
  Merge into existing .cursor (overwrite files from template only).
#>
param(
  [Parameter(Mandatory = $true)]
  [string] $TargetRepo,

  [switch] $Force
)

$ErrorActionPreference = "Stop"
$TemplateRoot = Split-Path -Parent $PSScriptRoot
$Source = Join-Path $TemplateRoot "template\dot-cursor"
$Dest = Join-Path $TargetRepo ".cursor"

if (-not (Test-Path $TargetRepo)) {
  throw "Target repo not found: $TargetRepo"
}
if (-not (Test-Path (Join-Path $TargetRepo ".git"))) {
  Write-Warning "No .git in $TargetRepo — continuing anyway."
}
if (-not (Test-Path $Source)) {
  throw "Template missing: $Source"
}

if ((Test-Path $Dest) -and -not $Force) {
  throw ".cursor already exists. Use -Force to merge template files over it."
}

if (-not (Test-Path $Dest)) {
  New-Item -ItemType Directory -Force -Path $Dest | Out-Null
}
# Copy contents of dot-cursor into .cursor (not the folder itself)
Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $Dest -Recurse -Force
}

# First-time project config from example at template repo root
$ExampleConfig = Join-Path $TemplateRoot "project.config.example.json"
$ProjectConfig = Join-Path $Dest "project.config.json"
if ((Test-Path $ExampleConfig) -and -not (Test-Path $ProjectConfig)) {
  Copy-Item $ExampleConfig $ProjectConfig
  Write-Host "Created $ProjectConfig — edit issueKeyPrefixes and developerGitHub."
}

# Ensure gitignore entry
$Gitignore = Join-Path $TargetRepo ".gitignore"
$Line = ".cursor/"
if (Test-Path $Gitignore) {
  $content = Get-Content $Gitignore -Raw
  if ($content -notmatch '(?m)^\.cursor/') {
    Add-Content -Path $Gitignore -Value "`n$Line"
    Write-Host "Appended $Line to .gitignore"
  }
} else {
  Set-Content -Path $Gitignore -Value $Line -Encoding utf8
  Write-Host "Created .gitignore with $Line"
}

Write-Host "Done. .cursor installed at $Dest"
Write-Host "Next: edit .cursor/project.config.json and .cursor/context/PROJECT.md"
