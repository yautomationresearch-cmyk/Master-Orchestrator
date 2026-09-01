#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SKILL_SRC="$ROOT/interactive-presentation-deck"
GALLERY="$ROOT/theme-gallery"
USER_SKILLS="${HOME}/.cursor/skills"
PROJECT_ROOT="${1:-}"

if [[ ! -d "$SKILL_SRC" || ! -f "$SKILL_SRC/SKILL.md" ]]; then
  echo "error: interactive-presentation-deck/SKILL.md missing. Run from the cloned repo root." >&2
  exit 1
fi

mkdir -p "$USER_SKILLS"
rm -rf "$USER_SKILLS/interactive-presentation-deck"
cp -R "$SKILL_SRC" "$USER_SKILLS/interactive-presentation-deck"
echo "✓ Installed skill → $USER_SKILLS/interactive-presentation-deck"

if [[ -n "$PROJECT_ROOT" ]]; then
  if [[ ! -d "$PROJECT_ROOT" ]]; then
    echo "error: project path not found: $PROJECT_ROOT" >&2
    exit 1
  fi
  DEST="$PROJECT_ROOT/.cursor/skills"
  mkdir -p "$DEST"
  rm -rf "$DEST/interactive-presentation-deck"
  cp -R "$SKILL_SRC" "$DEST/interactive-presentation-deck"
  echo "✓ Installed skill → $DEST/interactive-presentation-deck"
  if [[ -d "$PROJECT_ROOT/.agents" ]]; then
    mkdir -p "$PROJECT_ROOT/.agents/skills"
    ln -sfn ../../.cursor/skills/interactive-presentation-deck \
      "$PROJECT_ROOT/.agents/skills/interactive-presentation-deck"
    echo "✓ Symlinked .agents/skills/interactive-presentation-deck"
  fi
fi

echo ""
echo "Next — start Theme Gallery (selection UI):"
echo "  cd \"$GALLERY\""
echo "  npm install"
echo "  npm run dev"
echo ""
echo "Then open the printed localhost URL and pick a theme."
echo "Start a NEW Cursor agent chat so the skill is loaded."
echo ""
echo "Optional: install into a project too:"
echo "  ./install.sh \"/path/to/your-project\""
