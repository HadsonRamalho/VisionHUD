"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface TerminalLog {
  id: string
  timestamp: Date
  message: string
  type: "info" | "success" | "error" | "warning" | "system"
}

interface TerminalProps {
  logs: TerminalLog[]
  isProcessing?: boolean
}

export function Terminal({ logs, isProcessing = false }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getTypeColor = (type: TerminalLog["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      case "system":
        return "text-primary"
      default:
        return "text-gray-300"
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="relative rounded-lg border border-primary/30 bg-black overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20 bg-black/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 font-mono text-xs text-primary/60">visionhud@terminal</span>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs text-primary">PROCESSANDO...</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal content */}
      <ScrollArea className="h-64 md:h-80" ref={scrollRef}>
        <div className="p-4 font-mono text-sm space-y-1">
          {logs.length === 0 ? (
            <div className="text-primary/50">
              <span className="text-primary">$</span> Aguardando comandos...
              <span className="cursor-blink">_</span>
            </div>
          ) : (
            <>
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-primary/40 shrink-0">
                    [{formatTimestamp(log.timestamp)}]
                  </span>
                  <span className={getTypeColor(log.type)}>{log.message}</span>
                </div>
              ))}
              {isProcessing && (
                <div className="text-primary">
                  <span>$</span> <span className="cursor-blink">_</span>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
          }}
        />
      </div>
    </div>
  )
}
