"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users } from "lucide-react";
import { formatCLP, formatDate, cn } from "@/lib/utils";

interface EventCardProps {
  slug: string;
  nombre: string;
  fecha: string;
  lugar: string;
  imagen_url?: string;
  categoria?: string;
  precio_desde?: number;
  capacidad_total?: number;
  vendidos?: number;
  destacado?: boolean;
  size?: "default" | "large";
}

export function EventCard({
  slug,
  nombre,
  fecha,
  lugar,
  imagen_url,
  categoria,
  precio_desde,
  capacidad_total,
  vendidos,
  destacado,
  size = "default",
}: EventCardProps) {
  const soldOut = capacidad_total && vendidos ? vendidos >= capacidad_total : false;
  const almostSoldOut =
    capacidad_total && vendidos ? vendidos >= capacidad_total * 0.8 : false;

  return (
    <Link
      href={`/evento/${slug}`}
      className={cn(
        "card group overflow-hidden flex flex-col",
        size === "large" && "md:col-span-2 md:row-span-2"
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-surface-2",
          size === "large" ? "h-64 md:h-80" : "h-44"
        )}
      >
        {imagen_url ? (
          <Image
            src={imagen_url}
            alt={nombre}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={size === "large" ? "600px" : "300px"}
          />
        ) : (
          <div className="w-full h-full gradient-warm opacity-30" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {categoria && (
            <span className="badge glass text-xs">{categoria}</span>
          )}
          {destacado && (
            <span className="badge badge-mandarina text-xs">Destacado</span>
          )}
          {soldOut && (
            <span className="badge badge-error text-xs">Agotado</span>
          )}
          {!soldOut && almostSoldOut && (
            <span className="badge badge-warning text-xs">Ultimas</span>
          )}
        </div>

        {/* Price */}
        {precio_desde !== undefined && (
          <div className="absolute bottom-3 right-3">
            <span className="badge glass font-bold text-sm">
              {precio_desde === 0 ? "Gratis" : `Desde ${formatCLP(precio_desde)}`}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3
          className={cn(
            "font-[family-name:var(--font-heading)] font-semibold text-texto line-clamp-2",
            size === "large" ? "text-xl" : "text-base"
          )}
        >
          {nombre}
        </h3>

        <div className="flex items-center gap-3 text-texto-dim text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(fecha)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[140px]">{lugar}</span>
          </span>
        </div>

        {capacidad_total && vendidos !== undefined && (
          <div className="mt-auto pt-2">
            <div className="flex justify-between text-xs text-texto-muted mb-1">
              <span>{vendidos} vendidas</span>
              <span>{capacidad_total - vendidos} disponibles</span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  soldOut
                    ? "bg-error"
                    : almostSoldOut
                    ? "bg-warning"
                    : "bg-mandarina"
                )}
                style={{
                  width: `${Math.min((vendidos / capacidad_total) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
