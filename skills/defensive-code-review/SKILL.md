---
name: defensive-code-review
description: Hostile adversarial code review inspired by Jesse Vincent's Superpowers. Scans diffs for silent regressions, broken types, placeholder comments, and style leakage before declaring completion.
---

# Defensive Code Review (Anti-Regression Firewall)

> **Core Directive:** Act as an adversarial Senior Reviewer reviewing a junior pull request. Assume there is a hidden bug until proven otherwise.

## The 5-Point Review Checklist
1. **Zero-Placeholder Audit:**
   - Ban all `// TODO`, `// add logic here`, or truncated code blocks. Every output must be 100% complete and drop-in ready.
2. **Type & Interface Integrity:**
   - Verify no `any` types or unsafe casts were introduced. Ensure all new props and API payloads are strictly typed.
3. **Visual & Layout Bleed Check:**
   - Confirm CSS styles do not leak into parent or sibling containers. Ensure responsive behavior across mobile (375px), tablet (768px), and desktop (1440px).
4. **Error Boundaries & Fallbacks:**
   - Does every network call have a try/catch? Does every image have an `alt` and a fallback state?
5. **Memory & Performance Verification:**
   - Ensure event listeners, intervals, and Three.js/WebGL contexts are cleaned up on component unmount.
