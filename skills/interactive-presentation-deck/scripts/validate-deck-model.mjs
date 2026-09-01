#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const modelPath = process.argv[2];
if (!modelPath) {
  console.error("Usage: validate-deck-model.mjs /absolute/path/deck-model.json");
  process.exit(2);
}

const model = JSON.parse(await readFile(modelPath, "utf8"));
const kinds = new Set(["hero", "split", "map", "comparison", "process", "image", "takeaway", "sources"]);
const errors = [];
if (!model || !Array.isArray(model.scenes) || model.scenes.length === 0) errors.push("model.scenes must be a non-empty array");

const ids = new Set();
for (const [index, scene] of (model.scenes ?? []).entries()) {
  if (!scene.id) errors.push(`scene ${index} has no id`);
  if (ids.has(scene.id)) errors.push(`duplicate scene id: ${scene.id}`);
  ids.add(scene.id);
  if (!kinds.has(scene.kind)) errors.push(`scene ${scene.id ?? index} has unsupported kind: ${scene.kind}`);
  if (!scene.title) errors.push(`scene ${scene.id ?? index} has no title`);
  if (scene.reveals && !Array.isArray(scene.reveals)) errors.push(`scene ${scene.id} reveals must be an array`);
  for (const [revealIndex, reveal] of (scene.reveals ?? []).entries()) {
    if (!reveal.id) errors.push(`scene ${scene.id} reveal ${revealIndex} has no id`);
  }
  if (scene.image && !scene.image.src) errors.push(`scene ${scene.id} image has no src`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Deck model valid: ${model.scenes.length} scene(s).`);
