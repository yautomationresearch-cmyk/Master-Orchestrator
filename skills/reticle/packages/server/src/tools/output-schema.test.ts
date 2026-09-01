/**
 * An outputSchema that describes nothing the tool returns.
 *
 * `reticle_clock` declared `{ ok?, elapsed? }`. The browser command returns `{ frozen }`. Neither
 * declared field exists, and MCP strips undeclared fields from `structuredContent` — so a successful
 * freeze and a failed one both validated to `{}`, and a caller reading structuredContent could not
 * tell them apart. Reported from a field sweep under the `full` profile, where output schemas are sent.
 *
 * The general rule this pins: a declared output field must be one the tool can actually produce. A
 * schema whose keys never appear is worse than no schema, because it silently erases the answer.
 */

import { describe, expect, it } from 'vitest';
import { TOOLS } from './tools.js';
import { ReticleTool } from './tool-names.js';

const schemaOf = (name: string): Record<string, unknown> | undefined =>
  TOOLS.find((t) => t.name === name)?.outputSchema;

describe('reticle_clock output', () => {
  it('declares the field it actually returns', () => {
    const schema = schemaOf(ReticleTool.CLOCK);
    expect(schema).toBeDefined();
    expect(Object.keys(schema ?? {})).toContain('frozen');
  });

  it('no longer declares fields the command never produces', () => {
    // `ok` and `elapsed` come from no clock code path; declaring them stripped the real answer.
    expect(Object.keys(schemaOf(ReticleTool.CLOCK) ?? {})).not.toContain('elapsed');
  });
});
