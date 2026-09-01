import { z } from 'zod';
import { IntentStore } from './intent-store.js';
import { ReticleTool } from '../tools/tool-names.js';
import { sessionIdShape } from '../tools/tool-kit.js';
import { sessionRoot } from '../project/session-root.js';
import { asString } from '../tools/tools-helpers.js';
import type { ToolDef, ToolDeps } from '../tools/tool-kit.js';

/**
 * Declare what a change was SUPPOSED to make true, while somebody still knows.
 *
 * One tool with three actions rather than three tools, because the surface is capped and because an
 * agent that has to discover three names to use one idea uses none of them.
 *
 * There is deliberately no `discharge` action. A verdict discharges an intent by satisfying its
 * binding, and a discharge an agent has to remember to file would be the same forgetting problem
 * this exists to solve, moved one layer up.
 */

const DECLARE = 'declare';
const LIST = 'list';
const BIND = 'bind';

export const INTENT_TOOLS: ToolDef[] = [
  {
    name: ReticleTool.INTENT,
    description:
      'Record what a change is SUPPOSED to make true, in your own words, while you still know — then verification does not have to re-derive it from the DOM later. { action:"declare", intents:[{ id, statement, surface? }] } takes prose and needs NO predicate: at declare time there is often no route, no ref and no code yet, and a predicate demanded there is just a mechanism. Declare EARLY (as you build) and batch them — one call per feature is the whole budget. { action:"bind", id, binding } attaches the predicate that would prove it once you know how; an intent with no binding is not a failure, it is the most interesting row in the ledger — something meant that nothing can currently prove. { action:"list" } returns what is still open. Stored in .reticle/intent.json, git-checked so a human sees in review if an intent was later narrowed to match what was easy to prove.',
    example: {
      action: DECLARE,
      intents: [
        { id: 'checkin', statement: 'clicking Send check-in makes the badge read "checked in"' },
      ],
    },
    inputSchema: {
      action: z.enum([DECLARE, LIST, BIND]),
      intents: z
        .array(
          z.object({
            id: z.string(),
            statement: z.string(),
            surface: z
              .object({
                route: z.string().optional(),
                flow: z.string().optional(),
                files: z.array(z.string()).optional(),
              })
              .optional(),
          }),
        )
        .optional()
        .describe('declare only. Batchable — declare every intent for a feature in one call.'),
      id: z.string().optional().describe('bind only: which intent the predicate proves.'),
      binding: z
        .unknown()
        .optional()
        .describe("bind only: the predicate that would prove it, in reticle_assert's shape."),
      ...sessionIdShape,
    },
    outputSchema: {
      intents: z
        .array(z.unknown())
        .optional()
        .describe(
          'The intents this call declared, or on `list` everything still open — each { id, statement, state, declaredAt, binding?, surface?, provenBy?, amended? }. `state` is declared (prose only), bound (a predicate exists), or proved (a verdict satisfied it).',
        ),
      bound: z.boolean().optional().describe('bind only: false when the id names no intent.'),
      path: z.string().optional().describe('Where the ledger was written.'),
    },
    handler: async (deps: ToolDeps, args) => {
      const root = sessionRoot(deps, asString(args['sessionId']));
      const store = new IntentStore(deps.fs, root, { now: deps.now });
      const action = asString(args['action']);

      if (BIND === action) {
        const id = asString(args['id']) ?? '';
        return { bound: await store.bind(id, args['binding']) };
      }
      if (LIST === action) {
        return { intents: await store.open() };
      }
      const raw = args['intents'];
      const entries = Array.isArray(raw)
        ? (raw as { id: string; statement: string; surface?: never }[])
        : [];
      const declared = await store.declare(entries);
      return { intents: declared, path: root };
    },
  },
];
