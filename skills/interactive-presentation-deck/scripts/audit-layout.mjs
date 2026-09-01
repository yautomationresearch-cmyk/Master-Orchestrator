#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const snapshotPath = process.argv[2];
if (!snapshotPath) {
  console.error("Usage: audit-layout.mjs /absolute/path/layout-snapshot.json");
  process.exit(2);
}

const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const elements = Array.isArray(snapshot.elements) ? snapshot.elements : [];
const errors = [];
const ids = new Set();
const defaultAllowed = new Set(["background", "scrim"]);

function area(element) {
  return { left: element.x, top: element.y, right: element.x + element.width, bottom: element.y + element.height };
}

function overlaps(a, b) {
  const ar = area(a); const br = area(b);
  return ar.left < br.right && ar.right > br.left && ar.top < br.bottom && ar.bottom > br.top;
}

function explicitlyAllowed(a, b) {
  return (a.allowOverlapWith ?? []).includes("*") || (a.allowOverlapWith ?? []).includes(b.id) || (b.allowOverlapWith ?? []).includes(a.id);
}

for (const element of elements) {
  if (!element.id) errors.push("element has no id");
  if (ids.has(element.id)) errors.push(`duplicate element id: ${element.id}`);
  ids.add(element.id);
  if (!["background", "scrim", "content", "chrome", "modal"].includes(element.layer)) errors.push(`${element.id} has invalid layer`);
  if (!["x", "y", "width", "height"].every((key) => Number.isFinite(element[key])) || element.width < 0 || element.height < 0) errors.push(`${element.id} has invalid bounds`);
}

for (let i = 0; i < elements.length; i += 1) {
  for (let j = i + 1; j < elements.length; j += 1) {
    const a = elements[i]; const b = elements[j];
    if (!overlaps(a, b)) continue;
    if (defaultAllowed.has(a.layer) || defaultAllowed.has(b.layer) || explicitlyAllowed(a, b)) continue;
    errors.push(`unapproved overlap: ${a.id} (${a.layer}) ↔ ${b.id} (${b.layer})`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Layout valid: ${elements.length} element(s), no unapproved overlaps.`);
