---
name: test-driven-development
description: Test-driven development (TDD) safety net inspired by Jesse Vincent's Superpowers. Enforces Red-Green-Refactor cycles for mission-critical calculations, auth, OCR parsing, and database queries.
---

# Test-Driven Development (Red-Green-Refactor Engine)

> **Core Directive:** For critical business logic (medical calculations, drug clash checks, financial math, auth tokens, database mutations), write the verification test FIRST.

## The Red-Green-Refactor Cycle
1. **Red (Write Failing Test):**
   - Author a test defining expected inputs, edge cases (null, empty, extreme values), and expected outputs.
   - Run the test and confirm it fails for the expected reason (not a syntax error).
2. **Green (Minimal Implementation):**
   - Write the simplest possible production code to make the test pass.
   - Run the test suite and confirm green.
3. **Refactor (Clean & Optimize):**
   - Clean up code formatting, eliminate duplication, and improve variable naming while keeping all tests green.
   - Verify performance and memory efficiency.
