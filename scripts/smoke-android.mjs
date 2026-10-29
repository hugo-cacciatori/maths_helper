// Windowless check of the built APK: boots a headless emulator (no window, no audio), installs the APK, starts it in
// smoke mode and waits for the page's report in logcat. Fails unless the UI rendered all lessons.
// Usage: npm run test:android [-- path/to/app.apk]   (needs the "algo-visual-smoke" virtual device)
import { execFileSync, spawn } from 'node:child_process';
import { join } from 'node:path';
import { androidEnv } from './android.mjs';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const apk = process.argv[2] ?? join(root, 'src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk');
const env = androidEnv();
const adbPath = join(env.ANDROID_HOME, 'platform-tools', 'adb.exe');
const PKG = 'io.github.hugocacciatori.algovisual';
const AVD = process.env.ALGO_VISUAL_AVD ?? 'algo-visual-smoke';

const adb = (...args) => execFileSync(adbPath, args, { env, encoding: 'utf8', timeout: 120_000 }).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(what, seconds, test) {
  for (let t = 0; t < seconds; t += 2) {
    try {
      const v = test();
      if (v) return v;
    } catch {
      /* not ready yet */
    }
    await sleep(2000);
  }
  throw new Error(`timed out waiting for ${what}`);
}

const emulator = spawn(join(env.ANDROID_HOME, 'emulator', 'emulator.exe'), ['-avd', AVD, '-no-window', '-no-audio', '-no-snapshot', '-no-boot-anim'], {
  env,
  stdio: 'ignore',
});
let code = 1;
try {
  await until('the emulator to boot', 300, () => adb('wait-for-device', 'shell', 'getprop', 'sys.boot_completed') === '1');
  adb('install', '-r', apk);
  adb('logcat', '-c');
  adb('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`, '--ez', 'smoke', 'true');
  const line = await until('the smoke report', 120, () => /smoke: [^\r\n]+/.exec(adb('logcat', '-d', '-s', 'AlgoVisual'))?.[0]);
  const lessons = Number(/lessons=(\d+)/.exec(line)?.[1] ?? 0);
  if (line.includes('ok=true') && lessons > 0) {
    console.log(`Android smoke test passed: ${line}`);
    code = 0;
  } else console.error(`Android smoke test FAILED: ${line}`);
} catch (e) {
  console.error(`Android smoke test FAILED: ${e.message}`);
} finally {
  try {
    adb('uninstall', PKG);
  } catch {
    /* not installed */
  }
  try {
    adb('emu', 'kill');
  } catch {
    emulator.kill();
  }
}
process.exit(code);
