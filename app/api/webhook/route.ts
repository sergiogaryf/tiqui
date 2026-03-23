import { NextResponse } from "next/server";
import { findById, updateRecord, getOrderTickets } from "@/lib/db";
import { getPayment } from "@/lib/mercadopago";
import { createQRPayload, generateQRDataUrl } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    const mpPayment = await getPayment(paymentId.toString());
    const externalRef = mpPayment.external_reference;

    if (!externalRef) {
      return NextResponse.json({ error: "Missing external reference" }, { status: 400 });
    }

    const pago = await findById("pagos", externalRef);
    if (!pago) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    if (mpPayment.status === "approved") {
      await updateRecord("pagos", pago.id, {
        estado: "aprobado",
        mp_payment_id: paymentId.toString(),
      });

      const tickets = await getOrderTickets(pago.id);

      for (const ticket of tickets) {
        const tf = ticket as Record<string, unknown>;
        if (tf.estado === "pendiente") {
          const qrPayload = createQRPayload(
            tf.ticket_id as string,
            tf.evento_id as string
          );
          const qrDataUrl = await generateQRDataUrl(qrPayload);

          await updateRecord("tickets", ticket.id, {
            estado: "pagado",
            qr_hash: qrPayload.split(":")[2],
            qr_data_url: qrDataUrl,
          });

          if (tf.email_asistente) {
            const evento = await findById("eventos", tf.evento_id as string);
            const tipo = await findById("tipos_entrada", tf.tipo_entrada_id as string);
            const asistente = await findById("asistentes", tf.asistente_id as string);

            if (evento && tipo && asistente) {
              const ef = evento as Record<string, unknown>;
              const tpf = tipo as Record<string, unknown>;
              const af = asistente as Record<string, unknown>;

              sendTicketEmail({
                to: tf.email_asistente as string,
                evento: ef.nombre as string,
                tipo: tpf.nombre as string,
                asistente: `${af.nombre} ${af.apellido}`,
                ticketId: tf.ticket_id as string,
                qrDataUrl,
                fecha: ef.fecha as string,
                lugar: ef.lugar as string,
              }).catch(() => {});
            }
          }
        }
      }
    } else if (
      mpPayment.status === "rejected" ||
      mpPayment.status === "cancelled"
    ) {
      await updateRecord("pagos", pago.id, {
        estado: "rechazado",
        mp_payment_id: paymentId.toString(),
      });

      const tickets = await getOrderTickets(pago.id);
      for (const ticket of tickets) {
        const tf = ticket as Record<string, unknown>;
        if (tf.estado === "pendiente") {
          await updateRecord("tickets", ticket.id, { estado: "cancelado" });

          const tipo = await findById("tipos_entrada", tf.tipo_entrada_id as string);
          if (tipo) {
            const tpf = tipo as Record<string, unknown>;
            await updateRecord("tipos_entrada", tipo.id, {
              vendidos: Math.max(0, ((tpf.vendidos as number) || 1) - 1),
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
