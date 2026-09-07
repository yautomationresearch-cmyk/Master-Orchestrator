---
name: superpowers-brainstorming
description: Socratic design refinement and trade-off exploration inspired by Jesse Vincent's Superpowers. Proposes 2-3 architectural approaches with pros/cons and asks 1 question at a time before code implementation.
---

# Superpowers Brainstorming (Socratic Design & Trade-Offs)

> **Core Directive:** HARD GATE — NEVER rush into writing code, scaffolding directories, or making edits until user design intent is crystallized and explicitly approved.

## The 4 Socratic Steps
1. **Context Exploration:**
   - Inspect existing codebase, recent commits, design tokens, and `PROJECT_GRAPH_MEMORY.md`.
2. **Targeted Clarification (1-Question-At-A-Time):**
   - Ask precise clarifying questions one at a time. Never overwhelm the user with a giant wall of questions.
3. **The 3-Approach Rule (Mandatory Alternative Presentation):**
   - Present 2 to 3 distinct architectural approaches:
     - **Approach A (Lean / Lightweight):** Zero extra dependencies, fastest implementation, low complexity.
     - **Approach B (Scalable / Ecosystem-Standard):** Standard battle-tested architecture, balanced maintainability.
     - **Approach C (High-End / Bespoke):** Maximum polish, custom WebGL/shaders, rich animation choreography.
   - For each approach, explicitly list **Pros, Cons, Complexity, and Maintenance Cost**.
4. **Design Specification Lock:**
   - Once the user chooses an approach, document the decision in the project spec before transitioning to `superpowers-writing-plans`.
