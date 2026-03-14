"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Cpu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Cpu className="h-8 w-8 text-primary transition-all group-hover:scale-110" />
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-mono text-xl font-bold tracking-tight">
            <span className="text-primary">Vision</span>
            <span className="text-foreground">HUD</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#workflow"
            className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Como Funciona
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 font-mono text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Iniciar
          </Link>
        </div>
      </div>
    </header>
  );
}
