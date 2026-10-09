#Requires -Version 5.1
Write-Warning "Apply-CursorWorkflow.ps1 is deprecated. Use Apply-AgentWorkflow.ps1 (-SyncCursor if you use Cursor)."
& (Join-Path $PSScriptRoot "Apply-AgentWorkflow.ps1") @PSBoundParameters
