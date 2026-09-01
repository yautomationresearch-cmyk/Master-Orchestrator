#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};

const manifestPath = resolve(value("--manifest", "tmp/asset-manifest.json"));
const dir = value("--dir", null) ? resolve(value("--dir", null)) : null;
const maxBytes = Number(value("--max-bytes", "750000"));
const maxTotalBytes = Number(value("--max-total-bytes", "4000000"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = [];
const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
const totalBytes = assets.reduce((sum, asset) => sum + Number(asset.bytes || 0), 0);

if (!assets.length) errors.push("manifest.assets must contain at least one asset");
if (totalBytes > maxTotalBytes) errors.push(`asset set is ${totalBytes} bytes; limit is ${maxTotalBytes}`);
for (const asset of assets) {
  if (extname(asset.path).toLowerCase() !== ".webp") errors.push(`${asset.path} is not WebP`);
  if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width <= 0 || asset.height <= 0) errors.push(`${asset.path} has invalid dimensions`);
  if (asset.bytes > maxBytes) errors.push(`${asset.path} is ${asset.bytes} bytes; limit is ${maxBytes}`);
}

if (dir) {
  const shipped = await readdir(dir, { withFileTypes: true });
  for (const entry of shipped) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if ([".png", ".jpg", ".jpeg"].includes(ext)) errors.push(`${join(dir, entry.name)} is an unoptimized source duplicate`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Assets valid: ${assets.length} file(s), ${totalBytes} total bytes.`);
