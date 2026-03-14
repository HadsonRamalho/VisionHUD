"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Square,
  Cpu,
  Zap,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dropzone } from "@/components/dropzone";
import { Terminal, type TerminalLog } from "@/components/terminal";
import { toast } from "sonner";

type ProcessingStatus = "idle" | "processing" | "completed" | "error";
type HardwareType = "CPU" | "GPU";

export default function DashboardPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [outputPath, setOutputPath] = useState<string>("");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [hardware, setHardware] = useState<HardwareType>("GPU");
  const [logs, setLogs] = useState<TerminalLog[]>([]);

  const isProcessing = status === "processing";
  const canProcess = videoFile && outputPath && !isProcessing;

  const addLog = useCallback(
    (message: string, type: TerminalLog["type"] = "info") => {
      const log: TerminalLog = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        message,
        type,
      };
      setLogs((prev) => [...prev, log]);
    },
    [],
  );

  const processVideoAPI = useCallback(async () => {
    if (!videoFile) {
      toast.error("Selecione um vídeo de entrada.");
      return;
    }

    setStatus("processing");
    setProgress(10);
    setLogs([]);

    addLog("Iniciando upload e processamento...", "system");
    addLog(`Hardware selecionado: ${hardware}`, "info");

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      if (audioFile) {
        formData.append("audio", audioFile);
      }

      setProgress(30);
      addLog("Enviando dados para a API...", "info");

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/process-video`;
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      setProgress(80);
      addLog("Download do vídeo processado iniciado...", "success");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = outputPath
        ? `${outputPath}.mp4`
        : "video_hud_processado.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      setProgress(100);
      setStatus("completed");
      addLog("Processamento e exportação concluídos!", "success");
      toast.success("Vídeo processado e salvo com sucesso!");
    } catch (error: any) {
      setStatus("error");
      setProgress(0);
      addLog(`Falha crítica: ${error.message}`, "error");
      toast.error("Erro ao processar o vídeo.");
    }
  }, [videoFile, audioFile, outputPath, hardware, addLog]);

  const handleCancel = () => {
    setStatus("idle");
    setProgress(0);
    addLog("Processamento cancelado pelo usuário", "warning");
    toast.warning("Processamento cancelado");
  };

  const handleReset = () => {
    setVideoFile(null);
    setAudioFile(null);
    setOutputPath("");
    setStatus("idle");
    setProgress(0);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="font-mono text-sm font-bold">
                <span className="text-primary">Vision</span>HUD
              </span>
              <Badge
                variant="outline"
                className="font-mono text-[10px] border-primary/50 text-primary"
              >
                DASHBOARD
              </Badge>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="font-mono text-lg flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-primary" />
                  Arquivos de Entrada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dropzone
                  type="video"
                  accept={{
                    "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
                  }}
                  file={videoFile}
                  onFileSelect={setVideoFile}
                  disabled={isProcessing}
                  required
                />

                <Dropzone
                  type="audio"
                  accept={{
                    "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
                  }}
                  file={audioFile}
                  onFileSelect={setAudioFile}
                  disabled={isProcessing}
                />

                <Dropzone
                  type="output"
                  outputPath={outputPath}
                  onFileSelect={() => {}}
                  onOutputSelect={setOutputPath}
                  disabled={isProcessing}
                  required
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="font-mono text-lg flex items-center gap-2">
                  <span className="text-primary">$</span>
                  Terminal de Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Terminal logs={logs} isProcessing={isProcessing} />
              </CardContent>
            </Card>

            {(isProcessing || status === "completed") && (
              <Card className="border-primary/20">
                <CardContent className="py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-muted-foreground">
                        Progresso
                      </span>
                      <span className="font-mono text-sm text-primary">
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {!canProcess && status === "idle" && (
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-mono text-sm font-medium text-yellow-500">
                        Campos obrigatórios pendentes
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        Selecione um vídeo de entrada e defina o nome de saída
                        para iniciar o processamento.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              {status === "completed" ? (
                <Button
                  onClick={handleReset}
                  className="flex-1 h-14 font-mono text-base"
                  variant="outline"
                >
                  Processar Novo Video
                </Button>
              ) : isProcessing ? (
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  className="flex-1 h-14 font-mono text-base"
                >
                  <Square className="h-5 w-5 mr-2" />
                  CANCELAR
                </Button>
              ) : (
                <Button
                  onClick={processVideoAPI}
                  disabled={!canProcess}
                  className="flex-1 h-14 font-mono text-base disabled:animate-none"
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="h-5 w-5 mr-2" />
                      RENDERIZANDO...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      INICIAR PROCESSAMENTO
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
