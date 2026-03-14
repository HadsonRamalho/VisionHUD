import math
import os
import subprocess
import sys
import tempfile
import uuid

import cv2
from ultralytics import YOLO


def processar_video_cyberpunk(
    video_entrada: str, video_saida: str, musica_lofi: str = None
):
    model = YOLO("yolov8n.pt")

    cap = cv2.VideoCapture(video_entrada)
    if not cap.isOpened():
        print(f"[-] Erro ao abrir o vídeo original: {video_entrada}", flush=True)
        return

    fps = int(cap.get(cv2.CAP_PROP_FPS))
    largura = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    altura = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    unique_id = uuid.uuid4().hex
    diretorio_temp = tempfile.gettempdir()
    temp_video = os.path.join(diretorio_temp, f"temp_{unique_id}.mp4")

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(temp_video, fourcc, fps, (largura, altura))

    COR_BOX = (22, 158, 105)
    COR_LINHA = (158, 230, 202)
    DISTANCIA_MAXIMA = 250

    print("[*] Iniciando inferência e renderização...", flush=True)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        resultados = model.track(frame, persist=True, verbose=False)
        centroides = []

        if resultados[0].boxes is not None and resultados[0].boxes.id is not None:
            boxes = resultados[0].boxes.xyxy.cpu().numpy()
            ids = resultados[0].boxes.id.cpu().numpy()

            for box, obj_id in zip(boxes, ids):
                x1, y1, x2, y2 = map(int, box)
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                centroides.append((cx, cy))

                cv2.rectangle(frame, (x1, y1), (x2, y2), COR_BOX, 2)

                texto_hud = f"OBJ_{int(obj_id)} [V169]"
                cv2.putText(
                    frame,
                    texto_hud,
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    COR_BOX,
                    1,
                )
                cv2.circle(frame, (cx, cy), 3, COR_LINHA, -1)

        for i in range(len(centroides)):
            for j in range(i + 1, len(centroides)):
                pt1 = centroides[i]
                pt2 = centroides[j]
                dist = math.hypot(pt2[0] - pt1[0], pt2[1] - pt1[1])

                if dist < DISTANCIA_MAXIMA:
                    cv2.line(frame, pt1, pt2, COR_LINHA, 1)

        writer.write(frame)

    cap.release()
    writer.release()
    print("[*] Processamento visual concluído.", flush=True)

    if musica_lofi and musica_lofi.strip() != "":
        print("[*] Sincronizando trilha Lofi e convertendo codec...", flush=True)
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            temp_video,
            "-stream_loop",
            "-1",
            "-i",
            musica_lofi,
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-shortest",
            video_saida,
        ]
    else:
        print(
            "[*] Convertendo codec de vídeo para compatibilidade universal...",
            flush=True,
        )
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            temp_video,
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            video_saida,
        ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"[-] Erro no FFmpeg: {result.stderr}", flush=True)
    else:
        status_audio = (
            "com música" if musica_lofi and musica_lofi.strip() != "" else "sem música"
        )
        print(f"[+] Vídeo final salvo {status_audio} em: {video_saida}", flush=True)

    if os.path.exists(temp_video):
        os.remove(temp_video)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("[-] Argumentos insuficientes passados pela API.", flush=True)
        sys.exit(1)

    video_in = sys.argv[1]
    video_out = sys.argv[2]
    audio_in = sys.argv[3] if len(sys.argv) > 3 else None

    processar_video_cyberpunk(video_in, video_out, audio_in)
