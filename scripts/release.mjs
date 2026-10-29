// Builds the Windows exe and the Android APK, smoke-tests both without showing a window, and assembles
// dist/v<version>/ with the two apps, a zip of both and SHA256SUMS.txt.
// Usage: npm run release            (uses the version in package.json)
// Bump the version first (package.json, src-tauri/tauri.conf.json, src-tauri/Cargo.toml).
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const tauriConf = JSON.parse(readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8'));
const cargo = readFileSync(join(root, 'src-tauri/Cargo.toml'), 'utf8');
if (tauriConf.version !== version || !cargo.includes(`version = "${version}"`)) {
  console.error(`Version mismatch: package.json ${version}, tauri.conf.json ${tauriConf.version}, check Cargo.toml.`);
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });
run('npm run check');
run('npm run build:desktop'); // also runs build:web via beforeBuildCommand
run('npm run test:desktop'); // windowless: the app never shows its window in smoke mode
run('npm run build:android');
run('npm run test:android'); // headless emulator, no window

const out = join(root, 'dist', `v${version}`);
// Keep only the latest local release.
if (existsSync(join(root, 'dist')))
  for (const d of readdirSync(join(root, 'dist'))) if (d.startsWith('v')) rmSync(join(root, 'dist', d), { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const exe = `AlgoVisual-${version}-windows-portable.exe`;
const apk = `AlgoVisual-${version}-android.apk`;
const zip = `AlgoVisual-${version}.zip`;
copyFileSync(join(root, 'src-tauri/target/release/algo-visual.exe'), join(out, exe));
copyFileSync(join(root, 'src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk'), join(out, apk));
execSync(`powershell -NoProfile -Command "Compress-Archive -Force -Path '${exe}','${apk}' -DestinationPath '${zip}'"`, { cwd: out, stdio: 'inherit' });

const sha = (f) => createHash('sha256').update(readFileSync(join(out, f))).digest('hex');
writeFileSync(join(out, 'SHA256SUMS.txt'), [exe, apk, zip].map((f) => `${sha(f)}  ${f}`).join('\n') + '\n');
console.log(`\nRelease assembled in dist/v${version}/`);
