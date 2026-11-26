// Entry point for news-image-20261126 (round 2): "Thursday 26 November 2026".
// Validates the bundled entry.png (PNG signature) and copies it to the
// harness output directory as entry.png. Node 22, standard library only.
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? join(HERE, "output");
const OUT = join(OUT_DIR, "entry.png");

// The 8-byte PNG file signature every valid PNG starts with.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const bytes = await readFile(SRC);
if (bytes.length < PNG_SIGNATURE.length || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a PNG file (bad signature)");
}

// Walk every PNG chunk and verify its CRC-32, so a truncated or corrupted
// file is caught here instead of silently shipping a broken image.
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
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

let offset = 8;
let chunkCount = 0;
let sawIend = false;
while (offset + 8 <= bytes.length) {
  const length = bytes.readUInt32BE(offset);
  const type = bytes.toString("ascii", offset + 4, offset + 8);
  const dataStart = offset + 8;
  const dataEnd = dataStart + length;
  const crcEnd = dataEnd + 4;
  if (crcEnd > bytes.length) throw new Error(`entry.png: chunk ${type} is truncated`);
  const stored = bytes.readUInt32BE(dataEnd);
  const computed = crc32(bytes.subarray(offset + 4, dataEnd));
  if (stored !== computed) {
    throw new Error(`entry.png: CRC mismatch in chunk ${type}`);
  }
  chunkCount++;
  if (type === "IEND") { sawIend = true; break; }
  offset = crcEnd;
}
if (!sawIend) throw new Error("entry.png: missing IEND chunk");
console.log(`entry.png chunks OK (${chunkCount} chunks, CRC-32 verified)`);

// The first chunk must be IHDR; its width/height fields pin the image to
// the competition's 1024x1024 canvas, and the file must stay under 1 MiB.
const ihdrLength = bytes.readUInt32BE(8);
const ihdrType = bytes.toString("ascii", 12, 16);
if (ihdrType !== "IHDR" || ihdrLength !== 13) {
  throw new Error("entry.png: first chunk is not a valid IHDR");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png: expected 1024x1024, got ${width}x${height}`);
}
if (bytes.length > 1024 * 1024) {
  throw new Error(`entry.png: ${bytes.length} bytes exceeds the 1 MiB limit`);
}
console.log(`entry.png dimensions OK (${width}x${height}, ${bytes.length} bytes)`);

await mkdir(OUT_DIR, { recursive: true });
await copyFile(SRC, OUT);

const outStat = await stat(OUT);
console.log(`entry.png OK (${bytes.length} bytes) -> ${OUT} (${outStat.size} bytes)`);
