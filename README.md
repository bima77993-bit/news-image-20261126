# The World in One Page — Thursday 26 November 2026

A single 1024×1024 image summing up 26 November 2026's world news:
**36 verified stories** — 3 heroes, 12 mid stories, 17 briefs, 4 micros.

## Structure

- **Masthead** — "Thursday 26 Nov 2026" with a date check: every story was
  first reported 23–26 Nov 2026.
- **Hero 1 (lead, Middle East / energy)** — Houthi missiles on Riyadh, oil
  jumps; Brent ~$94.80 on Thursday morning, with the Thursday-morning
  update: 2 more ballistic missiles at Riyadh intercepted, + 2 drones.
- **Hero 2 (America / markets)** — Trump proposes tariffs on 14 partners;
  Nasdaq closed −0.62% (as much as −4.1% intraday), Nvidia −3.91%.
- **Hero 3 (Asia / nuclear, first reported today)** — Kim orders wider
  tactical nuclear deployment (KCNA).
- **Mid grid (12)** — Ukraine, Cairo, Sudan, Netanyahu, Rosstat leak,
  Chen Jining, Lukoil, Huawei, Microsoft Code Red, Bogor mine,
  Malaysia vs Google, Abrego Garcia.
- **In Brief (17)** — Gaza, Venezuela, Shenzhou-24, BepiColombo, Petrobras,
  Andy Taylor, Colombia (10 years of FARC peace + Villavicencio car bomb),
  Sooryavanshi, Anthropic, Saudi budget, AFCON, UN femicide report,
  Australia inflation, nor'easter + Macy's parade postponed, US GDP 4.3%,
  Nigeria meth lab, Ukraine corvette off Libya.
- **Micro (4)** — Bangladesh garment wage, Mississippi plane crash,
  India Constitution Day / 18 years since 26/11, World Chess Gukesh–Sindarov
  tied 1–1 (Game 3 today).
- **World map** — stylised continents with story locations, plus a UTC
  timeline of the day and a CLAIMED vs CONFIRMED honesty box.

## How it is built

`main.ts` (Node 22, stdlib only) validates the bundled `entry.png`
(PNG signature, CRC-32 chunk walk, IHDR 1024×1024 8-bit RGB, at least one
IDAT chunk, IEND with no trailing bytes, ≤ 1 MiB) and writes it
deterministically to `$MAKEFUN_OUTPUT_DIR/entry.png`.

The image itself is rendered programmatically from HTML/CSS/SVG via
headless Chrome (CDP); no AI-generated imagery.
