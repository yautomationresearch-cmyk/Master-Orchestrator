import { describe, expect, it } from 'vitest';
import { FLOW_FILE_VERSION, IntentState, type FlowFile } from '@reticlehq/core';
import { createMemoryFs } from '../project/memory-fs.js';
import { IntentStore } from '../intent/intent-store.js';
import { FlowStore, type FlowAnnotations } from './flows.js';
import { ReticleTool } from '../tools/tool-names.js';
import { dischargeFlowIntent, flowIntentId, flowIntentStatement } from './flow-intent.js';
import type { CompiledProgram } from './recordings.js';

const ROOT = '/repo/.reticle';
const NOW = 1_000;

function harness() {
  const { fs, written } = createMemoryFs();
  const clock = { now: () => NOW };
  return {
    flows: new FlowStore(fs, ROOT, clock),
    intents: new IntentStore(fs, ROOT, clock),
    written,
  };
}

function program(name: string): CompiledProgram {
  return {
    name,
    version: 1,
    steps: [
      {
        tool: ReticleTool.ACT,
        stable: true,
        args: { by: 'testid', value: 'send-checkin', action: 'click', args: {} },
      },
    ],
  };
}

function annotations(partial: Partial<FlowAnnotations>): FlowAnnotations {
  return { stepExpect: new Map(), dynamic: [], ...partial };
}

const CHECKIN = 'the trip badge reads "checked in" after the traveller checks in';

describe('a flow carries the business intent it discharges', () => {
  it('saving a flow with a business goal declares it in the shared intent ledger', async () => {
    const { flows, intents } = harness();
    await flows.save(program('checkin'), annotations({ intent: CHECKIN }));

    const [intent] = await intents.read();
    expect(intent?.statement).toBe(CHECKIN);
    expect(intent?.surface?.flow).toBe('checkin');
  });

  it('stamps the ledger id onto the flow file, so the link survives on disk', async () => {
    const { flows } = harness();
    await flows.save(program('checkin'), annotations({ intent: CHECKIN }));

    const loaded = await flows.load('checkin');
    expect(loaded.ok && loaded.value.intentId).toBe(flowIntentId('checkin'));
  });

  it('binds the intent when the flow asserts an observable outcome, so a replay can prove it', async () => {
    const { flows, intents } = harness();
    await flows.save(
      program('checkin'),
      annotations({ intent: CHECKIN, success: { signal: 'trip:checked-in' } }),
    );

    const [intent] = await intents.read();
    expect(intent?.state).toBe(IntentState.BOUND);
  });

  it('leaves an intent unbound when the flow asserts nothing observable', async () => {
    const { flows, intents } = harness();
    await flows.save(program('checkin'), annotations({ intent: CHECKIN }));

    const [intent] = await intents.read();
    expect(intent?.state).toBe(IntentState.DECLARED);
    expect(intent?.binding).toBeUndefined();
  });

  it('an older flow with no business goal writes no ledger row and no intentId', async () => {
    const { flows, intents, written } = harness();
    await flows.save(program('legacy'));

    expect(await intents.read()).toEqual([]);
    const loaded = await flows.load('legacy');
    expect(loaded.ok && loaded.value.intentId).toBeUndefined();
    expect([...written.keys()].some((path) => path.endsWith('intent.json'))).toBe(false);
  });

  it('a green replay marks the intent proved with the verdict that did it', async () => {
    const { flows, intents } = harness();
    await flows.save(
      program('checkin'),
      annotations({ intent: CHECKIN, success: { signal: 'trip:checked-in' } }),
    );
    const loaded = await flows.load('checkin');
    if (!loaded.ok) throw new Error('flow did not save');

    const proved = await dischargeFlowIntent(intents, loaded.value, {
      verdictId: 'flow_replay:checkin:2000',
      grade: 'asserted',
      at: 2_000,
    });

    expect(proved).toBe(true);
    const [intent] = await intents.read();
    expect(intent?.state).toBe(IntentState.PROVED);
    expect(intent?.provenBy).toEqual({
      verdictId: 'flow_replay:checkin:2000',
      grade: 'asserted',
      at: 2_000,
    });
  });

  it('a flow with no declared intent discharges nothing', async () => {
    const { flows, intents } = harness();
    await flows.save(program('legacy'));
    const loaded = await flows.load('legacy');
    if (!loaded.ok) throw new Error('flow did not save');

    expect(
      await dischargeFlowIntent(intents, loaded.value, {
        verdictId: 'v',
        grade: 'asserted',
        at: 2_000,
      }),
    ).toBe(false);
    expect(await intents.read()).toEqual([]);
  });

  it('reads the statement from the ledger, so an amendment is what a report quotes', async () => {
    const { flows, intents } = harness();
    await flows.save(program('checkin'), annotations({ intent: CHECKIN }));
    await intents.declare([{ id: flowIntentId('checkin'), statement: 'the badge reads paid' }]);
    const loaded = await flows.load('checkin');
    if (!loaded.ok) throw new Error('flow did not save');

    expect(await flowIntentStatement(intents, loaded.value)).toBe('the badge reads paid');
  });

  it('reads no statement for a flow that never declared one — never one derived from its steps', async () => {
    const { flows, intents } = harness();
    await flows.save(program('legacy'));
    const loaded = await flows.load('legacy');
    if (!loaded.ok) throw new Error('flow did not save');

    expect(await flowIntentStatement(intents, loaded.value)).toBeUndefined();
  });

  it('honours an intentId already on the flow, so a flow can discharge an intent declared elsewhere', async () => {
    const { flows, intents } = harness();
    await intents.declare([{ id: 'checkout-works', statement: 'checkout still works' }]);
    const flow: FlowFile = {
      version: FLOW_FILE_VERSION,
      name: 'pay',
      createdAt: NOW,
      steps: [],
      intentId: 'checkout-works',
      success: { signal: 'order:placed' },
    };
    await flows.saveFlow(flow);

    const [intent] = await intents.read();
    expect(intent?.id).toBe('checkout-works');
    expect(intent?.statement).toBe('checkout still works');
    expect(intent?.state).toBe(IntentState.BOUND);
  });
});
