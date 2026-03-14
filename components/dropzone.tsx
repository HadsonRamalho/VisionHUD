"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileVideo,
  Music,
  FolderOpen,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DropzoneProps {
  type: "video" | "audio" | "output";
  accept?: Record<string, string[]>;
  file?: File | null;
  outputPath?: string;
  onFileSelect: (file: File | null) => void;
  onOutputSelect?: (path: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function Dropzone({
  type,
  accept,
  file,
  outputPath,
  onFileSelect,
  onOutputSelect,
  disabled = false,
  required = false,
}: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const getIcon = () => {
    switch (type) {
      case "video":
        return FileVideo;
      case "audio":
        return Music;
      case "output":
        return FolderOpen;
      default:
        return Upload;
    }
  };

  const getLabel = () => {
    switch (type) {
      case "video":
        return "Video de Entrada";
      case "audio":
        return "Trilha Sonora";
      case "output":
        return "Local de Saida";
      default:
        return "Arquivo";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "video":
        return "Arraste um video ou clique para selecionar (MP4, MOV, AVI)";
      case "audio":
        return "Arraste um audio ou clique para selecionar (MP3, WAV)";
      case "output":
        return "Selecione o diretorio de saida para o video processado";
      default:
        return "Arraste um arquivo ou clique para selecionar";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const Icon = getIcon();
  const hasFile = type === "output" ? !!outputPath : !!file;

  if (type === "output") {
    return (
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-all",
          disabled
            ? "opacity-50 cursor-not-allowed border-border"
            : outputPath
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary/50 cursor-pointer",
        )}
        onClick={() => {
          if (!disabled && onOutputSelect) {
            const simulatedPath = "output_video";
            onOutputSelect(simulatedPath);
          }
        }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-4 w-full">
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-lg transition-colors shrink-0",
                outputPath ? "bg-primary/20" : "bg-muted",
              )}
            >
              {outputPath ? (
                <CheckCircle className="h-6 w-6 text-primary" />
              ) : (
                <Icon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-mono text-sm font-semibold">
                  {getLabel()}
                </h4>
                {required && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 font-mono border-primary/50 text-primary"
                  >
                    REQ
                  </Badge>
                )}
              </div>
              {outputPath ? (
                <p className="text-xs text-primary font-mono truncate">
                  {outputPath}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground font-mono">
                  {getDescription()}
                </p>
              )}
            </div>
            {outputPath && !disabled && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOutputSelect) onOutputSelect("");
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remover</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-all",
        disabled
          ? "opacity-50 cursor-not-allowed border-border"
          : isDragActive
            ? "border-primary bg-primary/10"
            : hasFile
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary/50 cursor-pointer",
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-4 w-full">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg transition-colors shrink-0",
              hasFile
                ? "bg-primary/20"
                : isDragActive
                  ? "bg-primary/20"
                  : "bg-muted",
            )}
          >
            {hasFile ? (
              <CheckCircle className="h-6 w-6 text-primary" />
            ) : (
              <Icon
                className={cn(
                  "h-6 w-6",
                  isDragActive ? "text-primary" : "text-muted-foreground",
                )}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-mono text-sm font-semibold">{getLabel()}</h4>
              {required ? (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-mono border-primary/50 text-primary"
                >
                  REQ
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-mono border-muted-foreground/50 text-muted-foreground"
                >
                  OPT
                </Badge>
              )}
            </div>
            {file ? (
              <div className="flex items-center gap-2">
                <p className="text-xs text-primary font-mono truncate">
                  {file.name}
                </p>
                <span className="text-xs text-muted-foreground font-mono">
                  ({formatFileSize(file.size)})
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-mono">
                {getDescription()}
              </p>
            )}
          </div>
          {file && !disabled && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
