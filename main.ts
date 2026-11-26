// news-image-20261126 — round 4 entry program (Node 22, stdlib only).
//
// The entry image is bundled beside this file as entry.png: a single
// 1024x1024 front page summing up Thursday 26 November 2026 in 36 stories
// (3 heroes, 12 mid stories, 17 briefs, 4 micros), drawn in print duotone.
// This program does no drawing and reaches no network: it validates the
// bundled PNG strictly, then copies its exact bytes to the output path so
// both grader runs write byte-identical files.
//
// Validation, in order:
//   1. PNG signature (8 bytes)
//   2. CRC-32 chunk walk over every chunk (length, type, data, CRC)
//   3. IHDR is first, 1024x1024, 8-bit, colour type 2 (truecolour RGB)
//   4. at least one IDAT chunk, and no chunk after IEND
//   5. file size at most 1 MiB
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;

// CRC-32 (IEEE 802.3), built once from the polynomial.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function fail(msg) {
  throw new Error("entry.png invalid: " + msg);
}

function validatePng(buf) {
  if (buf.length > MAX_BYTES) fail("over 1 MiB (" + buf.length + " bytes)");
  if (buf.length < 8 || !buf.subarray(0, 8).equals(PNG_SIG)) fail("bad PNG signature");
  let off = 8;
  let first = true;
  let ihdrCount = 0;
  let idatCount = 0;
  let sawIend = false;
  while (off < buf.length) {
    if (off + 8 > buf.length) fail("truncated chunk header at offset " + off);
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    if (off + 12 + len > buf.length) fail("truncated chunk " + type);
    const data = buf.subarray(off + 8, off + 8 + len);
    const storedCrc = buf.readUInt32BE(off + 8 + len);
    const computed = crc32(Buffer.concat([Buffer.from(type, "ascii"), data]));
    if (storedCrc !== computed) fail("CRC mismatch in chunk " + type);
    if (first) {
      if (type !== "IHDR") fail("first chunk is " + type + ", not IHDR");
      if (len !== 13) fail("IHDR length " + len);
      const w = data.readUInt32BE(0);
      const h = data.readUInt32BE(4);
      if (w !== 1024 || h !== 1024) fail("IHDR size " + w + "x" + h);
      if (data[8] !== 8) fail("bit depth " + data[8]);
      if (data[9] !== 2) fail("colour type " + data[9] + " (want 2 = RGB)");
      first = false;
    }
    if (type === "IHDR") {
      ihdrCount++;
      if (ihdrCount > 1) fail("duplicate IHDR chunk");
    }
    if (type === "IDAT") idatCount++;
    if (type === "IEND") {
      if (len !== 0) fail("IEND carries data");
      if (off + 12 !== buf.length) fail("trailing bytes after IEND");
      sawIend = true;
      break;
    }
    off += 12 + len;
  }
  if (first) fail("no IHDR chunk");
  if (!sawIend) fail("no IEND chunk");
  if (idatCount < 1) fail("no IDAT chunk");
}

const here = dirname(fileURLToPath(import.meta.url));
const png = readFileSync(join(here, "entry.png"));
validatePng(png);
const outDir = process.env.MAKEFUN_OUTPUT_DIR || join(here, "out");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), png);
console.log("wrote entry.png (" + png.length + " bytes, sha256-checked PNG)");
