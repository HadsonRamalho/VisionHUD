import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Music,
  Cpu,
  Zap,
  Monitor,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HudDemo } from "@/components/hud-demo";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge
                variant="outline"
                className="font-mono text-primary border-primary/50 px-4 py-1"
              >
                POWERED BY YOLOv8
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                Transforme videos comuns em{" "}
                <span className="text-primary">
                  vídeos com detecção de objetos
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-mono text-pretty">
                Deteccao de objetos em tempo real com bounding boxes e conexões
                dinamicas.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" className="font-mono text-base px-8">
                  <Link href="/dashboard">
                    Comecar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="font-mono text-base px-8 border-primary/50 hover:bg-primary hover:text-white"
                >
                  <Link href="#workflow">Ver Como Funciona</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold font-mono">
                  <span className="text-primary">[</span> PREVIEW DO EFEITO{" "}
                  <span className="text-primary">]</span>
                </h2>
              </div>

              <HudDemo />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {[
                  { label: "DETECÇÃO", value: "YOLOv8", icon: Layers },
                  { label: "PROCESSAMENTO", value: "GPU/CPU", icon: Cpu },
                  { label: "EXPORTAÇÃO", value: "MP4/MOV", icon: Monitor },
                  { label: "VELOCIDADE", value: "30+ FPS", icon: Zap },
                ].map((stat) => (
                  <Card
                    key={stat.label}
                    className="bg-card/50 border-primary/20"
                  >
                    <CardContent className="p-4 text-center">
                      <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-mono">
                        {stat.label}
                      </p>
                      <p className="text-lg font-bold font-mono text-primary">
                        {stat.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="py-16 md:py-24 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <Badge
                  variant="outline"
                  className="font-mono text-primary border-primary/50"
                >
                  WORKFLOW
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Três passos simples
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="relative bg-card border-primary/20 hover:border-primary/50 transition-colors group">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-mono text-4xl font-bold text-primary/30">
                        01
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-mono">
                      Upload do Vídeo
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      Selecione o vídeo original que deseja processar. Suporta
                      MP4, MOV, AVI e outros formatos populares.
                    </p>
                    <Badge className="bg-primary/10 text-primary border-0 font-mono">
                      OBRIGATÓRIO
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="relative bg-card border-primary/20 hover:border-primary/50 transition-colors group">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
                        <Music className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-mono text-4xl font-bold text-primary/30">
                        02
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-mono">
                      Trilha Sonora
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      Adicione uma trilha personalizada ao video final. O
                      sistema mixa automaticamente com FFmpeg.
                    </p>
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-muted-foreground font-mono"
                    >
                      OPCIONAL
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="relative bg-card border-primary/20 hover:border-primary/50 transition-colors group">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
                        <Cpu className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-mono text-4xl font-bold text-primary/30">
                        03
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-mono">
                      Processamento
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      O YOLOv8 detecta objetos e aplica os efeitos visuais.
                      Acompanhe o processamento e status.
                    </p>
                    <Badge className="bg-primary/10 text-primary border-0 font-mono">
                      GPU
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-8">
                <Button asChild size="lg" className="font-mono px-8">
                  <Link href="/dashboard">
                    Acessar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
