use std::time::Duration;
use tauri::{Manager, webview::PageLoadEvent};

/// Set to run a windowless self-check: the window stays hidden, the page reports whether the
/// UI rendered, and the process exits with 0 (ok), 1 (UI missing) or 2 (timeout).
const SMOKE_ENV: &str = "ALGO_VISUAL_SMOKE";

#[tauri::command]
fn smoke_report(app: tauri::AppHandle, ok: bool, lessons: u32) {
    println!("smoke: ok={ok} lessons={lessons}");
    app.exit(if ok { 0 } else { 1 });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let smoke = std::env::var_os(SMOKE_ENV).is_some();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![smoke_report])
        .setup(move |app| {
            let window = app.get_webview_window("main").expect("main window");
            if smoke {
                let handle = app.handle().clone();
                std::thread::spawn(move || {
                    std::thread::sleep(Duration::from_secs(30));
                    eprintln!("smoke: timed out");
                    handle.exit(2);
                });
            } else {
                // The window is created hidden (see tauri.conf.json) so smoke runs never flash on screen.
                window.show()?;
            }
            Ok(())
        })
        .on_page_load(move |webview, payload| {
            if smoke && matches!(payload.event(), PageLoadEvent::Finished) {
                let _ = webview.eval(
                    "setTimeout(() => window.__TAURI_INTERNALS__.invoke('smoke_report', {
                        ok: document.body.innerText.includes('See the maths behind algorithms'),
                        lessons: document.querySelectorAll('a[href^=\"#/lesson/\"]').length,
                    }), 1500)",
                );
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Algo Visual");
}
