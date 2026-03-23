"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { QRDisplay } from "@/components/QRDisplay";
import Link from "next/link";

interface Ticket {
  ticket_id: string;
  qr_data_url: string;
  evento_nombre: string;
  tipo_nombre: string;
  asistente_nombre: string;
  estado: string;
}

export default function ConfirmacionPage() {
  const { id } = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");

  useEffect(() => {
    fetch(`/api/panel/eventos/${id}/tickets/${id}`)
      .catch(() => {});

    // For now, show success message
    // In production, fetch tickets by pago ID
    setStatus("success");
  }, [id]);

  return (
    <div className="pt-20 max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
      {status === "success" && (
        <>
          <CheckCircle className="w-20 h-20 text-success mx-auto" />
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
            Compra confirmada
          </h1>
          <p className="text-texto-dim text-lg">
            Tus entradas han sido enviadas a tu email. Presenta el codigo QR en la entrada del evento.
          </p>
        </>
      )}

      {status === "pending" && (
        <>
          <Clock className="w-20 h-20 text-warning mx-auto" />
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
            Pago pendiente
          </h1>
          <p className="text-texto-dim">
            Tu pago esta siendo procesado. Recibiras las entradas por email cuando se confirme.
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-20 h-20 text-error mx-auto" />
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
            Error en el pago
          </h1>
          <p className="text-texto-dim">
            Hubo un problema con tu pago. Intenta nuevamente.
          </p>
        </>
      )}

      {tickets.length > 0 && (
        <div className="grid gap-4 mt-8">
          {tickets.map((t) => (
            <QRDisplay
              key={t.ticket_id}
              dataUrl={t.qr_data_url}
              ticketId={t.ticket_id}
              evento={t.evento_nombre}
              tipo={t.tipo_nombre}
              asistente={t.asistente_nombre}
              estado={t.estado}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 pt-4">
        <Link href="/" className="btn-secondary">
          Volver al inicio
        </Link>
        <Link href="/mis-tickets" className="btn-primary">
          Mis entradas
        </Link>
      </div>
    </div>
  );
}
