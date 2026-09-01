/** Small pure helpers shared by the MCP tool handlers. */

interface InteractiveItem {
  ref: string;
  desc: string;
}

/** Parse interactive elements (with refs) out of a snapshot tree for exploration. */
export function parseInteractive(tree: string): InteractiveItem[] {
  const items: InteractiveItem[] = [];
  for (const line of tree.split('\n')) {
    const match = /\(ref=(e\d+)\)/.exec(line);
    if (match !== null) {
      items.push({ ref: match[1] ?? '', desc: line.replace(/\s*\(ref=e\d+\)/, '').trim() });
    }
  }
  return items;
}

export function asString(value: unknown): string | undefined {
  return 'string' === typeof value ? value : undefined;
}

export function asNumber(value: unknown): number | undefined {
  return 'number' === typeof value ? value : undefined;
}

export function asRecord(value: unknown): Record<string, unknown> {
  return 'object' === typeof value && value !== null ? (value as Record<string, unknown>) : {};
}

/**
 * A `{ file, line }` source location off an untrusted result payload, or undefined.
 *
 * The browser sends this alongside an act's anchor so a failure can name the file to open. Validated
 * rather than cast: it crosses the wire, and a half-formed location rendered as "undefined:NaN" is
 * worse than no location at all — it looks like an answer.
 */
export function sourceOf(
  value: unknown,
): { file: string; line: number; column?: number } | undefined {
  if (null === value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const file = record['file'];
  const line = record['line'];
  if (typeof file !== 'string' || 0 === file.length || typeof line !== 'number') return undefined;
  const out: { file: string; line: number; column?: number } = { file, line };
  if ('number' === typeof record['column']) out.column = record['column'];
  return out;
}
