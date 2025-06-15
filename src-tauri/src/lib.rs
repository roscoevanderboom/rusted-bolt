// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod fs;
mod sys_info;
pub use fs::*;
pub use sys_info::*;

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn close_browser() {
    println!("close browser");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .on_window_event(|window, event| {
            use tauri::WindowEvent;
            match event {
                WindowEvent::CloseRequested { .. } => {
                    println!("Window '{}' close requested", window.label());
                }
                WindowEvent::Destroyed => {
                    println!("Window '{}' destroyed", window.label());
                    if window.label() == "main" {
                        let app_handle = window.app_handle();
                        if let Some(browser) = app_handle.webview_windows().get("browser") {
                            let _ = browser.close();
                        }
                    }
                }
                WindowEvent::Focused(focused) => {
                    println!("Window '{}' focused: {}", window.label(), focused);
                }
                WindowEvent::Resized(size) => {
                    println!("Window '{}' resized: {:?}", window.label(), size);
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_memory_info,
            get_cpu_info,
            get_disk_info,
            extract_zip,
            read_file_base64,
            extract_pdf_text,
            close_browser,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
