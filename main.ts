// news-image-20261126 — entrypoint.
// Copies the pre-rendered 1024x1024 news image (entry.png, in this repo)
// to $MAKEFUN_OUTPUT_DIR/entry.png (fallback: /output/entry.png).
// The image itself is a static file: it is rendered once, deterministically,
// from HTML + headless Chrome, and only copied here. This program validates
// the PNG before copying so a corrupt file can never be submitted silently.

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1024 * 1024; // competition limit: 1 MiB

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output/entry.png";
const target = outDir.endsWith(".png") ? outDir : join(outDir, "entry.png");

const png = readFileSync(source);
if (png.length > MAX_BYTES) {
  throw new Error(`entry.png is ${png.length} bytes, over the 1 MiB limit`);
}
if (png.length < 8 || !png.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a valid PNG (bad signature)");
}

// CRC-32 (IEEE 802.3, polynomial 0xedb88320) chunk walk: every PNG chunk
// carries a CRC over its type + data. A single flipped byte anywhere in
// the file must fail the run instead of shipping a corrupt image.
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

let offset = 8;
let firstChunk = true;
let seenIend = false;
let chunkCount = 0;
while (offset + 8 <= png.length) {
  const length = png.readUInt32BE(offset);
  const type = png.toString("latin1", offset + 4, offset + 8);
  if (offset + 12 + length > png.length) {
    throw new Error(`PNG chunk ${type} at offset ${offset} is truncated`);
  }
  const storedCrc = png.readUInt32BE(offset + 8 + length);
  const actualCrc = crc32(png.subarray(offset + 4, offset + 8 + length));
  if (storedCrc !== actualCrc) {
    throw new Error(`PNG chunk ${type} at offset ${offset} fails CRC check`);
  }
  if (firstChunk && type !== "IHDR") throw new Error("first PNG chunk is not IHDR");
  firstChunk = false;
  if (type === "IHDR") {
    const width = png.readUInt32BE(offset + 8);
    const height = png.readUInt32BE(offset + 12);
    if (width !== 1024 || height !== 1024) {
      throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
    }
  }
  if (type === "IEND") seenIend = true;
  chunkCount++;
  offset += 12 + length;
}
if (!seenIend || offset !== png.length) {
  throw new Error("PNG is missing IEND or has trailing bytes");
}
console.log(`PNG valid: ${chunkCount} chunks, CRC-32 walk passed`);

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

const written = statSync(target);
if (written.size !== png.length) {
  throw new Error(`copy failed: wrote ${written.size} bytes, expected ${png.length}`);
}
console.log(`wrote ${target} (${written.size} bytes)`);
