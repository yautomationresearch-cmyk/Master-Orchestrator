---
name: superpowers-writing-plans
description: Bite-sized implementation planning inspired by Jesse Vincent's Superpowers. Decomposes tasks into 2-5 minute micro-steps with exact file paths, exact code symbols, and concrete verification checks.
---

# Superpowers Writing Plans (Bite-Sized Micro-Task Decomposition)

> **Core Directive:** Large, vague implementation tasks are strictly banned. Every plan must satisfy the **Zero-Context Engineer Test** (a fresh agent waking up can execute it flawlessly without prior conversational memory).

## The Micro-Task Rules
1. **2-to-5 Minute Decomposition:**
   - Break features into granular tasks taking 2-5 minutes of execution each.
   - *Bad:* "Task 1: Build the camera scanner UI and backend OCR integration."
   - *Good:*
     - "Task 1.1: Create CameraCapture component with fallback input upload in `src/components/CameraCapture.tsx`."
     - "Task 1.2: Implement client-side canvas downsampler (max 1024px) in `src/utils/imageCompressor.ts`."
     - "Task 1.3: Wire structured JSON API call with 10s timeout in `src/services/visionApi.ts`."
2. **Every Task Must Specify:**
   - **Exact File Path:** Absolute or relative workspace path.
   - **Target Symbol/Function:** Exact component or handler being added/modified.
   - **Concrete Verification:** Exact command or check to prove the step passed.
3. **Dependency Ordering:**
   - Types & interfaces first -> Utilities & data stores second -> Core components third -> Integration and delight layers last.
