"use client";

import { cn } from "@/lib/utils";

interface QRDisplayProps {
  dataUrl: string;
  ticketId: string;
  evento: string;
  tipo: string;
  asistente: string;
  estado?: string;
  className?: string;
}

export function QRDisplay({
  dataUrl,
  ticketId,
  evento,
  tipo,
  asistente,
  estado = "pagado",
  className,
}: QRDisplayProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-surface border border-white/6 text-center space-y-4",
        className
      )}
    >
      {/* QR */}
      <div className="mx-auto w-48 h-48 rounded-xl bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt={`QR ${ticketId}`} className="w-full h-full" />
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="font-[family-name:var(--font-heading)] font-semibold text-texto">
          {evento}
        </p>
        <p className="text-sm text-texto-dim">{tipo}</p>
        <p className="text-sm text-texto-dim">{asistente}</p>
      </div>

      {/* Status badge */}
      <div className="flex justify-center">
        <span
          className={cn(
            "badge",
            estado === "pagado" && "badge-success",
            estado === "checkin" && "badge-lavanda",
            estado === "pendiente" && "badge-warning",
            estado === "cancelado" && "badge-error",
            estado === "expirado" && "badge-error"
          )}
        >
          {estado === "pagado" && "Confirmada"}
          {estado === "checkin" && "Ingresado"}
          {estado === "pendiente" && "Pendiente"}
          {estado === "cancelado" && "Cancelada"}
          {estado === "expirado" && "Expirada"}
        </span>
      </div>

      {/* Ticket ID */}
      <p className="text-xs text-texto-muted font-mono">{ticketId}</p>
    </div>
  );
}
