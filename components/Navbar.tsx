"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, User, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-mandarina flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight">
            <span className="text-texto">TI</span>
            <span className="text-mandarina">QUI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/eventos" className="text-sm text-texto-dim hover:text-texto transition-colors">
            Eventos
          </Link>
          <Link href="/eventos?cat=fiestas" className="text-sm text-texto-dim hover:text-texto transition-colors">
            Fiestas
          </Link>
          <Link href="/eventos?cat=musica" className="text-sm text-texto-dim hover:text-texto transition-colors">
            Musica
          </Link>
          <Link href="/eventos?cat=talleres" className="text-sm text-texto-dim hover:text-texto transition-colors">
            Talleres
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="btn-ghost p-2 rounded-lg"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Auth */}
          <Link href="/login" className="hidden md:flex btn-ghost text-sm">
            Iniciar sesion
          </Link>
          <Link href="/registro" className="hidden md:flex btn-primary text-sm !py-2 !px-4">
            Organizar evento
          </Link>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden btn-ghost p-2"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-white/5 px-4 py-3 animate-fade-in">
          <form action="/buscar" className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto-muted" />
            <input
              type="search"
              name="q"
              placeholder="Buscar eventos, artistas, lugares..."
              className="input pl-10"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 px-4 py-4 space-y-3 animate-slide-up">
          <Link href="/eventos" className="block text-texto-dim hover:text-texto py-2" onClick={() => setMenuOpen(false)}>
            Eventos
          </Link>
          <Link href="/eventos?cat=fiestas" className="block text-texto-dim hover:text-texto py-2" onClick={() => setMenuOpen(false)}>
            Fiestas
          </Link>
          <Link href="/eventos?cat=musica" className="block text-texto-dim hover:text-texto py-2" onClick={() => setMenuOpen(false)}>
            Musica
          </Link>
          <Link href="/eventos?cat=talleres" className="block text-texto-dim hover:text-texto py-2" onClick={() => setMenuOpen(false)}>
            Talleres
          </Link>
          <hr className="border-white/5" />
          <Link href="/login" className="block text-texto-dim hover:text-texto py-2" onClick={() => setMenuOpen(false)}>
            Iniciar sesion
          </Link>
          <Link href="/registro" className="block btn-primary text-center" onClick={() => setMenuOpen(false)}>
            Organizar evento
          </Link>
        </div>
      )}
    </nav>
  );
}
