#!/usr/bin/env node
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, extname, relative, resolve, dirname } from "node:path";

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};

const dir = resolve(value("--dir", "public/images"));
const out = resolve(value("--out", "tmp/asset-manifest.json"));
const maxBytes = Number(value("--max-bytes", "750000"));

function dimensions(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") throw new Error("not a WebP file");
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    const start = buffer.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
    if (start < 0) throw new Error("VP8 frame header not found");
    return { width: buffer.readUInt16LE(start + 3) & 0x3fff, height: buffer.readUInt16LE(start + 5) & 0x3fff };
  }
  if (chunk === "VP8X") {
    return { width: 1 + buffer[24] + (buffer[25] << 8) + (buffer[26] << 16), height: 1 + buffer[27] + (buffer[28] << 8) + (buffer[29] << 16) };
  }
  throw new Error(`unsupported WebP chunk ${chunk}`);
}

async function filesAt(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const next = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await filesAt(next));
    else if (extname(entry.name).toLowerCase() === ".webp") files.push(next);
  }
  return files;
}

const files = await filesAt(dir);
const assets = [];
const failures = [];
for (const file of files) {
  const buffer = await readFile(file);
  try {
    const { width, height } = dimensions(buffer);
    const bytes = buffer.byteLength;
    if (bytes > maxBytes) failures.push(`${relative(dir, file)} is ${bytes} bytes; limit is ${maxBytes}`);
    assets.push({ path: relative(dir, file), width, height, bytes, aspectRatio: Number((width / height).toFixed(4)) });
  } catch (error) {
    failures.push(`${relative(dir, file)}: ${error.message}`);
  }
}

await mkdir(dirname(out), { recursive: true });
await writeFile(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), maxBytes, assets }, null, 2)}\n`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
console.log(`Wrote ${assets.length} asset record(s) to ${out}`);
