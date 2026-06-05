// KoMMcreator – Tauri Backend (Rust)
//
// Verantwortlich für:
// - Medienverarbeitung (FFmpeg-Integration für Bild+Audio, Video+Audio Kombination)
// - Dateisystem-Zugriff (Medien laden/speichern)
// - Native Performance für schwere Operationen

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

/// Kombiniert eine Bilddatei mit einer Audiodatei zu einem Video-NFT.
/// Wird für den Medientyp "Bild + Musik" verwendet.
#[tauri::command]
async fn combine_image_audio(
    image_path: String,
    audio_path: String,
    output_path: String,
) -> Result<String, String> {
    // FFmpeg-Befehl: Bild + Audio → Video
    let output = tokio::process::Command::new("ffmpeg")
        .args([
            "-loop", "1",
            "-i", &image_path,
            "-i", &audio_path,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            "-pix_fmt", "yuv420p",
            "-y",
            &output_path,
        ])
        .output()
        .await
        .map_err(|e| format!("FFmpeg error: {}", e))?;

    if output.status.success() {
        Ok(output_path)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// Kombiniert ein Video mit einer separaten Audiodatei.
/// Wird für den Medientyp "Video + Musik" verwendet.
#[tauri::command]
async fn combine_video_audio(
    video_path: String,
    audio_path: String,
    output_path: String,
) -> Result<String, String> {
    let output = tokio::process::Command::new("ffmpeg")
        .args([
            "-i", &video_path,
            "-i", &audio_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-shortest",
            "-y",
            &output_path,
        ])
        .output()
        .await
        .map_err(|e| format!("FFmpeg error: {}", e))?;

    if output.status.success() {
        Ok(output_path)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// Generiert ein Thumbnail aus einem Video oder Bild.
#[tauri::command]
async fn generate_thumbnail(
    input_path: String,
    output_path: String,
    size: Option<String>,
) -> Result<String, String> {
    let scale = size.unwrap_or_else(|| "400:400".to_string());

    let output = tokio::process::Command::new("ffmpeg")
        .args([
            "-i", &input_path,
            "-vf", &format!("scale={},crop=min(iw\\,ih):min(iw\\,ih)", scale),
            "-frames:v", "1",
            "-y",
            &output_path,
        ])
        .output()
        .await
        .map_err(|e| format!("FFmpeg error: {}", e))?;

    if output.status.success() {
        Ok(output_path)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            combine_image_audio,
            combine_video_audio,
            generate_thumbnail,
        ])
        .run(tauri::generate_context!())
        .expect("error while running KoMMcreator");
}
