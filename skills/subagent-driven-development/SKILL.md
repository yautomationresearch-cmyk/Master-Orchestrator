---
name: subagent-driven-development
description: Fresh-context subagent delegation inspired by Jesse Vincent's Superpowers. Dispatches isolated subagents for discrete tasks with two-stage review to prevent context bloat and hallucination.
---

# Subagent-Driven Development (Context Isolation & Clean Merges)

> **Core Directive:** Prevent conversation context exhaustion. Heavy multi-file tasks should be delegated to isolated subagents with clear specifications and multi-stage verification.

## The Subagent Delegation Protocol
1. **Task Contract Definition:**
   - Define a tight, self-contained contract for the subagent:
     - Target files to touch.
     - Inputs and expected outputs.
     - Acceptance criteria and verification tests.
2. **Two-Stage Review Process:**
   - **Stage 1 (Spec & Architecture Review):** Verify the subagent's proposed diff aligns with project design tokens and existing interfaces.
   - **Stage 2 (Quality & Regression Review):** Run tests, verify zero console errors, and ensure no extraneous files were created.
3. **Clean Merge into Main Thread:**
   - Ingest only the verified code changes and a concise 2-sentence summary into the parent context, keeping the primary workspace memory clean and fast.
