# Theme gallery gate (mandatory)

**Hard rule:** Before writing or scaffolding any deck, the agent MUST launch the Theme Gallery and let the user pick a theme — unless the user has **already named a theme**, pasted a **Copy instruction**, or explicitly said **“you choose” / “AI pick the theme”**.

Do not start designing slides, inventing a look, or asking abstract questionnaire first. **Selection UI comes first.**

---

## Banned first responses (do not do these)

When the user says “create a PPT”, “make a deck”, “build slides”, or similar:

| Banned | Why |
|--------|-----|
| `AskQuestion` / multi-choice “What should this be about?” with project-specific options | Options get polluted by open files (e.g. “data-board-decks notes”, “Neuroscience web deck”) — irrelevant and confusing |
| Guessing topic from currently focused files | Open markdown ≠ the user’s request |
| Asking style/feel in chat instead of opening the gallery | Theme Gallery **is** the style picker |
| Building slides immediately | Theme not locked |

**Correct first turn:** start `npm run dev` on Theme Gallery → open the URL → short message that you are waiting for their pick. No quiz.

---

## Resolution order for gallery path

Find a runnable Theme Gallery using the first match:

1. `$WORKSPACE/theme-gallery` (this GitHub repo layout)
2. `$WORKSPACE/decks/theme-gallery` (Content System layout)
3. Skill-adjacent: `../theme-gallery` relative to installed `interactive-presentation-deck/`
4. If missing: clone `https://github.com/vivekmishraishere/claude-web-deck-ppt.git` and use its `theme-gallery/`

---

## Exact agent steps (every new deck request)

### A. Launch (same turn — tools, not questions)

```bash
cd <gallery-path>
npm install   # if node_modules missing
npm run dev
```

Open the printed URL in the browser (usually `http://localhost:3000` or `http://localhost:3001`). Prefer side/Simple Browser so the user sees the **same theme cards** as local Content System.

### B. Tell the user (short — no multi-choice quiz)

> Theme Gallery is at `<url>`.  
> Preview themes on the home page, open any you like, then **Use this theme →** (or reply with the theme name, e.g. Metric Board).  
> I won’t build until you’ve selected.  
> If you want me to pick the theme for you, say so.

### C. Stop and wait

Do **not** implement slides and do **not** open a second AskQuestion round about topic until theme is locked — unless the user already stated both theme and topic in one message.

Proceed when:

- User pastes the gallery Copy instruction, or  
- User names a theme (and optional topic), or  
- User says to pick for them (“AI choose / you decide the theme”)

### D. After selection — *then* ask relevant questions

Only after theme lock, ask **generic** brief questions (see [brief-intake.md](brief-intake.md)):

- What is the deck about? (free text — do not invent topic multiple-choice from open files)
- Who is the audience / what decision should they make?
- Rough length (e.g. 8–12 / 12–15 slides)
- Interactive web deck vs PPTX (default: web deck matching the gallery theme)

If using `AskQuestion` after theme lock, options must be **generic and always relevant**, e.g.:

- About: “I’ll type the topic” / “Board / exec update” / “Pitch” / “Teaching / lecture” / “Other…”
- Never: “open data-board-decks notes”, “neuroscience-web-deck”, or any path/filename from the IDE

---

## Exceptions (skip gallery launch only if true)

| Condition | Action |
|-----------|--------|
| User already said “Work Map” / “Orbit Data” / etc. | Confirm once; skip picker if they insist |
| User pasted full Copy instruction | Proceed to brief |
| User said “you choose the theme” | Pick one, state which, then brief |
| Pure refactor of an existing deck with theme locked | No gallery |
| User said “don’t open the gallery” | Ask theme name in chat only |

Ambiguous “make me a PPT” / “build a deck” → **always launch gallery first**.

---

## Why this exists

The Theme Gallery app is the productized picker. Chat quizzes that mirror open tabs are not a substitute and feel broken to users.
