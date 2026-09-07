---
name: systematic-debugging
description: 4-phase root cause analysis inspired by Jesse Vincent's Superpowers. Bans shotgun trial-and-error debugging in favor of Reproduce, Isolate, Hypothesize, and Surgical Fix.
---

# Systematic Debugging (4-Phase Root Cause Engine)

> **Core Directive:** SHOTGUN DEBUGGING IS BANNED. When an error occurs, never make random multi-file edits hoping something fixes the bug. Follow the 4-phase forensic process.

## The 4 Forensic Phases
1. **Phase 1: Reproduce & Capture**
   - Capture the exact stack trace, error message, failing input, and visual behavior.
   - Verify if the bug is deterministic or intermittent.
2. **Phase 2: Isolate (Minimal Reproduction)**
   - Strip away non-essential components until only the minimal failing line or state mutation remains.
   - Use logs, console assertions, or Playwright inspection to isolate the exact variable holding unexpected state.
3. **Phase 3: Formulate Hypothesis & Root Cause**
   - State clearly: *"The bug occurs because [X] expects [Y], but received [Z] due to [Root Cause]."*
   - Verify hypothesis against documentation or language specifications before editing code.
4. **Phase 4: Surgical Fix & Proof**
   - Apply the minimal targeted fix to the isolated root cause.
   - Re-run the reproduction test to prove the fix works without causing side-effects or regressions in adjacent components.
