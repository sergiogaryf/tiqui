import { NextResponse } from "next/server";
import { getEventsForTomorrow, findAll, updateRecord } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const eventos = await getEventsForTomorrow();
    let sent = 0;

    for (const evento of eventos) {
      const ef = evento as Record<string, unknown>;

      const tickets = await findAll("tickets", {
        eq: [["evento_id", evento.id], ["estado", "pagado"]],
      });

      for (const ticket of tickets) {
        const tf = ticket as Record<string, unknown>;
        if (tf.email_asistente && tf.qr_data_url) {
          await sendReminderEmail({
            to: tf.email_asistente as string,
            evento: ef.nombre as string,
            fecha: ef.fecha as string,
            lugar: ef.lugar as string,
            direccion: ef.direccion as string,
            qrDataUrl: tf.qr_data_url as string,
          });
          sent++;
        }
      }
    }

    return NextResponse.json({ ok: true, sent, eventos: eventos.length });
  } catch (err) {
    console.error("Cron reminders error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
