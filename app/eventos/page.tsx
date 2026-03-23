"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { CategoryPills } from "@/components/CategoryPills";

interface Event {
  id: string;
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
}

function EventosContent() {
  const searchParams = useSearchParams();
  const cat = searchParams.get("cat") || undefined;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = cat ? `/api/eventos?cat=${cat}` : "/api/eventos";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cat]);

  return (
    <>
      <CategoryPills />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-surface" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-texto-dim">
          <p className="text-lg">No hay eventos disponibles</p>
          <p className="text-sm mt-2">Vuelve pronto para ver nuevos eventos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id || event.slug} {...event} />
          ))}
        </div>
      )}
    </>
  );
}

export default function EventosPage() {
  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
        Eventos
      </h1>
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="card h-64 animate-pulse bg-surface" />))}</div>}>
        <EventosContent />
      </Suspense>
    </div>
  );
}
