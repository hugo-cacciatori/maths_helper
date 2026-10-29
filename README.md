# Algo Visual

Learn how to reason about the cost of algorithms by seeing and doing. Algo Visual is a set of short, guided,
interactive lessons: drag curves, step through code, sorts and searches, solve puzzles yourself — with instant
feedback at every step.

## How to use it
1. Download the app from the latest release:
   - **Windows:** `AlgoVisual-<version>-windows-portable.exe` — run it, no installation needed. Windows may warn
     about an unknown publisher the first time: choose **More info → Run anyway**.
   - **Android 7 or newer:** `AlgoVisual-<version>-android.apk` — open it on your phone and allow installing apps
     from your browser or file manager when asked.

   Both work offline.
2. Pick a lesson and follow the steps: read, watch or play with the visual, answer, get feedback, continue.
   Your progress is saved on your device and you can resume any lesson where you left off.
3. Questions you get wrong are collected: use **Review mistakes** on the home screen to practise them again.
4. Keyboard: press Enter to check an answer or continue, and 1–9 (or A–F) to pick a multiple-choice answer.

## Building from source
Requirements: Node.js 22+ and the Rust toolchain; for Android also the Android SDK, NDK and JDK 17+.

```bash
npm install
npm run dev            # development server
npm run check          # type-check + headless tests
npm run build:desktop  # portable Windows executable
npm run build:android  # Android APK (signed if a release key is configured)
```
