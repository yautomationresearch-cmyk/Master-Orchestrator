import { describe, expect, it } from 'vitest';
import { EventType, type ReticleEvent } from '@reticlehq/core';
import { proposeConsequences } from './propose-consequences.js';

let seq = 0;
function e(type: EventType, data: Record<string, unknown>): ReticleEvent {
  seq += 1;
  return { t: seq, seq, type, sessionId: 'demo', data };
}

describe('proposeConsequences', () => {
  it('ranks a signal above net/state above presence, all deduped', () => {
    const events = [
      e(EventType.DOM_ADDED, { role: 'alert', name: 'Saved' }),
      e(EventType.NET_REQUEST, { method: 'POST', url: 'http://x/api/order', status: 200 }),
      e(EventType.SIGNAL, { name: 'order:placed' }),
      e(EventType.SIGNAL, { name: 'order:placed' }), // dup
    ];
    const proposals = proposeConsequences(events);
    expect(proposals[0]?.predicate).toMatchObject({ kind: 'signal', name: 'order:placed' });
    expect(proposals[0]?.weak).toBe(false);
    expect(proposals[proposals.length - 1]?.weak).toBe(true); // presence last
    // deduped: only one signal proposal
    expect(proposals.filter((p) => 'signal' === p.predicate['kind'])).toHaveLength(1);
  });

  it('extracts the pathname for a net proposal', () => {
    const proposals = proposeConsequences([
      e(EventType.NET_REQUEST, {
        method: 'GET',
        url: 'http://host:3000/api/cart?x=1',
        status: 200,
      }),
    ]);
    expect(proposals[0]?.predicate).toMatchObject({
      kind: 'net',
      method: 'GET',
      urlContains: '/api/cart',
    });
  });

  it('flags a presence-only proposal as weak', () => {
    const proposals = proposeConsequences([e(EventType.DOM_ADDED, { role: 'button', name: 'OK' })]);
    expect(proposals).toHaveLength(1);
    expect(proposals[0]).toMatchObject({ weak: true, predicate: { kind: 'element', name: 'OK' } });
  });

  it('returns nothing for an empty window', () => {
    expect(proposeConsequences([])).toEqual([]);
  });
});
