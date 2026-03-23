"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { QRDisplay } from "@/components/QRDisplay";
import { toast } from "sonner";

interface Ticket {
  ticket_id: string;
  qr_data_url: string;
  evento: string;
  tipo: string;
  asistente: string;
  estado: string;
}

export default function MisTicketsPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        toast.success("Revisa tu email");
      } else {
        toast.error(data.error || "Error");
      }
    } catch {
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-20 max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
        Mis entradas
      </h1>

      {!sent && tickets.length === 0 && (
        <div className="p-8 rounded-2xl bg-surface border border-white/6 text-center space-y-4">
          <Mail className="w-12 h-12 text-mandarina mx-auto" />
          <p className="text-texto-dim">
            Ingresa tu email para recibir un enlace de acceso a tus entradas
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input flex-1"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar
            </button>
          </form>
        </div>
      )}

      {sent && tickets.length === 0 && (
        <div className="p-8 rounded-2xl bg-surface border border-white/6 text-center space-y-4">
          <Mail className="w-12 h-12 text-success mx-auto" />
          <h2 className="font-semibold text-lg">Revisa tu email</h2>
          <p className="text-texto-dim">
            Si tienes entradas asociadas a {email}, recibiras un enlace de acceso.
          </p>
        </div>
      )}

      {tickets.length > 0 && (
        <div className="grid gap-4">
          {tickets.map((t) => (
            <QRDisplay
              key={t.ticket_id}
              dataUrl={t.qr_data_url}
              ticketId={t.ticket_id}
              evento={t.evento}
              tipo={t.tipo}
              asistente={t.asistente}
              estado={t.estado}
            />
          ))}
        </div>
      )}
    </div>
  );
}
