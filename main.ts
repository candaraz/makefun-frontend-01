// A working makefun-frontend-01 entry (Node 22, standard library only): the frontend is this directory's app/
// folder, plain static files a browser opens at app/index.html (ES modules, CSS, no build step), reading make.fun's
// public API at https://make.fun/api. The program hands it in: it copies app/ and screenshots/ from beside this file
// to /output and writes /output/dossier.json, the summary the judge reads (your screenshots, the first load's files
// and bytes, and your source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts as it is: the
// scorer requires dossier.json to be byte for byte what its own copy writes.
//
// A persistent live board rail, compact prize-first bounty detail, windowed leaderboard and grouped profiles share hash routes. Keep
// three PNG or JPEG screenshots of the live board, leaderboard, and profile in screenshots/; shots.json identifies
// each view, and the first by name is the cover image consumed by the dossier.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
// Clear generated trees first so repeat runs cannot carry stale assets into the dossier.
rmSync(join(out, 'app'), { recursive: true, force: true });
rmSync(join(out, 'screenshots'), { recursive: true, force: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Keep the hand-in deterministic and within the judge's three-shot limit.
const shots = readdirSync(join(out, 'screenshots')).filter((name) => !name.startsWith('.'));
if (shots.length !== 3 || shots.some((name) => !/^[A-Za-z0-9._-]+\.(?:jpe?g|png)$/i.test(name) || statSync(join(out, 'screenshots', name)).size > 262144)) {
  throw new Error('screenshots/ must contain exactly three named PNG or JPEG files, each at most 256 KiB');
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 3 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
// Never leave an earlier dossier behind if the new build fails before the write completes.
rmSync(join(out, 'dossier.json'), { force: true });
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 3, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
