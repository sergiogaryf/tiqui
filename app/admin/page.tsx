"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Calendar, DollarSign, Ticket } from "lucide-react";
import { formatCLP } from "@/lib/utils";

interface Metrics {
  totalEventos: number;
  eventosPublicados: number;
  totalOrganizadores: number;
  organizadoresActivos: number;
  totalPagos: number;
  ingresosBrutos: number;
  comisionTotal: number;
  ingresosNetos: number;
  ticketsEmitidos: number;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/admin/metricas")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(() => {});
  }, []);

  const cards = metrics
    ? [
        { label: "Eventos", value: metrics.totalEventos, sub: `${metrics.eventosPublicados} publicados`, icon: Calendar, color: "text-mandarina" },
        { label: "Organizadores", value: metrics.totalOrganizadores, sub: `${metrics.organizadoresActivos} activos`, icon: Users, color: "text-lavanda" },
        { label: "Ingresos brutos", value: formatCLP(metrics.ingresosBrutos), sub: `Comision: ${formatCLP(metrics.comisionTotal)}`, icon: DollarSign, color: "text-success" },
        { label: "Tickets emitidos", value: metrics.ticketsEmitidos, sub: `${metrics.totalPagos} pagos`, icon: Ticket, color: "text-melocoton" },
      ]
    : [];

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
        Admin
      </h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics
          ? cards.map((card) => (
              <div key={card.label} className="card p-4 space-y-2">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-texto-dim">{card.label}</p>
                <p className="text-xs text-texto-muted">{card.sub}</p>
              </div>
            ))
          : [1, 2, 3, 4].map((i) => (
              <div key={i} className="card h-28 animate-pulse bg-surface" />
            ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/organizadores" className="card p-6 hover:border-mandarina/30">
          <h2 className="font-semibold text-lg mb-1">Gestionar organizadores</h2>
          <p className="text-sm text-texto-dim">Aprobar, suspender y ver organizadores</p>
        </Link>
        <Link href="/admin/metricas" className="card p-6 hover:border-mandarina/30">
          <h2 className="font-semibold text-lg mb-1">Metricas detalladas</h2>
          <p className="text-sm text-texto-dim">Ingresos, ventas y analytics</p>
        </Link>
      </div>
    </div>
  );
}
