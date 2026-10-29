// Windowless check of the built desktop app: copies the exe to a temp folder outside the repo,
// runs it in smoke mode (window never shown) and fails unless the UI rendered all lessons.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const exe = process.argv[2] ?? join(root, 'src-tauri/target/release/algo-visual.exe');
const dir = mkdtempSync(join(tmpdir(), 'algo-visual-smoke-'));
const copy = join(dir, 'AlgoVisual.exe');
copyFileSync(exe, copy);
const r = spawnSync(copy, [], { cwd: dir, env: { ...process.env, ALGO_VISUAL_SMOKE: '1' }, encoding: 'utf8', timeout: 60_000 });
rmSync(dir, { recursive: true, force: true });
const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
const lessons = Number(/lessons=(\d+)/.exec(out)?.[1] ?? 0);
if (r.status !== 0 || lessons < 1) {
  console.error(`Desktop smoke test FAILED (exit ${r.status}). ${out}`);
  process.exit(1);
}
console.log(`Desktop smoke test passed: ${out}`);
