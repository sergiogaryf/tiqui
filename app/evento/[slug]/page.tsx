import { Metadata } from "next";
import Image from "next/image";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { formatDate, formatTime, formatCLP } from "@/lib/utils";
import { getEventBySlug, getTicketTypes } from "@/lib/db";
import { CheckoutForm } from "@/components/CheckoutForm";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEventBySlug(slug);
  if (!evento) return { title: "Evento no encontrado" };
  const ef = evento as Record<string, unknown>;
  return {
    title: ef.nombre as string,
    description: (ef.descripcion as string)?.substring(0, 160),
  };
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const evento = await getEventBySlug(slug);
  if (!evento) notFound();

  const ef = evento as Record<string, unknown>;
  const e = {
    nombre: String(ef.nombre || ""),
    descripcion: String(ef.descripcion || ""),
    fecha: String(ef.fecha || ""),
    hora_inicio: ef.hora_inicio ? String(ef.hora_inicio) : "",
    hora_fin: ef.hora_fin ? String(ef.hora_fin) : "",
    lugar: String(ef.lugar || ""),
    direccion: ef.direccion ? String(ef.direccion) : "",
    imagen_url: ef.imagen_url ? String(ef.imagen_url) : "",
    categoria: ef.categoria ? String(ef.categoria) : "",
    capacidad_total: Number(ef.capacidad_total) || 0,
    edad_minima: Number(ef.edad_minima) || 0,
  };
  const tiposRaw = await getTicketTypes(evento.id);
  const tipos = tiposRaw.map((t) => {
    const tf = t as Record<string, unknown>;
    return {
      id: t.id,
      nombre: (tf.nombre as string) || "",
      precio: (tf.precio as number) || 0,
      stock: (tf.stock as number) || 0,
      vendidos: (tf.vendidos as number) || 0,
      descripcion: tf.descripcion as string | undefined,
    };
  });

  return (
    <div className="pt-16">
      {/* Banner */}
      <div className="relative h-64 md:h-96 bg-surface-2">
        {e.imagen_url ? (
          <Image
            src={e.imagen_url}
            alt={e.nombre}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full gradient-warm opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            {e.categoria && (
              <span className="badge badge-mandarina">{e.categoria}</span>
            )}

            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold">
              {e.nombre}
            </h1>

            <div className="flex flex-wrap gap-4 text-texto-dim">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-mandarina" />
                {formatDate(e.fecha)}
              </span>
              {e.hora_inicio && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-mandarina" />
                  {formatTime(e.hora_inicio)}
                  {e.hora_fin && ` - ${formatTime(e.hora_fin)}`}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-mandarina" />
                {e.lugar}
              </span>
              {e.capacidad_total > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-mandarina" />
                  {e.capacidad_total} personas
                </span>
              )}
            </div>

            {e.direccion && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.direccion)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-lavanda hover:text-lavanda-light"
              >
                Ver en Google Maps
              </a>
            )}

            <div className="p-6 rounded-2xl bg-surface border border-white/6">
              <h2 className="font-[family-name:var(--font-heading)] font-semibold text-lg mb-3">
                Acerca del evento
              </h2>
              <div className="text-texto-dim whitespace-pre-wrap leading-relaxed">
                {e.descripcion}
              </div>
            </div>

            {e.edad_minima > 0 && (
              <p className="text-sm text-warning">
                Edad minima: {e.edad_minima} anos
              </p>
            )}
          </div>

          {/* Checkout sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 p-6 rounded-2xl bg-surface border border-white/6 space-y-4">
              <h2 className="font-[family-name:var(--font-heading)] font-semibold text-lg">
                Entradas
              </h2>
              <CheckoutForm
                eventoId={evento.id}
                eventoSlug={slug}
                tiposEntrada={tipos}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
