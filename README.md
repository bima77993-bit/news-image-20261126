[![make.fun · news-image-20261126](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![rank](https://make.fun/badge/news-image-20261126/bima77993-bit/news-image-20261126/rank.svg)](https://make.fun/bounty/news-image-20261126/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![reward](https://make.fun/badge/news-image-20261126/bima77993-bit/news-image-20261126/reward.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

# Thursday 26 November 2026: 36 stories, 9 regions — missiles over Riyadh, EU summit on Ukraine's €45bn loan, SpaceX's million satellites, Gukesh–Sindarov Game 3 — 13 drawn scenes, map, UTC timeline, date check

A single 1024×1024 front-page image summing up 26 November 2026's world news:
**36 verified stories** — 3 heroes, 12 mid stories, 17 briefs, 4 micros — drawn in
print duotone (black ink + one brick-red accent on newsprint), as a newspaper front
page, not a poster.

## Structure

- **Masthead** — "Thursday 26 Nov 2026" with a date check: every story was first
  reported 23–26 Nov 2026. A descriptive deck under it lists the day's strongest
  items and the features (13 drawn scenes, world map, UTC timeline, date check).
- **Hero 1 (lead, Middle East / energy)** — Houthi missiles on Riyadh, oil jumps;
  Brent ~$94.50 at Thursday midday, with the Thursday-morning update: 2 more
  ballistic missiles at Riyadh intercepted, + 2 drones, 3rd night in a row; PIF
  tower damaged, no casualties. The refinery hit stays labelled a Houthi CLAIM.
- **Hero 2 (America / markets)** — Trump proposes tariffs on 14 partners: Vietnam
  up to 35%, India up to 25% (17% with a deal), China 20%. Proposed, not in force.
  Nasdaq closed Wednesday −0.62% (as much as −4.1% intraday), Nvidia −3.91%.
  US markets closed Thursday (Thanksgiving).
- **Hero 3 (Asia / nuclear, first reported today)** — Kim orders wider tactical
  nuclear deployment (KCNA).
- **Mid grid (12, each with its own drawn scene)** — Ukraine, Cairo (31 dead,
  21 hurt), Sudan (19 dead, 20 hurt), Netanyahu, Rosstat leak (490,334),
  Chen Jining, Lukoil ($10bn swap), Huawei (10 of 12 counts), Microsoft
  Code Red, Bogor mine (at least 16 dead, 10 trapped), Malaysia vs Google
  ($146m lawsuit), Abrego Garcia.
- **In Brief (17)** — EU summit in Brussels (€45bn Ukraine loan + €1.582tn
  budget, decision due in December), FCC clears SpaceX's 1 million Starmind
  satellites (authorisation, none launched), US tells citizens to leave Iran
  immediately, Bank of Korea hikes to 3.25% (5–2 vote), Taiwan's Taiex
  rebounds 2.5% to 39,151.81, Gaza, Venezuela ($237.5bn debt), Shenzhou-24,
  Sooryavanshi 204, Anthropic ($82.79 Wednesday close, after a $73.85 record
  low, still below the $83 IPO), Colombia, US GDP Q3 4.3%, UN femicide report
  (47,000), Australia inflation 4.9%, nor'easter + Macy's parade moved to
  Sat 28 Nov, Nigeria meth lab ($227m), Ukraine corvette off Libya.
- **Micro (4)** — Bangladesh garment wage +36%, Mississippi plane crash
  (family of 6), India Constitution Day / 18 years since 26/11, World Chess
  Gukesh–Sindarov tied 1–1 (Game 3 today, 15:00 CET — no result yet).
- **World map** — stylised continents with story locations, plus a UTC timeline
  of the day and a CLAIMED vs CONFIRMED honesty box.

## How it is built

`main.ts` (Node 22, stdlib only) validates the bundled `entry.png`
(PNG signature, CRC-32 chunk walk, IHDR 1024×1024 8-bit RGB, at least one
IDAT chunk, no duplicate IHDR, IEND with no trailing bytes, ≤ 1 MiB) and
writes its exact bytes deterministically to `$MAKEFUN_OUTPUT_DIR/entry.png`.

## Verification (local, round 4)

- `entry.png` 1024×1024 RGB, 348,516 bytes (< 1 MiB),
  sha256 `93337edf451c68114e2735047dd7aaae86184bb7f7e4b4352fd0aacc3594073a`
- Rendered twice via headless Chrome/CDP: byte-identical, "no truncations",
  footBottom 1017/1024; checked visually at full size and at 300 px.
- `main.ts` (fresh, written from scratch for round 4, revised in 2 messages)
  runs twice with identical output bytes.
- Facts checked against the round-4 research (Bogor at least 16 dead /
  10 trapped, Brent ~$94.50, Anthropic $82.79 Wednesday close, tariff rates
  Vietnam 35% / India 25%/17% / China 20%, EU loan not agreed, Starmind
  authorised not launched, Game 3 without a result).

## Links

- Competition: https://make.fun/bounty/news-image-20261126
- Leaderboard: https://make.fun/bounty/news-image-20261126/leaderboard
