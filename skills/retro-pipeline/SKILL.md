---
name: retro-pipeline
description: Retrospective & Continuous Velocity Pipeline inspired by Garry Tan's G-Stack. Audits completed builds, extracts lessons learned, verifies production readiness, and logs velocity improvements.
---

# Retrospective & Production Velocity Pipeline (Retro)

> **Mental Model:** Continuous improvement engine. Every shipped milestone must leave the codebase cleaner, the team smarter, and the graphical memory permanently updated.

## When to Activate
- Immediately after finishing a build, feature, or bugfix sprint.
- Before declaring a feature complete.
- Invoked via `/retro` or `/ship`.

## The Retro Protocol
1. **What Shipped:** Exact list of working user-facing capabilities verified in browser/tests.
2. **What Broke (or Almost Broke):** Hidden assumptions, build hurdles, or styling regressions encountered.
3. **The Lesson Learned:** Reusable architectural or prompt insight to prevent future repeats.
4. **Graphical Memory Commit:** Autonomously record the milestone into `agent/PROJECT_GRAPH_MEMORY.md` and `raw info collection/Agent and User Conversation.md`.
5. **Production Readiness Checklist:**
   - [ ] 0 TypeScript / compilation errors.
   - [ ] 60 FPS mobile performance verified.
   - [ ] All sensitive keys redacted.
   - [ ] Clean git commit message formulated.
