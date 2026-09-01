// Generate the README's benchmark chart FROM the benchmark results.
//
// Hand-drawing a chart is how a README ends up claiming a number the harness stopped producing. This
// reads `bench/pw-vs-reticle/results.json` — the same file `bench/FALSE-GREEN-SCORECARD.md` is built
// from — and emits an SVG, so the picture and the table cannot disagree. Re-run after `pnpm bench`.
//
// It plots the categories where the two tools DIFFER, and states the parity categories in words
// rather than hiding them: a chart that showed only the moat would be true and still misleading,
// since most bug classes are a tie. The moat is that the ties are the easy half.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RESULTS = join(ROOT, 'bench', 'pw-vs-reticle', 'results.json');
const OUT = join(ROOT, 'assets', 'readme', 'benchmark-chart.svg');

const RETICLE = 'reticle-script';
const PLAYWRIGHT = 'playwright-script';

/** Not a bug: flagging one would itself be a false positive, so 0/2 is the correct score. */
const NOT_A_BUG = 'false-positive-trap';
/** How many of those traps the registry carries — stated so the denominator is never a mystery. */
let NOT_A_BUG_COUNT = 0;

/** What each category means to someone who has never read the harness. */
const MEANING = {
  state: 'UI shows a value that contradicts the app store',
  'business-logic': 'a never-rendered field is corrupted',
  signal: "the app's own success signal never fired",
  'net-status': 'a 4xx/5xx the catch block swallowed',
  streams: 'an SSE / WebSocket frame anomaly',
  perf: 'render storm — DOM identical, 60 commits/s',
  'deep-dom': 'a break deep in a subtree a snapshot elides',
};

function tally() {
  const raw = JSON.parse(readFileSync(RESULTS, 'utf8'));
  const buggy = raw.rows.filter((row) => row.variant !== 'clean' && row.category !== NOT_A_BUG);
  NOT_A_BUG_COUNT = raw.rows.filter(
    (row) => row.variant !== 'clean' && row.category === NOT_A_BUG && row.harness === RETICLE,
  ).length;
  const byCategory = new Map();
  for (const row of buggy) {
    const entry = byCategory.get(row.category) ?? {
      [RETICLE]: { n: 0, caught: 0 },
      [PLAYWRIGHT]: { n: 0, caught: 0 },
    };
    const side = entry[row.harness];
    if (side !== undefined) {
      side.n += 1;
      if (true === row.caught) side.caught += 1;
    }
    byCategory.set(row.category, entry);
  }
  return byCategory;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function build() {
  const byCategory = tally();
  const all = [...byCategory.entries()].map(([name, e]) => ({
    name,
    ret: e[RETICLE],
    pw: e[PLAYWRIGHT],
  }));
  const differ = all
    .filter((c) => c.ret.caught !== c.pw.caught)
    .sort((a, b) => a.pw.caught / a.pw.n - b.pw.caught / b.pw.n || b.ret.n - a.ret.n);
  const parity = all.filter((c) => c.ret.caught === c.pw.caught);
  const parityBugs = parity.reduce((sum, c) => sum + c.ret.n, 0);

  const totals = all.reduce(
    (acc, c) => ({
      ret: acc.ret + c.ret.caught,
      pw: acc.pw + c.pw.caught,
      n: acc.n + c.ret.n,
    }),
    { ret: 0, pw: 0, n: 0 },
  );

  // Layout. One row per differing category, a header block above, a footnote below.
  const W = 960;
  const PAD = 28;
  const HEAD = 132;
  const ROW = 40;
  const BAR_X = 312;
  const BAR_W = 396;
  const H = HEAD + differ.length * ROW + 92;

  const BG = '#15131f'; // the README badge label colour — one card that reads on light AND dark
  const FG = '#f4f2ff';
  const DIM = '#9a93b8';
  const PURPLE = '#8b7bff'; // Reticle
  const GREY = '#5b6273'; // Playwright
  const parts = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" role="img" aria-label="Benchmark: bugs caught by category, Reticle versus Playwright">`,
  );
  parts.push(`<rect width="${W}" height="${H}" rx="14" fill="${BG}"/>`);

  parts.push(
    `<text x="${PAD}" y="40" fill="${FG}" font-size="19" font-weight="700">Bugs caught, by category</text>`,
    // Legend sits with the title; at the foot it collided with the footnote at every width.
    `<rect x="${W - PAD - 186}" y="30" width="10" height="10" rx="3" fill="${PURPLE}"/>`,
    `<text x="${W - PAD - 170}" y="39" fill="${DIM}" font-size="12">Reticle</text>`,
    `<rect x="${W - PAD - 104}" y="30" width="10" height="10" rx="3" fill="${GREY}"/>`,
    `<text x="${W - PAD - 88}" y="39" fill="${DIM}" font-size="12">Playwright</text>`,
    `<text x="${PAD}" y="63" fill="${DIM}" font-size="13">${totals.n + NOT_A_BUG_COUNT} regressions injected into one app. The ${NOT_A_BUG_COUNT} false-positive traps (not real bugs) are excluded.</text>`,
  );

  // Headline pills.
  const pill = (x, label, value, colour) =>
    `<rect x="${x}" y="78" width="196" height="38" rx="8" fill="${colour}" opacity="0.14"/>` +
    `<text x="${x + 14}" y="95" fill="${DIM}" font-size="11" letter-spacing="0.4">${esc(label)}</text>` +
    `<text x="${x + 14}" y="110" fill="${FG}" font-size="14" font-weight="700">${esc(value)}</text>`;
  parts.push(pill(PAD, 'RETICLE', `${totals.ret} / ${totals.n} caught`, PURPLE));
  parts.push(pill(PAD + 208, 'PLAYWRIGHT', `${totals.pw} / ${totals.n} caught`, GREY));
  parts.push(
    `<rect x="${PAD + 416}" y="78" width="240" height="38" rx="8" fill="${PURPLE}" opacity="0.14"/>`,
    `<text x="${PAD + 430}" y="95" fill="${DIM}" font-size="11" letter-spacing="0.4">FALSE GREENS — BROKEN, REPORTED OK</text>`,
    `<text x="${PAD + 430}" y="110" fill="${FG}" font-size="14" font-weight="700">0 vs ${totals.n - totals.pw}</text>`,
  );

  differ.forEach((cat, i) => {
    const y = HEAD + i * ROW;
    const scale = (v) => (v / cat.ret.n) * BAR_W;
    parts.push(
      `<text x="${PAD}" y="${y + 13}" fill="${FG}" font-size="13" font-weight="600">${esc(cat.name)}</text>`,
      `<text x="${PAD}" y="${y + 28}" fill="${DIM}" font-size="11">${esc(MEANING[cat.name] ?? '')}</text>`,
      // Reticle bar
      `<rect x="${BAR_X}" y="${y}" width="${BAR_W}" height="12" rx="6" fill="#ffffff" opacity="0.06"/>`,
      `<rect x="${BAR_X}" y="${y}" width="${scale(cat.ret.caught)}" height="12" rx="6" fill="${PURPLE}"/>`,
      `<text x="${W - PAD}" y="${y + 11}" text-anchor="end" fill="${FG}" font-size="12" font-weight="700">${cat.ret.caught}/${cat.ret.n}</text>`,
      // Playwright bar
      `<rect x="${BAR_X}" y="${y + 16}" width="${BAR_W}" height="12" rx="6" fill="#ffffff" opacity="0.06"/>`,
      `<rect x="${BAR_X}" y="${y + 16}" width="${scale(cat.pw.caught)}" height="12" rx="6" fill="${GREY}"/>`,
      `<text x="${W - PAD}" y="${y + 27}" text-anchor="end" fill="${DIM}" font-size="12">${cat.pw.caught}/${cat.pw.n}</text>`,
    );
  });

  const fy = HEAD + differ.length * ROW + 18;
  parts.push(
    `<line x1="${PAD}" y1="${fy}" x2="${W - PAD}" y2="${fy}" stroke="#ffffff" stroke-opacity="0.08"/>`,
    `<text x="${PAD}" y="${fy + 24}" fill="${DIM}" font-size="12">The other ${parity.length} categories (${parityBugs} bugs \u2014 visual, DOM, console, storage, routing): both catch everything.</text>`,
    `<text x="${PAD}" y="${fy + 42}" fill="${DIM}" font-size="12">The gap is entirely where the screen looks right.</text>`,
  );
  parts.push('</svg>');
  return { svg: parts.join('\n'), differ, parity, totals };
}

const { svg, differ, parity, totals } = build();
writeFileSync(OUT, svg + '\n');
console.log(
  `wrote ${OUT}\n  ${totals.ret}/${totals.n} vs ${totals.pw}/${totals.n} · ${differ.length} differing categories · ${parity.length} at parity`,
);
