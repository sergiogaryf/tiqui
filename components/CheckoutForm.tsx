"use client";

import { useState } from "react";
import { Minus, Plus, Tag, Loader2 } from "lucide-react";
import { formatCLP, cn } from "@/lib/utils";
import { toast } from "sonner";

interface TicketType {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  vendidos: number;
  descripcion?: string;
}

interface CheckoutFormProps {
  eventoId: string;
  eventoSlug: string;
  tiposEntrada: TicketType[];
}

interface Attendee {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export function CheckoutForm({ eventoId, eventoSlug, tiposEntrada }: CheckoutFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [attendees, setAttendees] = useState<Record<string, Attendee[]>>({});
  const [codigoDescuento, setCodigoDescuento] = useState("");
  const [descuento, setDescuento] = useState<{ porcentaje: number; codigo: string } | null>(null);
  const [validando, setValidando] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [step, setStep] = useState<"select" | "attendees">("select");

  const total = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const tipo = tiposEntrada.find((t) => t.id === id);
    return sum + (tipo ? tipo.precio * qty : 0);
  }, 0);

  const totalConDescuento = descuento ? total * (1 - descuento.porcentaje / 100) : total;
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const isFree = totalConDescuento === 0 && totalTickets > 0;

  function updateQty(id: string, delta: number) {
    setQuantities((prev) => {
      const tipo = tiposEntrada.find((t) => t.id === id);
      if (!tipo) return prev;
      const current = prev[id] || 0;
      const available = tipo.stock - tipo.vendidos;
      const next = Math.max(0, Math.min(current + delta, Math.min(available, 10)));
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  }

  async function validarCodigo() {
    if (!codigoDescuento.trim()) return;
    setValidando(true);
    try {
      const res = await fetch("/api/codigos/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoDescuento, eventoId }),
      });
      const data = await res.json();
      if (res.ok && data.valido) {
        setDescuento({ porcentaje: data.descuento_pct, codigo: codigoDescuento });
        toast.success(`Codigo aplicado: ${data.descuento_pct}% de descuento`);
      } else {
        toast.error(data.error || "Codigo no valido");
      }
    } catch {
      toast.error("Error al validar codigo");
    } finally {
      setValidando(false);
    }
  }

  function initAttendees() {
    const atts: Record<string, Attendee[]> = {};
    Object.entries(quantities).forEach(([id, qty]) => {
      atts[id] = Array.from({ length: qty }, () => ({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
      }));
    });
    setAttendees(atts);
    setStep("attendees");
  }

  function updateAttendee(tipoId: string, index: number, field: keyof Attendee, value: string) {
    setAttendees((prev) => {
      const copy = { ...prev };
      copy[tipoId] = [...(copy[tipoId] || [])];
      copy[tipoId][index] = { ...copy[tipoId][index], [field]: value };
      return copy;
    });
  }

  async function handleCheckout() {
    setComprando(true);
    try {
      const items = Object.entries(quantities).map(([tipoId, cantidad]) => ({
        tipoId,
        cantidad,
        asistentes: attendees[tipoId] || [],
      }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventoId,
          items,
          codigo: descuento?.codigo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al procesar compra");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.confirmacionId) {
        window.location.href = `/confirmacion/${data.confirmacionId}`;
      }
    } catch {
      toast.error("Error de conexion");
    } finally {
      setComprando(false);
    }
  }

  return (
    <div className="space-y-4">
      {step === "select" && (
        <>
          {/* Ticket types */}
          <div className="space-y-3">
            {tiposEntrada.map((tipo) => {
              const available = tipo.stock - tipo.vendidos;
              const qty = quantities[tipo.id] || 0;
              const soldOut = available <= 0;

              return (
                <div
                  key={tipo.id}
                  className={cn(
                    "p-4 rounded-xl border transition-colors",
                    qty > 0
                      ? "bg-surface border-mandarina/30"
                      : "bg-surface border-white/6"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-texto">{tipo.nombre}</h4>
                      {tipo.descripcion && (
                        <p className="text-sm text-texto-dim mt-0.5">{tipo.descripcion}</p>
                      )}
                      <p className="text-mandarina font-bold mt-1">
                        {tipo.precio === 0 ? "Gratis" : formatCLP(tipo.precio)}
                      </p>
                    </div>

                    {soldOut ? (
                      <span className="badge badge-error">Agotado</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(tipo.id, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center disabled:opacity-30 hover:bg-surface-3 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold">{qty}</span>
                        <button
                          onClick={() => updateQty(tipo.id, 1)}
                          disabled={qty >= available || qty >= 10}
                          className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center disabled:opacity-30 hover:bg-surface-3 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!soldOut && available <= 10 && (
                    <p className="text-xs text-warning mt-2">
                      Quedan {available} disponibles
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Discount code */}
          {totalTickets > 0 && !isFree && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto-muted" />
                <input
                  type="text"
                  placeholder="Codigo de descuento"
                  value={codigoDescuento}
                  onChange={(e) => setCodigoDescuento(e.target.value.toUpperCase())}
                  className="input pl-10 text-sm"
                />
              </div>
              <button
                onClick={validarCodigo}
                disabled={validando || !codigoDescuento.trim()}
                className="btn-secondary text-sm !px-4 disabled:opacity-50"
              >
                {validando ? "..." : "Aplicar"}
              </button>
            </div>
          )}

          {descuento && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success flex justify-between">
              <span>Codigo {descuento.codigo}: -{descuento.porcentaje}%</span>
              <button onClick={() => setDescuento(null)} className="text-xs underline">
                Quitar
              </button>
            </div>
          )}

          {/* Total + CTA */}
          {totalTickets > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {descuento && (
                    <span className="text-sm text-texto-muted line-through mr-2">
                      {formatCLP(total)}
                    </span>
                  )}
                  {isFree ? "Gratis" : formatCLP(totalConDescuento)}
                </span>
              </div>
              <button
                onClick={initAttendees}
                className="btn-primary w-full text-center"
              >
                {isFree ? "Reservar gratis" : "Continuar al pago"}
              </button>
              <p className="text-xs text-texto-muted text-center">
                {totalTickets} {totalTickets === 1 ? "entrada" : "entradas"} seleccionadas
              </p>
            </div>
          )}
        </>
      )}

      {step === "attendees" && (
        <>
          <button
            onClick={() => setStep("select")}
            className="btn-ghost text-sm mb-2"
          >
            ← Volver
          </button>

          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">
            Datos de asistentes
          </h3>

          {Object.entries(attendees).map(([tipoId, atts]) => {
            const tipo = tiposEntrada.find((t) => t.id === tipoId);
            return atts.map((att, i) => (
              <div key={`${tipoId}-${i}`} className="p-4 rounded-xl bg-surface border border-white/6 space-y-3">
                <p className="text-sm text-texto-dim font-medium">
                  {tipo?.nombre} — Asistente {i + 1}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={att.nombre}
                    onChange={(e) => updateAttendee(tipoId, i, "nombre", e.target.value)}
                    className="input text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={att.apellido}
                    onChange={(e) => updateAttendee(tipoId, i, "apellido", e.target.value)}
                    className="input text-sm"
                    required
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={att.email}
                  onChange={(e) => updateAttendee(tipoId, i, "email", e.target.value)}
                  className="input text-sm"
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefono (opcional)"
                  value={att.telefono}
                  onChange={(e) => updateAttendee(tipoId, i, "telefono", e.target.value)}
                  className="input text-sm"
                />
              </div>
            ));
          })}

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{isFree ? "Gratis" : formatCLP(totalConDescuento)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={comprando}
              className="btn-primary w-full text-center disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {comprando && <Loader2 className="w-4 h-4 animate-spin" />}
              {comprando
                ? "Procesando..."
                : isFree
                ? "Confirmar reserva"
                : "Ir al pago"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
