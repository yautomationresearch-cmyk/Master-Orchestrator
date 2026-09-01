import { describe, it, expect, afterEach } from 'vitest';
import { EventType } from '@reticlehq/core';
import { installConsole } from './console.js';
import type { Emit, Teardown } from './types.js';

interface Emitted {
  type: EventType;
  data: Record<string, unknown>;
}

function collect(): { emit: Emit; events: Emitted[] } {
  const events: Emitted[] = [];
  const emit: Emit = (type, data) => {
    events.push({ type, data });
  };
  return { emit, events };
}

describe('installConsole', () => {
  let teardown: Teardown | undefined;

  afterEach(() => {
    teardown?.();
    teardown = undefined;
  });

  it('emits CONSOLE_ERROR and still forwards to the original console', () => {
    const { emit, events } = collect();
    teardown = installConsole(emit);

    console.error('boom', 42);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(EventType.CONSOLE_ERROR);
    expect(events[0]?.data['message']).toBe('boom 42');
  });

  it('captures the stack of an Error argument to console.error', () => {
    const { emit, events } = collect();
    teardown = installConsole(emit);

    console.error('failed:', new Error('kaboom'));

    expect(events[0]?.type).toBe(EventType.CONSOLE_ERROR);
    expect(typeof events[0]?.data['stack']).toBe('string');
    expect(events[0]?.data['stack']).toContain('kaboom');
  });

  it('does not attach a stack when console.error has no Error argument', () => {
    const { emit, events } = collect();
    teardown = installConsole(emit);

    console.error('just a string');

    expect(events[0]?.data['stack']).toBeUndefined();
  });

  it('captures console.info and console.debug lean (no stack), excluded from summaries downstream', () => {
    const { emit, events } = collect();
    teardown = installConsole(emit);

    // Reach the methods via globalThis so this test never trips the no-console lint rule.
    const c = globalThis.console;
    c.info('info line', 1);
    c.debug('debug line');

    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe(EventType.CONSOLE_INFO);
    expect(events[0]?.data['message']).toBe('info line 1');
    expect(events[0]?.data['stack']).toBeUndefined();
    expect(events[1]?.type).toBe(EventType.CONSOLE_DEBUG);
    expect(events[1]?.data['message']).toBe('debug line');
  });

  it('restores the original console methods (identity) on teardown', () => {
    const beforeLog = console.log;
    const beforeWarn = console.warn;
    const beforeError = console.error;
    const t = installConsole(collect().emit);
    expect(console.error).not.toBe(beforeError);
    t();
    expect(console.log).toBe(beforeLog);
    expect(console.warn).toBe(beforeWarn);
    expect(console.error).toBe(beforeError);
  });
});
