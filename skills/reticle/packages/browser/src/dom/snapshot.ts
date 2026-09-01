import { ElementState, SnapshotMode } from '@reticlehq/core';
import { capturedRootOf } from './shadow-registry.js';
import { isFrame } from './realm.js';
import { getAccessibleName, getRole, getStates, getValue, isVisible } from './a11y.js';
import { refs } from './refs.js';
import { isIgnored } from './dom-ignore.js';

const INTERACTIVE = new Set([
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'menuitem',
  'option',
]);

const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'head', 'meta', 'link']);

/** Roles whose whole purpose is announcing a change; both imply an implicit aria-live. */
const ANNOUNCE_ROLES = new Set(['alert', 'status']);

/**
 * Is this element the app SAYING something changed?
 *
 * INTERACTIVE mode keeps only actionable elements, which silently drops the one node that explains
 * why an action did nothing — the error the app just rendered. An agent told to prefer the cheaper
 * mode was structurally blind to the failure it had caused: the click reports settled with a DOM
 * mutation, and the lean snapshot shows the same controls as before. Live regions exist precisely
 * to announce state changes to a consumer that cannot see the screen, which is exactly the agent,
 * so they are the principled exception — and a bounded one, since a page has very few.
 */
function announces(el: Element, role: string): boolean {
  if (ANNOUNCE_ROLES.has(role)) return true;
  const live = el.getAttribute('aria-live');
  return live !== null && 'off' !== live;
}

/** Cap on inlined text content so a verbose node can't blow up the snapshot. */
const TEXT_MAX = 80;

/**
 * Concatenated DIRECT text of an element (its own text nodes, not descendants' — those are
 * captured when their own element is walked, so no duplication). Collapsed + truncated.
 * This is what makes a silent removal of non-interactive content (e.g. a KPI card) visible:
 * the accessibility role tree alone omits generic containers' text.
 */
function directText(el: Element): string {
  let out = '';
  for (const node of el.childNodes) {
    if (3 === node.nodeType /* Node.TEXT_NODE */) out += node.textContent ?? '';
  }
  const collapsed = out.replace(/\s+/g, ' ').trim();
  return collapsed.length > TEXT_MAX ? `${collapsed.slice(0, TEXT_MAX)}…` : collapsed;
}

interface SnapshotStatus {
  route: string;
  title: string;
  /** Open dialogs, OMITTED when there are none — absence means "no dialog is up". */
  visibleDialogs?: string[];
  /**
   * Present ONLY when a whole-page snapshot came back near-empty because an open overlay
   * aria-hidden the rest of the page (#397). Absence means the page is not hidden behind an overlay.
   */
  overlayHidingPage?: string;
}

export interface SnapshotResult {
  tree: string;
  status: SnapshotStatus;
  nodes: number;
  truncated: boolean;
  /**
   * True when a `scope` was given but resolved to nothing. The snapshot then covers NOTHING rather
   * than silently falling back to the whole page — an agent snapshotting "the modal" after it closed
   * must not receive the entire page as if it were the modal.
   */
  scopeMissing?: boolean;
  /**
   * Refs of the subtree roots the walk never entered, present ONLY when `truncated`. This is the
   * cut's own frontier: re-snapshot each with `{ scope: ref, includeRoot: true }` and the union is
   * the whole tree. Without it `truncated` says only THAT the read stopped, never WHERE, so nobody
   * could finish it — and a reader who does not finish it must not conclude anything is ABSENT.
   */
  unread?: string[];
  /**
   * True when the frontier itself did not fit in `MAX_UNREAD_BRANCHES`, so `unread` is a prefix of
   * the branches that were cut. Completion is then impossible from this read, and the difference
   * between "impossible" and "not attempted" is the whole point of saying so.
   */
  unreadOverflow?: true;
}

interface SnapshotOptions {
  scope?: string | undefined;
  mode?: SnapshotMode | undefined;
  maxNodes?: number | undefined;
  maxDepth?: number | undefined;
  /**
   * Emit the scope element's OWN line before its descendants. Off by default (a scoped snapshot has
   * always been the subtree UNDER the scope); the completion re-read needs it, because the branch it
   * is re-reading is exactly the node the truncated walk stopped before emitting.
   */
  includeRoot?: boolean | undefined;
}

/**
 * Cap on how many cut branches one snapshot names.
 *
 * A hostile or merely huge DOM can cut thousands of siblings at once (a non-virtualized grid does it
 * routinely), and a frontier that large is neither affordable to send nor useful to re-read one at a
 * time. Fifty is well above what a real page's cut produces — the frontier is the branches at the
 * node cap, not the nodes themselves — and small enough that the list stays a hint rather than a
 * second snapshot. Past it the read declares `unreadOverflow` instead of quietly sending fewer.
 */
export const MAX_UNREAD_BRANCHES = 50;

/** Cheap skips that need no computed style (tags, overlays, aria-hidden, [hidden]). */
function skipEarly(el: Element): boolean {
  if (SKIP_TAGS.has(el.tagName.toLowerCase())) return true;
  if (isIgnored(el)) return true; // Reticle overlay + known dev overlays
  if ('true' === el.getAttribute('aria-hidden')) return true;
  if (el instanceof HTMLElement && el.hidden) return true;
  return false;
}

function stateSuffix(el: Element): string {
  const states = getStates(el).filter(
    (s) =>
      s === ElementState.DISABLED ||
      s === ElementState.CHECKED ||
      s === ElementState.EXPANDED ||
      s === ElementState.FOCUSED,
  );
  return states.length > 0 ? ` [${states.join(',')}]` : '';
}

function formatLine(
  el: Element,
  depth: number,
  role: string,
  name: string,
  layout: string,
): string {
  const indent = '  '.repeat(depth);
  const value = getValue(el);
  const namePart = name.length > 0 ? ` "${name}"` : '';
  const refPart = INTERACTIVE.has(role) || name.length > 0 ? ` (ref=${refs.refFor(el)})` : '';
  const valuePart = value !== undefined && value.length > 0 ? ` [value="${value}"]` : '';
  const layoutPart = layout.length > 0 ? ` [${layout}]` : '';
  return `${indent}- ${role}${namePart}${refPart}${valuePart}${layoutPart}${stateSuffix(el)}`;
}

/** A generic container's own text content, with no ref (kept lean — text isn't actionable). */
function formatTextLine(depth: number, text: string): string {
  return `${'  '.repeat(depth)}- text "${text}"`;
}

/**
 * Compact signature of an element's own layout when it is a grid/flex container. A layout
 * regression (e.g. grid columns 2 -> 3) leaves the role+text tree identical, so a role-only
 * snapshot is blind to it; this line makes it visible. Empty for non-container elements.
 */
function layoutSignature(style: CSSStyleDeclaration | null): string {
  if (null === style) return '';
  const display = style.display;
  // Grid track templates are the high-signal CLS case (column/row count + sizing) and there are
  // few grid containers per page. Flex is intentionally excluded: nearly every row is a flex
  // box, so signing them all floods the snapshot for little regression value.
  if ('grid' === display || 'inline-grid' === display) {
    const cols = style.gridTemplateColumns;
    return cols !== '' && cols !== 'none' ? `grid-cols:${cols}` : 'grid';
  }
  return '';
}

interface WalkCtx {
  lines: string[];
  nodes: number;
  truncated: boolean;
  mode: SnapshotMode;
  maxNodes: number;
  maxDepth: number;
  unread: string[];
  unreadOverflow: boolean;
}

/** Record a cut branch on the frontier, declaring an overflow rather than shortening it silently. */
function recordUnread(branches: readonly Element[], ctx: WalkCtx): void {
  for (const branch of branches) {
    if (ctx.unread.length >= MAX_UNREAD_BRANCHES) {
      ctx.unreadOverflow = true;
      return;
    }
    ctx.unread.push(refs.refFor(branch));
  }
}

/**
 * The children to walk under `parent`, piercing boundaries a plain `.children` misses: an OPEN shadow
 * root renders as part of the element (web components / design systems), and a SAME-ORIGIN iframe's
 * body is real content. Cross-origin frames throw on access and are skipped by design. Without this,
 * an entire category of modern apps is invisible to reticle_snapshot (systematic false negative).
 */
function pierceChildren(parent: Element): Element[] {
  const out: Element[] = [...parent.children];
  // A CLOSED root reports `shadowRoot === null` forever, but the registry captured it at the moment
  // `attachShadow` returned it. `query` has been able to reach that content since; the snapshot could
  // not, so the two tools disagreed about what is on the page — and the snapshot is the one an agent
  // reads to decide what to query for, which makes its omission the one that actually costs.
  const shadow = parent.shadowRoot ?? capturedRootOf(parent);
  if (shadow !== null) out.push(...shadow.children);
  // Realm-aware: an iframe nested INSIDE another frame's body belongs to that frame's realm, so the
  // top window's constructor never matches it and nested embeds were silently never pierced.
  if (isFrame(parent)) {
    try {
      const body = parent.contentDocument?.body;
      if (body !== null && body !== undefined) out.push(...body.children);
    } catch {
      /* cross-origin frame — inaccessible by design */
    }
  }
  return out;
}

/** Emit one element (if it earns a line) and descend into it. Split out of `walk` so the completion
 * re-read can start AT a branch root — the node the truncated walk stopped just before emitting. */
function visit(child: Element, depth: number, ctx: WalkCtx, inLive: boolean): void {
  if (skipEarly(child)) return;
  // Resolve computed style ONCE per node (the dominant snapshot cost) and thread it into both the
  // display-none skip and the layout signature — was two forced style resolutions per node.
  const view = child.ownerDocument.defaultView;
  const style = view !== null ? view.getComputedStyle(child) : null;
  if (style !== null && 'none' === style.display) return;
  const role = getRole(child);
  const name = getAccessibleName(child);
  const interactive = INTERACTIVE.has(role);
  // Announcements are exempt from leanness, and so is everything inside one: a live region whose
  // message sits in a child element would otherwise be included as a contentless `- generic`.
  const announce = inLive || announces(child, role);
  const lean = ctx.mode === SnapshotMode.INTERACTIVE && !announce;
  // A generic, unnamed container's own text content — only consulted outside INTERACTIVE mode,
  // so the actionable-only view stays lean while FULL/meaningful views see content regressions.
  const text = !lean && 'generic' === role && 0 === name.length ? directText(child) : '';
  // Layout signature for grid/flex containers — makes CLS/layout regressions visible.
  const layout = lean ? '' : layoutSignature(style);
  const meaningful =
    interactive || role !== 'generic' || name.length > 0 || text.length > 0 || layout.length > 0;
  const include = lean ? interactive : meaningful;
  if (include) {
    ctx.nodes += 1;
    ctx.lines.push(
      text.length > 0 && 0 === name.length && 0 === layout.length
        ? formatTextLine(depth, text)
        : formatLine(child, depth, role, name, layout),
    );
    walk(child, depth + 1, ctx, announce);
  } else {
    walk(child, depth, ctx, announce);
  }
}

function walk(parent: Element, depth: number, ctx: WalkCtx, inLive = false): void {
  if (depth > ctx.maxDepth) return;
  const children = pierceChildren(parent);
  for (let index = 0; index < children.length; index += 1) {
    if (ctx.nodes >= ctx.maxNodes) {
      ctx.truncated = true;
      // Everything from here on is unread, not absent. Naming the frontier is what makes the cut
      // recoverable — see `unread` on SnapshotResult.
      recordUnread(children.slice(index), ctx);
      return;
    }
    const child = children[index];
    if (child !== undefined) visit(child, depth, ctx, inLive);
  }
}

function collectDialogs(root: ParentNode): string[] {
  const nodes = root.querySelectorAll('[role="dialog"], dialog[open], [aria-modal="true"]');
  const names: string[] = [];
  for (const node of nodes) {
    if (isVisible(node)) names.push(getAccessibleName(node) || '(unnamed dialog)');
  }
  return names;
}

/**
 * Status for a snapshot, with uninformative defaults OMITTED.
 *
 * `reticle_act` already follows this rule — "fields at their uninformative default are omitted so a
 * clean action collapses to its consequence" — and snapshot did not, so every response carried
 * `visibleDialogs: []` whether or not a dialog existed. An empty array is the overwhelmingly common
 * case, so the field was almost pure repetition; a reader learns nothing from its presence and
 * everything from it.
 */
/**
 * A focus-trap modal (Radix and friends) marks every sibling of the portal root aria-hidden. The
 * snapshot walk correctly skips aria-hidden subtrees, so a whole-page snapshot can return only the
 * overlay's own nodes and nothing else -- indistinguishable from "this page is empty". If the
 * overlay's cleanup is stuck (common on a throttled tab), every later action then dispatches with no
 * effect because the overlay genuinely captures pointer events. Say so instead of returning a
 * near-empty tree with no explanation. (#397)
 */
function overlayHidingPage(root: ParentNode): string | undefined {
  // Only meaningful for a whole-page snapshot; a scoped snapshot is the subtree the caller chose.
  if (root !== document.body) return undefined;
  const dialogs = document.body.querySelectorAll(
    '[role="dialog"], dialog[open], [aria-modal="true"]',
  );
  let modal: Element | undefined;
  for (const d of dialogs) {
    if (isVisible(d)) {
      modal = d;
      break;
    }
  }
  if (modal === undefined) return undefined;
  const modalEl = modal;
  const outside = Array.from(document.body.children).filter((c) => !c.contains(modalEl));
  if (0 === outside.length) return undefined;
  if (!outside.every((c) => 'true' === c.getAttribute('aria-hidden'))) return undefined;
  return (
    'the rest of the page is aria-hidden behind an open overlay (a focus-trap modal), so this ' +
    'snapshot shows only the overlay. If it will not close its cleanup may be stuck on a throttled ' +
    'tab: dismiss the overlay, or snapshot with { scope } inside it.'
  );
}

function buildStatus(root: ParentNode): SnapshotStatus {
  const visibleDialogs = collectDialogs(root);
  const overlay = overlayHidingPage(root);
  return {
    route: `${location.pathname}${location.search}${location.hash}`,
    title: document.title,
    ...(visibleDialogs.length > 0 ? { visibleDialogs } : {}),
    ...(overlay !== undefined ? { overlayHidingPage: overlay } : {}),
  };
}

/** Build the semantic accessibility snapshot of the page or a subtree. */
export function buildSnapshot(options: SnapshotOptions = {}): SnapshotResult {
  const mode = options.mode ?? SnapshotMode.FULL;
  const scopeEl =
    options.scope !== undefined
      ? (refs.resolve(options.scope) ?? document.querySelector(options.scope))
      : document.body;
  // A given-but-missing scope snapshots NOTHING and says so — never a silent whole-page fallback.
  const scopeMissing = options.scope !== undefined && !(scopeEl instanceof Element);
  const root = scopeEl instanceof Element ? scopeEl : document.body;
  const status = buildStatus(root);

  if (scopeMissing) {
    return { tree: '', status, nodes: 0, truncated: false, scopeMissing: true };
  }
  if (mode === SnapshotMode.STATUS) {
    return { tree: '', status, nodes: 0, truncated: false };
  }

  const ctx: WalkCtx = {
    lines: [],
    nodes: 0,
    truncated: false,
    mode,
    maxNodes: options.maxNodes ?? 400,
    maxDepth: options.maxDepth ?? 20,
    unread: [],
    unreadOverflow: false,
  };
  if (true === options.includeRoot) visit(root, 0, ctx, false);
  else walk(root, 0, ctx);
  return {
    tree: ctx.lines.join('\n'),
    status,
    nodes: ctx.nodes,
    truncated: ctx.truncated,
    ...(ctx.unread.length > 0 ? { unread: ctx.unread } : {}),
    ...(ctx.unreadOverflow ? { unreadOverflow: true as const } : {}),
  };
}
