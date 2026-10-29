// Runs a Tauri Android command with the toolchain located automatically, so no system-wide variables are needed.
// Usage: node scripts/android.mjs <tauri android args…>   e.g.  node scripts/android.mjs build --apk
//
// The Tauri Android build links the compiled library into the Gradle project with a symbolic link. Drives that
// cannot hold links (exFAT, FAT32) make it fail, so on such a drive the project is mirrored to an NTFS folder
// outside the repository (kept between runs for incremental builds), built there, and the APKs copied back.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const APK_DIR = 'src-tauri/gen/android/app/build/outputs/apk';

export function androidEnv() {
  const env = { ...process.env };
  env.ANDROID_HOME ??= join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');
  if (!existsSync(env.ANDROID_HOME)) throw new Error(`Android SDK not found at ${env.ANDROID_HOME}; set ANDROID_HOME.`);
  if (!env.NDK_HOME) {
    const ndks = existsSync(join(env.ANDROID_HOME, 'ndk')) ? readdirSync(join(env.ANDROID_HOME, 'ndk')).sort() : [];
    if (!ndks.length) throw new Error('No NDK installed; set NDK_HOME.');
    env.NDK_HOME = join(env.ANDROID_HOME, 'ndk', ndks.at(-1));
  }
  if (!env.JAVA_HOME) {
    const javaRoot = 'C:\\Program Files\\Java';
    const jdk = existsSync(javaRoot) ? readdirSync(javaRoot).filter((d) => /^jdk-(1[7-9]|2\d)/.test(d)).sort().at(-1) : undefined;
    if (jdk) env.JAVA_HOME = join(javaRoot, jdk);
  }
  return env;
}

function canSymlink(dir) {
  const probe = join(dir, `.symlink-probe-${process.pid}`);
  try {
    writeFileSync(`${probe}.t`, '');
    symlinkSync(`${probe}.t`, probe, 'file');
    return true;
  } catch {
    return false;
  } finally {
    rmSync(probe, { force: true });
    rmSync(`${probe}.t`, { force: true });
  }
}

/** Mirrors the project (sources + node_modules, no build outputs or git data) into an NTFS folder. */
function mirror() {
  const dest = process.env.ALGO_VISUAL_ANDROID_BUILD_DIR ?? join(process.env.LOCALAPPDATA ?? tmpdir(), 'algo-visual', 'android-build');
  mkdirSync(dest, { recursive: true });
  const skipPaths = ['dist', 'dist-web', 'coverage', 'src-tauri/target', 'src-tauri/gen/android/app/build', 'src-tauri/gen/android/.gradle', 'src-tauri/gen/android/build'];
  const r = spawnSync('robocopy', [root, dest, '/MIR', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/XD', '.git', '.git-docs', ...skipPaths.map((p) => join(root, p))], {
    stdio: 'inherit',
  });
  if ((r.status ?? 16) >= 8) throw new Error(`robocopy failed (${r.status})`);
  return dest;
}

export function runAndroid(args) {
  const local = canSymlink(root);
  const cwd = local ? root : mirror();
  if (!local) console.log(`This drive cannot hold symbolic links: building in ${cwd}`);
  const r = spawnSync('npx', ['tauri', 'android', ...args], { cwd, stdio: 'inherit', env: androidEnv(), shell: true });
  if (!local && r.status === 0 && existsSync(join(cwd, APK_DIR))) {
    rmSync(join(root, APK_DIR), { recursive: true, force: true });
    cpSync(join(cwd, APK_DIR), join(root, APK_DIR), { recursive: true });
  }
  return r.status ?? 1;
}

if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) process.exit(runAndroid(process.argv.slice(2)));
