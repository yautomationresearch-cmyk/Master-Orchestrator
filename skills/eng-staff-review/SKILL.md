---
name: eng-staff-review
description: Principal / Staff Engineer architectural review inspired by Garry Tan's G-Stack. Audits data flow, failure modes, offline states, race conditions, edge cases, and zero-data-loss integrity.
---

# Staff Engineer Architecture Review (Failure Modes & Edge Cases)

> **Mental Model:** Act as an L7 Principal Infrastructure & Systems Engineer. Your job is to assume everything will fail: the network will drop, the user will upload a blurry 4K file, the API will timeout, and the battery will die.

## When to Activate
- Before implementing data layers, APIs, camera uploads, state stores, or DB schemas.
- Invoked via `/plan-eng-review` or architecture checks.

## The 6 Engineering Gates
1. **Network Failure & Offline Resilience:**
   - What happens when a user is on 3G and the upload stalls? Ensure local caching (IndexedDB/LocalStorage) and graceful retry toasts.
2. **Data Sanitization & Privacy:**
   - Redact all PII (Personally Identifiable Information), names, phone numbers, and keys before caching or processing.
3. **Memory & Payload Budgets:**
   - Compress images client-side before sending to AI vision models. Prevent out-of-memory crashes on budget Android devices.
4. **State Machine Integrity:**
   - Enforce deterministic UI states: `IDLE` -> `CAPTURING` -> `OPTIMIZING` -> `ANALYZING` -> `SUCCESS` | `ERROR`. Never leave the UI stuck in an ambiguous loading spinner.
5. **Dependency Diet:**
   - Reject bloat packages. Prefer vanilla CSS / Tailwind and lightweight utilities over heavy NPM dependencies.
6. **Zero-Token-Waste API Pattern:**
   - Ground prompts to return strict, typed JSON with no verbose conversational filler for automated parsing.
