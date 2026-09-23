---
name: systematic-debugging
description: 4-phase root cause analysis inspired by Jesse Vincent's Superpowers. Enforces The Iron Law (no fixes without verified evidence) and bans shotgun debugging.
---

# Systematic Debugging (4-Phase Root Cause Engine & The Iron Law)

> **THE IRON LAW OF DEBUGGING:**
> You are STRICTLY FORBIDDEN from proposing or implementing code fixes until Phase 1 and Phase 2 (Evidence Gathering & Root Cause Analysis) are completely verified. Guessing or shotgun trial-and-error edits are completely banned.

## The 4 Forensic Phases

### Phase 1: Reproduce & Evidence Gathering
- Capture the exact stack trace, error payload, and minimal failing input.
- Check recent commits or changes that immediately preceded the failure.
- Verify whether the bug is deterministic or race-condition dependent.

### Phase 2: Isolate (Root Cause Identification)
- Trace the data flow backward from the point of failure to the origin.
- Use logs, assertions, or Playwright inspection to isolate the exact variable or line causing the corrupted state.
- **The Root Cause Statement:** You must explicitly formulate:
  *"The failure occurs because [Component X] expects [Condition Y], but receives [Condition Z] due to [Root Cause]."*

### Phase 3: Formulate Surgical Hypothesis
- Design the minimal, non-invasive fix that targets the root cause directly without introducing side-effects in adjacent components.
- Review interfaces and types to ensure no regressions.

### Phase 4: Surgical Fix & Proof Verification
- Apply the targeted fix.
- Re-run the reproduction test and adjacent test suites to prove that the failure is resolved and 0 regressions were introduced.
