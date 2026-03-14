import Link from "next/link";
import { Cpu, Github, Twitter } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              <span className="font-mono text-lg font-bold">
                <span className="text-primary">Vision</span>
                <span className="text-foreground">HUD</span>
              </span>
            </Link>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
                >
                  Ferramenta
                </Link>
              </li>
              <li>
                <Link
                  href="/#workflow"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
                >
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">
              Tecnologias
            </h4>
            <ul className="space-y-2 font-mono text-sm text-muted-foreground">
              <li>YOLOv8</li>
              <li>FFmpeg</li>
              <li>OpenCV</li>
              <li>Python</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">
              Preferencias
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">
                Tema:
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
