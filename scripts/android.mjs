// Runs a Tauri Android command with the toolchain located automatically, so no system-wide variables are needed.
// Usage: node scripts/android.mjs <tauri android args…>   e.g.  node scripts/android.mjs build --apk
// The project must sit on a drive that can hold symbolic links (NTFS): the Tauri CLI links the compiled library
// into the Gradle project.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

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

export function runAndroid(args) {
  const r = spawnSync('npx', ['tauri', 'android', ...args], { cwd: root, stdio: 'inherit', env: androidEnv(), shell: true });
  return r.status ?? 1;
}

if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) process.exit(runAndroid(process.argv.slice(2)));
