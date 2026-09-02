# Master Orchestrator One-Click Universal Global Installer for Windows (Antigravity, Codex, Cursor, Claude Code)
Write-Host "⚡ Installing Master Orchestrator 2.0 Globally..." -ForegroundColor Cyan

# 1. Antigravity Global Path
$GeminiSkillsPath = "$env:USERPROFILE\.gemini\config\skills"
if (!(Test-Path $GeminiSkillsPath)) { New-Item -ItemType Directory -Path $GeminiSkillsPath -Force | Out-Null }

# 2. Codex Global Path
$CodexDir = "$env:USERPROFILE\.codex"
if (!(Test-Path $CodexDir)) { New-Item -ItemType Directory -Path $CodexDir -Force | Out-Null }
$CodexSkillsPath = "$env:USERPROFILE\.codex\skills"

# Copy AGENTS.md globally for Codex
$SourceAgents = Join-Path $PSScriptRoot "AGENTS.md"
if (Test-Path $SourceAgents) {
    Copy-Item -Path $SourceAgents -Destination (Join-Path $CodexDir "AGENTS.md") -Force
}

# Copy 221 Skills globally
$CurrentSkills = Join-Path $PSScriptRoot "skills"
if (Test-Path $CurrentSkills) {
    Get-ChildItem -Path $CurrentSkills -Directory | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination (Join-Path $GeminiSkillsPath $_.Name) -Recurse -Force
        Copy-Item -Path $_.FullName -Destination (Join-Path $CodexSkillsPath $_.Name) -Recurse -Force
    }
}

Write-Host "✅ Master Orchestrator 2.0 permanently installed in Global User Space!" -ForegroundColor Green
Write-Host "🚀 Active globally across all future projects in Antigravity & Codex!" -ForegroundColor Yellow
