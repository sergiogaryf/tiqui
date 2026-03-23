"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { formatCLP, formatDate } from "@/lib/utils";

interface HeroEventProps {
  slug: string;
  nombre: string;
  fecha: string;
  lugar: string;
  descripcion?: string;
  imagen_url?: string;
  precio_desde?: number;
}

export function HeroEvent({
  slug,
  nombre,
  fecha,
  lugar,
  descripcion,
  imagen_url,
  precio_desde,
}: HeroEventProps) {
  return (
    <section className="relative min-h-[70vh] flex items-end overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {imagen_url ? (
          <Image
            src={imagen_url}
            alt={nombre}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full gradient-warm opacity-20" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-base/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16 pt-32 w-full">
        <div className="max-w-2xl space-y-4 animate-slide-up">
          <span className="badge badge-mandarina">Evento destacado</span>

          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold leading-tight">
            {nombre}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-texto-dim">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-mandarina" />
              {formatDate(fecha)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-mandarina" />
              {lugar}
            </span>
          </div>

          {descripcion && (
            <p className="text-texto-dim text-lg line-clamp-2">{descripcion}</p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <Link href={`/evento/${slug}`} className="btn-primary inline-flex items-center gap-2">
              {precio_desde === 0 ? "Reservar gratis" : `Desde ${formatCLP(precio_desde || 0)}`}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
