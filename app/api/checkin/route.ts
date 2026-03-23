import { NextResponse } from "next/server";
import { checkinSchema } from "@/lib/schemas";
import { findOne, findById, createRecord, updateRecord } from "@/lib/db";
import { parseQRPayload } from "@/lib/qr";
import { checkRate, getRateKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const key = getRateKey(request, "checkin");
  if (!checkRate(key, 30)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const data = checkinSchema.parse(body);

    // Verify event PIN
    const evento = await findOne(
      "eventos",
      [["id", data.evento_id], ["pin_scanner", data.pin]]
    );

    if (!evento) {
      return NextResponse.json({
        status: "invalido",
        mensaje: "PIN de evento incorrecto",
      });
    }

    // Parse QR
    const parsed = parseQRPayload(data.qr_data);
    if (!parsed || !parsed.valid) {
      await createRecord("checkins", {
        evento_id: data.evento_id,
        resultado: "invalido",
      });

      return NextResponse.json({
        status: "invalido",
        mensaje: "Codigo QR invalido o falsificado",
      });
    }

    // Find ticket
    const ticket = await findOne(
      "tickets",
      [["ticket_id", parsed.ticketId], ["evento_id", data.evento_id]]
    );

    if (!ticket) {
      return NextResponse.json({
        status: "invalido",
        mensaje: "Entrada no encontrada para este evento",
      });
    }

    const tf = ticket as Record<string, unknown>;

    if (tf.estado === "checkin") {
      return NextResponse.json({
        status: "ya_usado",
        mensaje: "Esta entrada ya fue utilizada",
        usadoEn: tf.checkin_at as string,
      });
    }

    if (tf.estado === "cancelado" || tf.estado === "expirado") {
      return NextResponse.json({
        status: "cancelado",
        mensaje: `Entrada ${tf.estado}`,
      });
    }

    if (tf.estado !== "pagado") {
      return NextResponse.json({
        status: "invalido",
        mensaje: "Entrada con estado invalido: " + tf.estado,
      });
    }

    // Mark as checked in
    await updateRecord("tickets", ticket.id, {
      estado: "checkin",
      checkin_at: new Date().toISOString(),
    });

    await createRecord("checkins", {
      ticket_id: ticket.id,
      evento_id: data.evento_id,
      resultado: "valido",
    });

    // Get attendee info
    let asistente = "";
    let tipo = "";
    if (tf.asistente_id) {
      const att = await findById("asistentes", tf.asistente_id as string);
      if (att) {
        const af = att as Record<string, unknown>;
        asistente = `${af.nombre} ${af.apellido}`;
      }
    }
    if (tf.tipo_entrada_id) {
      const tp = await findById("tipos_entrada", tf.tipo_entrada_id as string);
      if (tp) {
        tipo = (tp as Record<string, unknown>).nombre as string;
      }
    }

    return NextResponse.json({
      status: "valido",
      mensaje: "Entrada valida - Bienvenido",
      asistente,
      tipo,
      evento: (evento as Record<string, unknown>).nombre,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en check-in";
    return NextResponse.json(
      { status: "invalido", mensaje: message },
      { status: 400 }
    );
  }
}
