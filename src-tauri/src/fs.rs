use base64::{engine::general_purpose, Engine as _};

#[tauri::command]
pub fn extract_zip(zip_path: String, dest_path: String) -> Result<(), String> {
    zip_extract::extract(
        std::fs::File::open(zip_path).map_err(|e| e.to_string())?,
        std::path::Path::new(&dest_path),
        true,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_file_base64(path: String) -> Result<String, String> {
    let data = std::fs::read(&path).map_err(|e| e.to_string())?;
    let encoded = general_purpose::STANDARD.encode(&data);
    Ok(encoded)
}

#[tauri::command]
pub fn extract_pdf_text(path: String) -> Result<String, String> {
    let text = pdf_extract::extract_text(&path).map_err(|e| e.to_string())?;
    Ok(text)
}
