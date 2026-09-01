# Interactive Presentation Deck + Theme Gallery

Public Cursor/Codex skill **and** the runnable **Theme Gallery** (same picker UI as Content System).

**Repo:** https://github.com/vivekmishraishere/claude-web-deck-ppt

## Why install felt broken before

v1 only shipped `SKILL.md`. Agents had nowhere to open the theme cards, so they skipped selection and jumped to building. That is fixed:

| Path | What it is |
|------|------------|
| `interactive-presentation-deck/` | Skill (mandatory **Theme Gallery gate**) |
| `theme-gallery/` | Full Next/vinext app — browse → preview → customize → **Use this theme** |

Agents must **launch the gallery and wait for your pick** unless you already named a theme or said “you choose.”

---

## Install (recommended)

```bash
git clone https://github.com/vivekmishraishere/claude-web-deck-ppt.git
cd claude-web-deck-ppt
chmod +x install.sh
./install.sh
```

`install.sh` will:

1. Copy the skill into `~/.cursor/skills/interactive-presentation-deck` (and optionally into a project you pass as `$1`)
2. Print how to start the Theme Gallery

### Manual install

```bash
# 1) Skill (required for the agent to know the gate)
cp -R interactive-presentation-deck ~/.cursor/skills/

# Optional: project-local skill
mkdir -p /path/to/project/.cursor/skills
cp -R interactive-presentation-deck /path/to/project/.cursor/skills/

# 2) Theme Gallery (required for the select UI)
cd theme-gallery
npm install
npm run dev
# open the URL shown (localhost:3000 or :3001)
```

Open a **new** Cursor agent chat after installing the skill.

---

## How it should work (mandatory flow)

1. You ask for a deck / PPT / board pack.
2. Agent runs `theme-gallery` (`npm run dev`) and opens the URL.
3. **You** browse cards, preview themes, optionally Customize, then **Use this theme →** (or reply with the theme name).
4. Only then does the agent build — cloning patterns from `theme-gallery/app/themes/<id>/`.

If you want the AI to pick: say **“you choose the theme”** / **“AI pick.”**

---

## Themes included

Editorial: Work Map, Neuroscience, Ink Mono, Paper Violet, Amber Signal, Coastal  

Data / board: **Orbit Data** (dark), **Metric Board** (light) — Recharts + density rules in `references/data-board-decks.md`

Nav inside samples: arrows / Space / control pill — **no click-on-slide advance**.

---

## Content System users

If you already work in Content System, keep using:

```bash
cd decks/theme-gallery && npm run dev
```

The project skill under `.cursor/skills/interactive-presentation-deck` now enforces the same gallery gate. You do not need a second gallery copy unless you want the public-repo layout.
