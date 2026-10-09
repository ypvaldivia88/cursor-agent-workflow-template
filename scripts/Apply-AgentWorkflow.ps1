#Requires -Version 5.1
<#
.SYNOPSIS
  Install template/agent-workflow into a target repo as .agent-workflow/

.DESCRIPTION
  Tool-agnostic agent kit (rules, skills, memory CLI). Use scripts/adapters/
  to mirror rules into tool-specific folders (e.g. .cursor/rules for Cursor).

.PARAMETER TargetRepo
  Absolute path to the git repository root.

.PARAMETER Force
  Merge into an existing .agent-workflow/ (overwrite files from template).

.PARAMETER SyncCursor
  After install, run Sync-CursorRules.ps1 so Cursor loads rules/skills from .cursor/.
#>
param(
  [Parameter(Mandatory = $true)]
  [string] $TargetRepo,

  [switch] $Force,

  [switch] $SyncCursor
)

$ErrorActionPreference = "Stop"
$TemplateRoot = Split-Path -Parent $PSScriptRoot
$Source = Join-Path $TemplateRoot "template\agent-workflow"
$Dest = Join-Path $TargetRepo ".agent-workflow"

if (-not (Test-Path $TargetRepo)) {
  New-Item -ItemType Directory -Force -Path $TargetRepo | Out-Null
  Write-Host "Created target directory: $TargetRepo"
}
if (-not (Test-Path (Join-Path $TargetRepo ".git"))) {
  Write-Warning "No .git in $TargetRepo; continuing anyway."
}
if (-not (Test-Path $Source)) {
  throw "Template missing: $Source"
}

if ((Test-Path $Dest) -and -not $Force) {
  throw ".agent-workflow already exists. Use -Force to merge template files over it."
}

if (-not (Test-Path $Dest)) {
  New-Item -ItemType Directory -Force -Path $Dest | Out-Null
}

Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $Dest -Recurse -Force
}

$ExampleConfig = Join-Path $TemplateRoot "project.config.example.json"
$ProjectConfig = Join-Path $Dest "project.config.json"
if ((Test-Path $ExampleConfig) -and -not (Test-Path $ProjectConfig)) {
  Copy-Item $ExampleConfig $ProjectConfig
  Write-Host "Created $ProjectConfig - edit issueKeyPrefixes and developerGitHub."
}

$AgentsStub = Join-Path $TargetRepo "AGENTS.md"
$AgentsTemplate = Join-Path $Source "AGENTS.md"
if ((Test-Path $AgentsTemplate) -and -not (Test-Path $AgentsStub)) {
  Copy-Item $AgentsTemplate $AgentsStub
  Write-Host "Created $AgentsStub (entry point for Claude Code, Codex, etc.)."
}

$Gitignore = Join-Path $TargetRepo ".gitignore"
$Line = ".agent-workflow/"
if (Test-Path $Gitignore) {
  $content = Get-Content $Gitignore -Raw
  if ($content -notmatch '(?m)^\.agent-workflow/') {
    Add-Content -Path $Gitignore -Value "`n$Line"
    Write-Host "Appended $Line to .gitignore"
  }
} else {
  Set-Content -Path $Gitignore -Value $Line -Encoding utf8
  Write-Host "Created .gitignore with $Line"
}

Write-Host "Done. Agent workflow installed at $Dest"
Write-Host "Next: edit .agent-workflow/project.config.json and .agent-workflow/context/PROJECT.md"

if ($SyncCursor) {
  & (Join-Path $PSScriptRoot "adapters\Sync-CursorRules.ps1") -TargetRepo $TargetRepo
}
