package io.github.hugocacciatori.algovisual

import android.os.Bundle
import android.system.Os
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // `adb shell am start … --ez smoke true` runs the windowless self-check (see src-tauri/src/lib.rs).
    // The Rust app starts inside super.onCreate, so the variable must be set first.
    if (intent?.getBooleanExtra("smoke", false) == true) Os.setenv("ALGO_VISUAL_SMOKE", "1", true)
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    // Edge-to-edge is enforced on Android 15+: keep the page clear of the status bar, navigation bar and camera
    // cutout. The strips show the window background, which matches the page (themes.xml).
    ViewCompat.setOnApplyWindowInsetsListener(findViewById<View>(android.R.id.content)) { view, insets ->
      val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
      view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
      WindowInsetsCompat.CONSUMED
    }
  }
}
