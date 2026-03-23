"use client";

import { Minus, Plus } from "lucide-react";
import { formatCLP, cn } from "@/lib/utils";

interface TicketSelectorProps {
  nombre: string;
  precio: number;
  disponibles: number;
  cantidad: number;
  descripcion?: string;
  onChange: (qty: number) => void;
}

export function TicketSelector({
  nombre,
  precio,
  disponibles,
  cantidad,
  descripcion,
  onChange,
}: TicketSelectorProps) {
  const soldOut = disponibles <= 0;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-colors",
        cantidad > 0
          ? "bg-surface border-mandarina/30"
          : "bg-surface border-white/6"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-texto">{nombre}</h4>
          {descripcion && (
            <p className="text-sm text-texto-dim mt-0.5">{descripcion}</p>
          )}
          <p className="text-mandarina font-bold mt-1">
            {precio === 0 ? "Gratis" : formatCLP(precio)}
          </p>
        </div>

        {soldOut ? (
          <span className="badge badge-error">Agotado</span>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChange(Math.max(0, cantidad - 1))}
              disabled={cantidad === 0}
              className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center disabled:opacity-30 hover:bg-surface-3 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-bold">{cantidad}</span>
            <button
              onClick={() => onChange(Math.min(cantidad + 1, Math.min(disponibles, 10)))}
              disabled={cantidad >= disponibles || cantidad >= 10}
              className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center disabled:opacity-30 hover:bg-surface-3 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!soldOut && disponibles <= 10 && (
        <p className="text-xs text-warning mt-2">
          Quedan {disponibles} disponibles
        </p>
      )}
    </div>
  );
}
