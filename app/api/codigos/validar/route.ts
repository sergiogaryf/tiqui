import { NextResponse } from "next/server";
import { findOne } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { codigo, eventoId } = await request.json();

    if (!codigo || !eventoId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const record = await findOne(
      "codigos",
      [["codigo", codigo], ["evento_id", eventoId], ["estado", "activo"]]
    );

    if (!record) {
      return NextResponse.json({ valido: false, error: "Codigo no valido" });
    }

    const fields = record as Record<string, unknown>;
    const usosActual = (fields.usos_actual as number) || 0;
    const usosMax = fields.usos_max as number;

    if (usosActual >= usosMax) {
      return NextResponse.json({
        valido: false,
        error: "Codigo agotado",
      });
    }

    const descuento_pct =
      fields.tipo === "cortesia" ? 100 : (fields.descuento_pct as number) || 0;

    return NextResponse.json({
      valido: true,
      tipo: fields.tipo,
      descuento_pct,
      usos_restantes: usosMax - usosActual,
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
