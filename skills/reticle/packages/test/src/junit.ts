import type { FileSystemPort } from '@reticlehq/server';
import { DEFAULT_JUNIT_SUITE_NAME, JUnit, TestStatus } from './constants.js';
import { summarize } from './summary.js';
import type { SpecResult } from './types.js';

/**
 * XML 1.0 section 2.2: every code point below U+0020 is illegal EXCEPT tab, newline and carriage
 * return. Stated as codes rather than a regex character class, which cannot express control
 * characters without tripping `no-control-regex` and needing the rule turned off to read it.
 *
 * Iterating code points also means an astral character (an emoji in a test name) survives intact;
 * the regex worked on UTF-16 units.
 */
const XML_MIN_LEGAL_CODE = 0x20;
const XML_LEGAL_CONTROL_CODES: ReadonlySet<number> = new Set([
  0x09, // tab
  0x0a, // newline
  0x0d, // carriage return
]);

/** Drop the control characters no XML parser will accept. */
function stripXmlIllegal(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= XML_MIN_LEGAL_CODE || XML_LEGAL_CONTROL_CODES.has(code)) out += ch;
  }
  return out;
}

/**
 * Strip characters illegal in XML 1.0 then escape the five XML-significant characters. Without the
 * strip, ANSI colour codes in error output produce a document no parser will read — CI shows
 * nothing instead of showing the failure.
 */
function escapeXml(value: string): string {
  return stripXmlIllegal(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** First line of text (for the attribute summary). Handles LF, CRLF, and bare CR. */
function firstLine(text: string): string {
  const match = /\r?\n|\r/.exec(text);
  return null === match ? text : text.slice(0, match.index);
}

function seconds(ms: number): string {
  return (ms / 1000).toFixed(3);
}

function caseXml(r: SpecResult): string {
  const open =
    `  <${JUnit.CASE} ${JUnit.ATTR_NAME}="${escapeXml(r.name)}" ` +
    `${JUnit.ATTR_TIME}="${seconds(r.durationMs)}">`;
  if (r.status === TestStatus.FAIL) {
    const full = escapeXml(r.error ?? '');
    const summary = escapeXml(firstLine(r.error ?? ''));
    return (
      `${open}\n    <${JUnit.FAILURE} ${JUnit.ATTR_MESSAGE}="${summary}">` +
      `${full}</${JUnit.FAILURE}>\n  </${JUnit.CASE}>`
    );
  }
  if (r.status === TestStatus.SKIP) {
    const msg = escapeXml(r.skipReason ?? '');
    return `${open}\n    <${JUnit.SKIPPED} ${JUnit.ATTR_MESSAGE}="${msg}"></${JUnit.SKIPPED}>\n  </${JUnit.CASE}>`;
  }
  return `${open}</${JUnit.CASE}>`;
}

/** Render results as a single JUnit `<testsuite>` document (CI consumable). */
export function toJUnitXml(results: readonly SpecResult[], opts?: { suite?: string }): string {
  const suite = escapeXml(opts?.suite ?? DEFAULT_JUNIT_SUITE_NAME);
  const s = summarize(results);
  const header =
    `<${JUnit.SUITE} ${JUnit.ATTR_NAME}="${suite}" ` +
    `${JUnit.ATTR_TESTS}="${String(s.total)}" ` +
    `${JUnit.ATTR_FAILURES}="${String(s.failed)}" ` +
    `${JUnit.ATTR_SKIPPED}="${String(s.skipped)}">`;
  const body = results.map(caseXml).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n${header}\n${body}\n</${JUnit.SUITE}>\n`;
}

/** Write the JUnit report through the injected filesystem seam (tests pass a fake adapter). */
export async function writeJUnit(
  fs: FileSystemPort,
  path: string,
  results: readonly SpecResult[],
  opts?: { suite?: string },
): Promise<void> {
  await fs.writeFile(path, toJUnitXml(results, opts));
}
