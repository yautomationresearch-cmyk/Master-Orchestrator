---
name: gsd-core
description: Meta-prompting, context engineering, and spec-driven development system for Claude Code, Codex, Antigravity CLI, Copilot, Cursor, Windsurf, and OpenCode.
---

# GSD Core (Get Shit Done)

GSD Core is a context-engineering and spec-driven development system designed to prevent context rot during AI-assisted development.

## Core Phases & Workflow

1. **Discuss** — Capture requirements, design decisions, and scope before planning.
2. **Plan** — Research, decompose into atomic phases, write SPEC and PLAN documents.
3. **Execute** — Execute plans in parallel waves with clean context boundaries.
4. **Verify** — Walkthrough, inspect diffs, test implementation against specification.
5. **Ship** — Commit changes, archive phase, and update milestone.

## Commands & Usage

- `gsd-core --global` : Run installer to configure global runtime adapters and hooks.
- `npx @opengsd/gsd-core` : Execute GSD Core interactive CLI launcher.
