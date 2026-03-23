"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { EventCard } from "@/components/EventCard";

type EventResult = {
  id: string; slug: string; nombre: string; fecha: string; lugar: string;
  imagen_url?: string; categoria?: string; precio_desde?: number;
  capacidad_total?: number; vendidos?: number; destacado?: boolean;
};

function BuscarContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    fetch(`/api/eventos?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setResults(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      <form action="/buscar" className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-texto-muted" />
        <input type="search" name="q" defaultValue={q} placeholder="Buscar eventos, artistas, lugares..." className="input pl-11 text-lg" autoFocus />
      </form>
      {q && (
        <p className="text-texto-dim">
          {loading ? "Buscando..." : `${results.length} resultados para "${q}"`}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((event) => (<EventCard key={event.id} {...event} />))}
      </div>
    </>
  );
}

export default function BuscarPage() {
  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Buscar eventos</h1>
      <Suspense fallback={<div className="animate-pulse h-12 bg-surface rounded-xl" />}>
        <BuscarContent />
      </Suspense>
    </div>
  );
}
