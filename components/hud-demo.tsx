"use client"

import { useEffect, useState } from "react"

interface BoundingBox {
  id: number
  x: number
  y: number
  width: number
  height: number
  label: string
  confidence: number
  velocityX: number
  velocityY: number
}

export function HudDemo() {
  const [boxes, setBoxes] = useState<BoundingBox[]>([
    { id: 1, x: 15, y: 20, width: 18, height: 25, label: "PERSON_01", confidence: 0.94, velocityX: 0.3, velocityY: 0.15 },
    { id: 2, x: 55, y: 35, width: 20, height: 22, label: "VEHICLE_02", confidence: 0.87, velocityX: -0.2, velocityY: 0.1 },
    { id: 3, x: 70, y: 60, width: 15, height: 18, label: "OBJECT_03", confidence: 0.91, velocityX: 0.15, velocityY: -0.2 },
  ])

  const [frameCount, setFrameCount] = useState(0)
  const [scanlineY, setScanlineY] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBoxes(prevBoxes => 
        prevBoxes.map(box => {
          let newX = box.x + box.velocityX
          let newY = box.y + box.velocityY
          let newVelocityX = box.velocityX
          let newVelocityY = box.velocityY

          if (newX <= 5 || newX + box.width >= 95) {
            newVelocityX = -box.velocityX
            newX = Math.max(5, Math.min(95 - box.width, newX))
          }
          if (newY <= 5 || newY + box.height >= 95) {
            newVelocityY = -box.velocityY
            newY = Math.max(5, Math.min(95 - box.height, newY))
          }

          return {
            ...box,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
            confidence: Math.max(0.75, Math.min(0.99, box.confidence + (Math.random() - 0.5) * 0.05))
          }
        })
      )
      setFrameCount(prev => prev + 1)
      setScanlineY(prev => (prev + 2) % 100)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const getCenterPoint = (box: BoundingBox) => ({
    x: box.x + box.width / 2,
    y: box.y + box.height / 2
  })

  return (
    <div className="relative w-full aspect-video bg-black/90 rounded-lg overflow-hidden border border-primary/30 neon-border">
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Scanline effect */}
      <div 
        className="absolute left-0 right-0 h-1 bg-primary/20 blur-sm transition-all pointer-events-none"
        style={{ top: `${scanlineY}%` }}
      />

      {/* Connection lines between objects */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {boxes.map((box1, i) => 
          boxes.slice(i + 1).map(box2 => {
            const p1 = getCenterPoint(box1)
            const p2 = getCenterPoint(box2)
            return (
              <g key={`${box1.id}-${box2.id}`}>
                <line
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-primary/50"
                />
                <circle
                  cx={`${(p1.x + p2.x) / 2}%`}
                  cy={`${(p1.y + p2.y) / 2}%`}
                  r="3"
                  className="fill-primary/70"
                />
              </g>
            )
          })
        )}
      </svg>

      {/* Bounding boxes */}
      {boxes.map(box => (
        <div
          key={box.id}
          className="absolute border-2 border-primary transition-all duration-75"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.width}%`,
            height: `${box.height}%`,
            boxShadow: '0 0 10px var(--primary), inset 0 0 10px var(--primary)/10'
          }}
        >
          {/* Corner brackets */}
          <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-primary" />
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-primary" />
          <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-primary" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-primary" />
          
          {/* Label */}
          <div className="absolute -top-6 left-0 font-mono text-xs text-primary bg-black/80 px-1.5 py-0.5 border border-primary/50">
            {box.label}
          </div>
          
          {/* Confidence bar */}
          <div className="absolute -bottom-4 left-0 right-0 h-1.5 bg-black/80 border border-primary/30">
            <div 
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${box.confidence * 100}%` }}
            />
          </div>
          <span className="absolute -bottom-4 -right-1 font-mono text-[10px] text-primary/80 translate-x-full">
            {(box.confidence * 100).toFixed(0)}%
          </span>
        </div>
      ))}

      {/* HUD overlay elements */}
      <div className="absolute top-2 left-2 font-mono text-xs text-primary/80">
        <div>FPS: 30</div>
        <div>FRAME: {String(frameCount).padStart(5, '0')}</div>
      </div>

      <div className="absolute top-2 right-2 font-mono text-xs text-primary/80 text-right">
        <div>MODEL: YOLOv8</div>
        <div>OBJECTS: {boxes.length}</div>
      </div>

      <div className="absolute bottom-2 left-2 font-mono text-xs text-primary/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          TRACKING ACTIVE
        </div>
      </div>

      <div className="absolute bottom-2 right-2 font-mono text-xs text-primary/80">
        RES: 1920x1080
      </div>
    </div>
  )
}
