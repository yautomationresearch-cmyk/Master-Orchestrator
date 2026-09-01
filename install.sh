#!/usr/bin/env bash
# Master Orchestrator One-Click Installer for Mac/Linux
echo "⚡ Installing Master Orchestrator Ecosystem..."

GLOBAL_SKILLS_PATH="$HOME/.gemini/config/skills"
mkdir -p "$GLOBAL_SKILLS_PATH"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cp -r "$SCRIPT_DIR/skills/"* "$GLOBAL_SKILLS_PATH/"

echo "✅ Successfully installed 221+ Master Orchestrator skills to $GLOBAL_SKILLS_PATH!"
echo "🚀 Master Orchestrator is now active across Antigravity, Cursor, and Codex!"
