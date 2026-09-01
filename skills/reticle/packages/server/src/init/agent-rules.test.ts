import { describe, it, expect } from 'vitest';
import {
  mergeMarkedInstruction,
  cursorRuleFile,
  markedBlock,
  reticleMdFile,
  RETICLE_MD_PATH,
  AgentRuleStatus,
} from './agent-rules.js';

describe('agent verification rule — content', () => {
  it('states WHEN to verify, HOW, and the never-weaken guard', () => {
    const block = markedBlock();
    // The rule must make the trigger unambiguous and the anti-reward-hacking guard explicit.
    expect(block).toContain('changed something a user can see or do');
    expect(block).toContain('BEFORE telling the user it is complete');
    expect(block).toMatch(/reticle_act/);
    expect(block).toMatch(/reticle_assert/);
    // Every command the rule names must be one the agent can actually RUN: `reticle` is not on its
    // PATH (init installs the SDK, not the server), so a bare `reticle gate` was unfollowable.
    expect(block).toContain('npx @reticlehq/server gate');
    expect(block).toContain('Never weaken a check');
    // Wrapped in idempotency markers.
    expect(block).toContain('reticle:begin');
    expect(block).toContain('<!-- reticle:end -->');
  });

  // The rule `init` writes is the FIRST thing an agent reads about Reticle, and it lands before any
  // framework wiring — so it is the only chance to say "report your experience" while the setup is
  // still being lived through. A rule that only asks for feedback about verifications collects
  // nothing about the phase that most often breaks.
  it('asks for feedback as a standing instruction, not only when a verification fails', () => {
    const block = markedBlock();
    // The instruction itself stays in the always-loaded block: an agent that never opens the
    // reference must still know that reporting is part of the job.
    expect(block).toContain('reticle_feedback');
    const full = reticleMdFile();
    expect(full).toMatch(/feature_request/);
    expect(full).toMatch(/improvement/);
    // Setup and install problems, named — they happen before any tool surface exists.
    expect(full).toMatch(/installing, wiring, or starting Reticle/);
    // The escape hatch for when there is no daemon and no tools to call. Through npx, like every
    // other command in this block: `reticle init` installs the SDK, never the server, so a bare
    // `reticle` is an instruction the agent cannot follow — see the CLI docblock in agent-rules.ts.
    expect(full).toContain('feedback --agent --kind');
    expect(full).not.toMatch(/[^/]\breticle feedback\b/);
    expect(block).not.toMatch(/[^/]\breticle feedback\b/);
  });

  /**
   * The half of the rule that decides whether an agent is USEFUL or merely obedient.
   *
   * A rule that only says "verify after every change" gets obeyed literally: a README edit, a
   * dependency bump and a backend refactor each buy a browser drive that proves nothing about what
   * changed, burning tool calls and the user's patience until somebody deletes the rule outright.
   * Naming the cases where verification cannot say anything is what keeps the rest of it credible.
   */
  it('says when NOT to reach for Reticle, and to say so out loud', () => {
    const block = markedBlock();
    expect(block).toContain('Do not reach for Reticle');
    for (const skip of [
      'documentation',
      'build config',
      'dependency bumps',
      'not a running web app',
    ])
      expect(block, `the skip list should name ${skip}`).toContain(skip);
    // Silence is the failure mode this replaces: an agent that quietly skips looks identical to one
    // that verified and found nothing.
    expect(block).toMatch(/skipped verification and why/);
  });

  /**
   * Splitting the rule is only safe while the pointer survives. Without this line the reference half
   * is a file nothing references, which is indistinguishable from having deleted it.
   */
  it('points at the full rules, so the reference half is reachable', () => {
    expect(markedBlock()).toContain(RETICLE_MD_PATH);
    expect(reticleMdFile()).toContain('# Reticle: the full rules');
  });

  it('cursor .mdc carries alwaysApply so it stays in every turn context', () => {
    const mdc = cursorRuleFile();
    expect(mdc.startsWith('---\n')).toBe(true);
    expect(mdc).toContain('alwaysApply: true');
    expect(mdc).toContain('Verifying with Reticle');
  });
});

describe('mergeMarkedInstruction — idempotent append into CLAUDE.md/AGENTS.md', () => {
  it('creates the block alone when the file is absent or empty', () => {
    for (const existing of [null, undefined, '', '   \n']) {
      const r = mergeMarkedInstruction(existing);
      expect(r.status).toBe(AgentRuleStatus.APPLY);
      expect(r.content).toBe(markedBlock());
    }
  });

  it('appends the block below existing content, preserving it', () => {
    const existing = '# My project rules\n\nDo the thing.\n';
    const r = mergeMarkedInstruction(existing);
    expect(r.status).toBe(AgentRuleStatus.APPLY);
    expect(r.content.startsWith(existing)).toBe(true); // existing content untouched
    expect(r.content).toContain('Verifying with Reticle'); // block appended
  });

  it('is a NO-OP when the managed block is already present (re-run idempotency)', () => {
    const first = mergeMarkedInstruction('# rules\n').content;
    const second = mergeMarkedInstruction(first);
    expect(second.status).toBe(AgentRuleStatus.ALREADY);
    expect(second.content).toBe(first); // byte-identical — no duplicate block
    // And a third pass over the second is still a no-op.
    expect(mergeMarkedInstruction(second.content).content).toBe(first);
  });
});
