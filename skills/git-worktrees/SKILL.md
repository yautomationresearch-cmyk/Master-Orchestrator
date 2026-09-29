---
name: git-worktrees
description: Production Git Worktree lifecycle and multi-branch sandbox protocol. Enables zero-risk parallel feature development, isolated subagent workflows, and safe refactors without branch switching or stashing.
---

# Git Worktrees (Multi-Branch Sandbox & Isolated Agent Protocol)

> **CORE DIRECTIVE: NEVER AUTO-CREATE WITHOUT USER CONSENT**
> The agent must NEVER automatically run `git worktree add` silently. The agent must detect project status and proactively suggest/remind the user via the Subtle Advisory Box.

---

## 1. When to Suggest Git Worktrees
- At the start of any new or existing Git repository that lacks a worktree structure.
- When planning a major refactor, experimental 3D/shader implementation, or risky database migration.
- When delegating parallel tasks to subagents.

### The Subtle Advisory Box (Mandatory Output Format):
When a project lacks an initialized worktree structure, append this exact box at the bottom of the response:
```markdown
---
💡 **[WORKTREE ADVISORY]**: This project is running directly on the primary branch with no isolated worktree sandbox.
Reply **"setup worktree"** to initialize safe parallel branch sandboxes without risk of breaking your main code.
```

---

## 2. Recommended Directory Architecture (Sibling Pattern)

Always default to the **Sibling Directory Pattern** outside the main project root to prevent polluting the main repository's filesystem:

```text
D:\Projects\
 ├── my-app/                <-- Main Repository (main branch)
 └── my-app-worktrees/      <-- Sibling Sandbox Directory
      ├── feature-auth/     <-- Isolated Worktree 1
      └── feature-3d/       <-- Isolated Worktree 2
```

---

## 3. The 4-Step Golden Lifecycle

### Step 1: Creation (With Branch Safeguard)
Always create a new dedicated branch with the worktree. Never check out an already active branch:
```powershell
# Ensure Windows Long Paths are enabled
git config --global core.longpaths true

# Create worktree in sibling directory
git worktree add ../my-app-worktrees/feature-auth -b feature-auth
```

### Step 2: Auto-Hydration (Prevent Cold Start Traps)
Immediately copy environment secrets and assign a non-conflicting port:
```powershell
# Copy .env and .env.local from main repo to worktree
Copy-Item ".env" "../my-app-worktrees/feature-auth/.env" -ErrorAction SilentlyContinue
Copy-Item ".env.local" "../my-app-worktrees/feature-auth/.env.local" -ErrorAction SilentlyContinue

# Assign unique development port to avoid EADDRINUSE collisions
# (e.g. PORT=3001 or VITE_PORT=5174)
```

### Step 3: Isolated Agent Execution
The agent or subagent enters the worktree directory, installs dependencies, and runs tests in complete isolation. The main branch remains 100% stable and operable.

### Step 4: Clean Merge & Prune (Zero Lingering Cruft)
Once the feature is verified:
```powershell
# 1. Merge feature branch into main
git checkout main
git merge feature-auth

# 2. Stop any background node/server processes running inside the worktree
# (Ensures Windows does not throw "Permission denied" file lock errors)

# 3. Remove the worktree folder cleanly
git worktree remove ../my-app-worktrees/feature-auth

# 4. Prune dangling references
git worktree prune
```

---

## 4. The 6 Critical Windows & Multi-Agent Safeguards
1. **Cold Start Defense:** Always verify `.env` exists in the worktree before running dev servers or tests.
2. **Port Isolation:** Never run dev servers on the main project's port. Assign `PORT=3001` or let Vite increment.
3. **Windows File Lock Bypass:** Never attempt `git worktree remove` while your terminal CWD or IDE is inside the worktree folder.
4. **Long Path Configuration:** Always execute `git config --global core.longpaths true`.
5. **No Same-Branch Collisions:** Never attach two worktrees to the same branch.
6. **Ghost Worktree Cleanup:** Always execute `git worktree prune` after branch deletion.
