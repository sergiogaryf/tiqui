import Link from "next/link";
import { Ticket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-mandarina flex items-center justify-center">
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <span className="font-[family-name:var(--font-heading)] text-lg font-bold">
                <span className="text-texto">TI</span>
                <span className="text-mandarina">QUI</span>
              </span>
            </div>
            <p className="text-sm text-texto-dim">
              Tu entrada al momento. Descubre eventos cerca de ti.
            </p>
          </div>

          {/* Explorar */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-texto">Explorar</h4>
            <div className="space-y-2">
              <Link href="/eventos" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Todos los eventos
              </Link>
              <Link href="/eventos?cat=musica" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Musica
              </Link>
              <Link href="/eventos?cat=fiestas" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Fiestas
              </Link>
              <Link href="/eventos?cat=talleres" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Talleres
              </Link>
            </div>
          </div>

          {/* Organizadores */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-texto">Organizadores</h4>
            <div className="space-y-2">
              <Link href="/registro" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Crear cuenta
              </Link>
              <Link href="/login" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Iniciar sesion
              </Link>
              <Link href="/panel" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Mi panel
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-texto">Legal</h4>
            <div className="space-y-2">
              <Link href="/terminos" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Terminos de uso
              </Link>
              <Link href="/privacidad" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Privacidad
              </Link>
              <Link href="/politica-compra" className="block text-sm text-texto-dim hover:text-texto transition-colors">
                Politica de compra
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-texto-muted">
            &copy; {new Date().getFullYear()} Tiqui. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
