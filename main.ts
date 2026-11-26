// Round 3 entry for news-image-20261126 ("The World in One Page").
// Validates the bundled entry.png (1024x1024 RGB, <= 1 MiB) and writes it
// deterministically to $MAKEFUN_OUTPUT_DIR/entry.png (default: ./out).
// Node 22+ stdlib only; no dependencies.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1_048_576;
const WANT_W = 1024;
const WANT_H = 1024;

// CRC-32 (IEEE 802.3) table, built once at startup.
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE.push(c >>> 0);
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function fail(msg: string): never {
  throw new Error(`entry.png validation failed: ${msg}`);
}

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = join(here, "entry.png");
if (!existsSync(srcPath)) fail(`missing ${srcPath}`);

const png = readFileSync(srcPath);
if (png.length > MAX_BYTES) fail(`size ${png.length} exceeds ${MAX_BYTES} bytes`);
if (png.length < 8) fail("file too short to be a PNG");

const MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!png.subarray(0, 8).equals(MAGIC)) fail("bad PNG signature");

// Walk every chunk, verifying CRCs and the IHDR header.
let offset = 8;
let seenIHDR = false;
let seenIEND = false;
let idatBytes = 0;
let width = 0;
let height = 0;
let first = true;
while (offset < png.length) {
  if (offset + 8 > png.length) fail(`truncated chunk header at ${offset}`);
  const len = png.readUInt32BE(offset);
  const type = png.subarray(offset + 4, offset + 8).toString("latin1");
  if (first && type !== "IHDR") fail(`first chunk is ${type}, expected IHDR`);
  first = false;
  if (type === "IDAT") idatBytes += len;
  if (offset + 12 + len > png.length) fail(`truncated ${type} chunk at ${offset}`);
  const data = png.subarray(offset + 8, offset + 8 + len);
  const storedCrc = png.readUInt32BE(offset + 8 + len);
  const actualCrc = crc32(Buffer.concat([png.subarray(offset + 4, offset + 8), data]));
  if (storedCrc !== actualCrc) fail(`${type} chunk CRC mismatch`);
  if (type === "IHDR") {
    if (seenIHDR) fail("duplicate IHDR");
    seenIHDR = true;
    if (len !== 13) fail("IHDR length is not 13");
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    const bitDepth = data[8];
    const colorType = data[9];
    if (width !== WANT_W || height !== WANT_H) {
      fail(`dimensions ${width}x${height}, expected ${WANT_W}x${WANT_H}`);
    }
    if (bitDepth !== 8 || colorType !== 2) {
      fail(`expected 8-bit RGB (depth 8, color 2), got depth ${bitDepth}, color ${colorType}`);
    }
  }
  if (type === "IEND") {
    if (len !== 0) fail("IEND must be empty");
    seenIEND = true;
    offset += 12 + len;
    break;
  }
  offset += 12 + len;
}
if (!seenIHDR) fail("no IHDR chunk");
if (!seenIEND) fail("no IEND chunk");
if (idatBytes === 0) fail("no IDAT image data");
if (offset !== png.length) fail(`${png.length - offset} trailing bytes after IEND`);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(here, "out");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.png");
writeFileSync(outPath, png);

const sha = createHash("sha256").update(png).digest("hex");
console.log(`validated entry.png: ${width}x${height} RGB, ${png.length} bytes, sha256 ${sha}`);
console.log(`wrote ${outPath}`);
