"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, BarChart3, QrCode, Ticket } from "lucide-react";
import { formatCLP } from "@/lib/utils";

interface Event {
  id: string;
  nombre: string;
  fecha: string;
  estado: string;
  slug: string;
}

export default function PanelPage() {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/eventos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEventos(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          Mi Panel
        </h1>
        <Link href="/panel/nuevo" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Crear evento
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/panel/nuevo" className="card p-4 flex flex-col items-center gap-2 text-center hover:border-mandarina/30">
          <Plus className="w-6 h-6 text-mandarina" />
          <span className="text-sm">Nuevo evento</span>
        </Link>
        <Link href="/scan" className="card p-4 flex flex-col items-center gap-2 text-center hover:border-mandarina/30">
          <QrCode className="w-6 h-6 text-lavanda" />
          <span className="text-sm">Scanner QR</span>
        </Link>
        <Link href="/panel/eventos" className="card p-4 flex flex-col items-center gap-2 text-center hover:border-mandarina/30">
          <Ticket className="w-6 h-6 text-melocoton" />
          <span className="text-sm">Mis eventos</span>
        </Link>
        <Link href="/panel/eventos" className="card p-4 flex flex-col items-center gap-2 text-center hover:border-mandarina/30">
          <BarChart3 className="w-6 h-6 text-success" />
          <span className="text-sm">Estadisticas</span>
        </Link>
      </div>

      {/* Events list */}
      <div>
        <h2 className="font-[family-name:var(--font-heading)] font-semibold text-lg mb-4">
          Mis eventos
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-20 animate-pulse bg-surface" />
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-12 text-texto-dim">
            <p>No tienes eventos aun</p>
            <Link href="/panel/nuevo" className="btn-primary mt-4 inline-block">
              Crear mi primer evento
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {eventos.map((evento) => (
              <Link
                key={evento.id}
                href={`/panel/eventos/${evento.id}/stats`}
                className="card p-4 flex items-center justify-between hover:border-mandarina/30"
              >
                <div>
                  <h3 className="font-semibold">{evento.nombre}</h3>
                  <p className="text-sm text-texto-dim">{evento.fecha}</p>
                </div>
                <span
                  className={`badge ${
                    evento.estado === "publicado"
                      ? "badge-success"
                      : evento.estado === "borrador"
                      ? "badge-warning"
                      : "badge-error"
                  }`}
                >
                  {evento.estado}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
