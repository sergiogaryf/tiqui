import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { findById, updateRecord, getOrganizerByUserId } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUserOrThrow();
    const org = await getOrganizerByUserId(user.id);
    if (!org) {
      return NextResponse.json({ error: "No eres organizador" }, { status: 403 });
    }

    const evento = await findById("eventos", id);
    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const ef = evento as Record<string, unknown>;
    if (ef.organizador_id !== org.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(evento);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUserOrThrow();
    const org = await getOrganizerByUserId(user.id);
    if (!org) {
      return NextResponse.json({ error: "No eres organizador" }, { status: 403 });
    }

    const evento = await findById("eventos", id);
    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const ef = evento as Record<string, unknown>;
    if (ef.organizador_id !== org.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = [
      "nombre", "descripcion", "fecha", "hora_inicio", "hora_fin",
      "lugar", "direccion", "categoria", "capacidad_total",
      "imagen_url", "estado", "edad_minima",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updated = await updateRecord("eventos", id, updates);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
