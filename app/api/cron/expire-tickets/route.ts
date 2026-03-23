import { NextResponse } from "next/server";
import { getPendingTicketsOlderThan, updateRecord, findById } from "@/lib/db";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const tickets = await getPendingTicketsOlderThan(30);
    let expired = 0;

    for (const ticket of tickets) {
      const tf = ticket as Record<string, unknown>;
      await updateRecord("tickets", ticket.id, { estado: "expirado" });

      if (tf.tipo_entrada_id) {
        const tipo = await findById("tipos_entrada", tf.tipo_entrada_id as string);
        if (tipo) {
          const vendidos = (tipo as Record<string, unknown>).vendidos as number || 1;
          await updateRecord("tipos_entrada", tipo.id, {
            vendidos: Math.max(0, vendidos - 1),
          });
        }
      }
      expired++;
    }

    return NextResponse.json({ ok: true, expired });
  } catch (err) {
    console.error("Cron expire error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
