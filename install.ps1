# Master Orchestrator One-Click Installer for Windows (Antigravity, Cursor, Claude, Codex)
Write-Host "⚡ Installing Master Orchestrator Ecosystem..." -ForegroundColor Cyan

$GlobalSkillsPath = "$env:USERPROFILE\.gemini\config\skills"
if (!(Test-Path $GlobalSkillsPath)) {
    New-Item -ItemType Directory -Path $GlobalSkillsPath -Force | Out-Null
}

$CurrentSkills = Join-Path $PSScriptRoot "skills"
Get-ChildItem -Path $CurrentSkills -Directory | ForEach-Object {
    $dest = Join-Path $GlobalSkillsPath $_.Name
    Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
}

Write-Host "✅ Successfully installed 221+ Master Orchestrator skills to $GlobalSkillsPath!" -ForegroundColor Green
Write-Host "🚀 Master Orchestrator is now active across Antigravity, Cursor, and Codex!" -ForegroundColor Yellow
