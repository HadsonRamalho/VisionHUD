import math
import os
import subprocess
import sys
import tempfile
import uuid
from collections import deque

import cv2
import numpy as np
from ultralytics import YOLO


def desenhar_reticulas(img, x1, y1, x2, y2, cor, espessura=2, comprimento=15):
    cv2.line(img, (x1, y1), (x1 + comprimento, y1), cor, espessura)
    cv2.line(img, (x1, y1), (x1, y1 + comprimento), cor, espessura)
    cv2.line(img, (x2, y1), (x2 - comprimento, y1), cor, espessura)
    cv2.line(img, (x2, y1), (x2, y1 + comprimento), cor, espessura)
    cv2.line(img, (x1, y2), (x1 + comprimento, y2), cor, espessura)
    cv2.line(img, (x1, y2), (x1, y2 - comprimento), cor, espessura)
    cv2.line(img, (x2, y2), (x2 - comprimento, y2), cor, espessura)
    cv2.line(img, (x2, y2), (x2, y2 - comprimento), cor, espessura)


def processar_video(video_entrada: str, video_saida: str, musica_lofi: str = None):
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

    CORES_CLASSES = {
        0: (0, 255, 150),
        2: (255, 100, 255),
        3: (50, 200, 255),
        7: (255, 50, 50),
    }
    COR_DEFAULT = (158, 230, 202)
    DISTANCIA_MAXIMA = 250

    historico_rastreio = {}

    print("[*] Iniciando inferência e renderização avançada...", flush=True)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        resultados = model.track(frame, persist=True, conf=0.45, verbose=False)
        centroides = []

        if resultados[0].boxes is not None and resultados[0].boxes.id is not None:
            boxes = resultados[0].boxes.xyxy.cpu().numpy()
            ids = resultados[0].boxes.id.cpu().numpy()
            confs = resultados[0].boxes.conf.cpu().numpy()
            clss = resultados[0].boxes.cls.cpu().numpy()

            for box, obj_id, conf, cls in zip(boxes, ids, confs, clss):
                x1, y1, x2, y2 = map(int, box)
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                centroides.append((cx, cy))

                cor_obj = CORES_CLASSES.get(int(cls), COR_DEFAULT)

                if obj_id not in historico_rastreio:
                    historico_rastreio[obj_id] = deque(maxlen=15)
                historico_rastreio[obj_id].append((cx, cy))

                hist = historico_rastreio[obj_id]

                velocidade = 0
                if len(hist) > 5:
                    dx = hist[-1][0] - hist[0][0]
                    dy = hist[-1][1] - hist[0][1]
                    distancia_percorrida = math.hypot(dx, dy)
                    tempo_segundos = len(hist) / fps
                    velocidade = int(distancia_percorrida / tempo_segundos)

                desenhar_reticulas(frame, x1, y1, x2, y2, cor_obj)

                largura_box = x2 - x1
                largura_barra = int(largura_box * conf)
                cv2.rectangle(frame, (x1, y1 - 25), (x2, y1 - 20), (50, 50, 50), -1)
                cv2.rectangle(
                    frame, (x1, y1 - 25), (x1 + largura_barra, y1 - 20), cor_obj, -1
                )

                texto_hud = f"TGT_{int(obj_id)} [{int(conf * 100)}%] V:{velocidade}px/s"
                cv2.putText(
                    frame,
                    texto_hud,
                    (x1, y1 - 32),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.45,
                    cor_obj,
                    1,
                )

                for k in range(1, len(hist)):
                    if hist[k - 1] is None or hist[k] is None:
                        continue
                    espessura = int(np.sqrt(16 / float(len(hist) - k + 1)) * 1.5)
                    cv2.line(frame, hist[k - 1], hist[k], cor_obj, espessura)

                cv2.circle(frame, (cx, cy), 3, (255, 255, 255), -1)

        for i in range(len(centroides)):
            for j in range(i + 1, len(centroides)):
                pt1 = centroides[i]
                pt2 = centroides[j]
                dist = math.hypot(pt2[0] - pt1[0], pt2[1] - pt1[1])

                if dist < DISTANCIA_MAXIMA:
                    cv2.line(frame, pt1, pt2, COR_DEFAULT, 1)

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

    processar_video(video_in, video_out, audio_in)
