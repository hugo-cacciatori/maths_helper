// Self-check of the built APK on a real phone connected over USB (adb, USB debugging on): installs the APK,
// starts it in smoke mode and waits for the page's report in logcat. Fails unless the UI rendered all lessons.
// Nothing opens on the computer; the app shows on the phone for a few seconds and closes itself.
// If the app was already on the phone it is updated in place (progress kept) and left installed.
// Usage: npm run test:android [-- path/to/app.apk]   ALGO_VISUAL_DEVICE=<serial> picks a device when several are plugged in.
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { androidEnv } from './android.mjs';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const apk = process.argv[2] ?? join(root, 'src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk');
const env = androidEnv();
const adbPath = join(env.ANDROID_HOME, 'platform-tools', 'adb.exe');
const PKG = 'io.github.hugocacciatori.algovisual';

const run = (...args) => execFileSync(adbPath, args, { env, encoding: 'utf8', timeout: 120_000 }).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const phones = run('devices')
  .split(/\r?\n/)
  .slice(1)
  .map((l) => l.split(/\s+/))
  .filter(([serial, state]) => state === 'device' && !serial.startsWith('emulator-'))
  .map(([serial]) => serial);
const serial = process.env.ALGO_VISUAL_DEVICE ?? phones[0];
if (!serial) {
  console.error('Android smoke test FAILED: no phone connected. Plug one in with USB debugging enabled.');
  process.exit(1);
}
if (!process.env.ALGO_VISUAL_DEVICE && phones.length > 1) console.log(`Several phones connected, using ${serial}.`);
const adb = (...args) => run('-s', serial, ...args);

const wasInstalled = adb('shell', 'pm', 'list', 'packages', PKG).split(/\r?\n/).includes(`package:${PKG}`);
let code = 1;
try {
  adb('install', '-r', apk);
  adb('logcat', '-c');
  adb('shell', 'am', 'start', '-W', '-n', `${PKG}/.MainActivity`, '--ez', 'smoke', 'true');
  let line;
  for (let t = 0; t < 60 && !line; t++) {
    await sleep(1000);
    line = /smoke: [^\r\n]+/.exec(adb('logcat', '-d', '-s', 'AlgoVisual'))?.[0];
  }
  const lessons = Number(/lessons=(\d+)/.exec(line ?? '')?.[1] ?? 0);
  if (line?.includes('ok=true') && lessons > 0) {
    console.log(`Android smoke test passed on ${adb('shell', 'getprop', 'ro.product.model')} (${serial}): ${line}`);
    code = 0;
  } else console.error(`Android smoke test FAILED: ${line ?? 'no report within 60 s'}`);
} catch (e) {
  console.error(`Android smoke test FAILED: ${e.message}`);
} finally {
  try {
    adb('shell', 'am', 'force-stop', PKG);
    if (!wasInstalled) adb('uninstall', PKG);
  } catch {
    /* already gone */
  }
}
process.exit(code);
