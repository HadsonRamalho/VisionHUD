use axum::{
    Router,
    extract::{DefaultBodyLimit, Multipart},
    http::{Method, StatusCode, header},
    response::IntoResponse,
    routing::post,
};
use std::path::PathBuf;
use tokio::{fs, process::Command};
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let app = Router::new()
        .route("/process-video", post(gerar_video))
        .layer(DefaultBodyLimit::max(500 * 1024 * 1024))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3061").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn gerar_video(mut multipart: Multipart) -> Result<impl IntoResponse, (StatusCode, String)> {
    let req_id = Uuid::new_v4().to_string();
    let temp_dir = std::env::temp_dir();

    let mut video_path: Option<PathBuf> = None;
    let mut audio_path: Option<PathBuf> = None;
    let out_path = temp_dir.join(format!("out_{}.mp4", req_id));

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?
    {
        let name = field.name().unwrap_or("").to_string();
        let data = field
            .bytes()
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if name == "video" && !data.is_empty() {
            let path = temp_dir.join(format!("in_video_{}.mp4", req_id));
            fs::write(&path, &data).await.unwrap();
            video_path = Some(path);
        } else if name == "audio" && !data.is_empty() {
            let path = temp_dir.join(format!("in_audio_{}.mp3", req_id));
            fs::write(&path, &data).await.unwrap();
            audio_path = Some(path);
        }
    }

    let video_in = video_path.ok_or((StatusCode::BAD_REQUEST, "Vídeo ausente".to_string()))?;

    println!("[{}] Iniciando processamento do Tracker Python...", req_id);

    let mut cmd = Command::new("./binaries/tracker-x86_64-pc-windows-msvc.exe");
    cmd.arg(&video_in).arg(&out_path);

    if let Some(ref audio) = audio_path {
        cmd.arg(audio);
    } else {
        cmd.arg("");
    }

    let output = cmd
        .output()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    println!(
        "[PYTHON STDOUT]: {}",
        String::from_utf8_lossy(&output.stdout)
    );

    if !output.status.success() {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        println!("[PYTHON ERRO FATAL]: {}", error_msg);
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "Falha no motor de processamento.".to_string(),
        ));
    }

    let processed_video_bytes = fs::read(&out_path)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let _ = fs::remove_file(video_in).await;
    let _ = fs::remove_file(out_path).await;
    if let Some(audio) = audio_path {
        let _ = fs::remove_file(audio).await;
    }

    println!("[{}] Processamento finalizado.", req_id);

    let headers = [
        (header::CONTENT_TYPE, "video/mp4"),
        (
            header::CONTENT_DISPOSITION,
            "attachment; filename=\"processed.mp4\"",
        ),
    ];

    Ok((headers, processed_video_bytes))
}
