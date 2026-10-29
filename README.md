# Algo Visual

Learn how to reason about the cost of algorithms by seeing and doing. Algo Visual is a set of short, guided,
interactive lessons: drag curves, step through code, sorts and searches, solve puzzles yourself — with instant
feedback at every step.

## How to use it
1. Download the latest release and unzip it.
2. Either run `AlgoVisual-<version>-windows-portable.exe` (no installation needed), or open
   `AlgoVisual-<version>-web.html` in any modern browser — it works offline, on desktop or phone.
3. Pick a lesson and follow the steps: read, watch or play with the visual, answer, get feedback, continue.
   Your progress is saved on your device and you can resume any lesson where you left off.
4. Questions you get wrong are collected: use **Review mistakes** on the home screen to practise them again.
5. Keyboard: press Enter to check an answer or continue, and 1–9 (or A–F) to pick a multiple-choice answer.

## Building from source
Requirements: Node.js 22+, and for the desktop app the Rust toolchain.

```bash
npm install
npm run dev            # development server
npm run check          # type-check + headless tests
npm run build:web      # single-file offline HTML in dist-web/
npm run build:desktop  # portable desktop executable
```
