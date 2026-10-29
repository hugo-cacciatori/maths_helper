package io.github.hugocacciatori.algovisual

import android.os.Bundle
import android.system.Os
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // `adb shell am start … --ez smoke true` runs the windowless self-check (see src-tauri/src/lib.rs).
    // The Rust app starts inside super.onCreate, so the variable must be set first.
    if (intent?.getBooleanExtra("smoke", false) == true) Os.setenv("ALGO_VISUAL_SMOKE", "1", true)
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }
}
