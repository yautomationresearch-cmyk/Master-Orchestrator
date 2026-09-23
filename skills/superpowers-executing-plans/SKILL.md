---
name: superpowers-executing-plans
description: Checkpoint-driven execution engine inspired by Jesse Vincent's Superpowers. Executes micro-tasks sequentially with automated verification gates and atomic rollbacks.
---

# Superpowers Executing Plans (Checkpoint-Driven Execution Engine)

> **Core Directive:** Execute approved implementation plans sequentially, one bite-sized micro-task at a time, verifying each step before proceeding to the next.

## The Checkpoint Execution Protocol
1. **Task-by-Task Sequential Execution:**
   - Take the next pending 2-5 minute micro-task from the implementation plan.
   - Do NOT attempt to implement multiple unrelated tasks in a single turn.
2. **Automated Verification Gate:**
   - After modifying the target file, immediately execute the verification check specified in the plan (e.g. build test, TypeScript check, unit test, or Reticle assertion).
   - If verification fails, halt immediately and trigger `systematic-debugging` rather than blindly plowing forward.
3. **Atomic Progress & State Checkpointing:**
   - Mark the completed micro-task as `[x] COMPLETED` in the task list.
   - Update `agent/PROJECT_GRAPH_MEMORY.md` if state or interfaces changed.
4. **Clean Handoff:**
   - If the task requires user review or staging verification, present the verified diff and stop.
