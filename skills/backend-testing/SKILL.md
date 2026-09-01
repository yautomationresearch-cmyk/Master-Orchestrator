---
name: backend-testing
description: Exhaustive backend API testing, error handling, BOLA prevention, and E2E loop testing. Use when hardening backend architecture or ensuring zero-bug API deployments.
---

# Backend Fortification Protocol

When asked to test, debug, or harden a backend system, you must apply the following exhaustive methodology:

## 1. Exhaustive E2E Loop Testing
- Do not stop at a single successful test run. Wrap your E2E test scripts in a loop and run them 4-5 times continuously.
- **Direct DB Assertions:** Do not just rely on HTTP 200/201 responses. Connect to the database directly within the test script and assert that the underlying state (e.g., `isDeleted: true`, correct calculated totals) matches expectations.

## 2. The Approve/Change/Discard Matrix
For every single API endpoint, you must test three scenarios:
- **Approve (Success):** Valid payload, authorized user.
- **Change (Validation Error):** Missing or incorrectly formatted fields.
- **Discard (Auth/Server Error):** Unauthorized, BOLA attempt, or server crash.

## 3. Vulnerability & Error Handling Defenses
- **BOLA (Broken Object Level Authorization):** Ensure every resource-fetching endpoint explicitly checks ownership (e.g., `userId === req.user.id`). Use a centralized ownership gatekeeper function.
- **Soft-Deletion Constraints:** If implementing soft-delete, ensure unique database indexes use partial filter expressions (e.g., `partialFilterExpression: { isDeleted: false }`) to avoid duplicate key errors on re-creation.
- **Precision Financial Math:** Never use raw floating-point math for money. Scale values up to integers, perform math, and scale down.

## 4. Execution
When invoked, audit the current backend codebase against these 3 principles. If E2E tests exist, rewrite them to include direct DB assertions and execute them in a multi-run loop.
