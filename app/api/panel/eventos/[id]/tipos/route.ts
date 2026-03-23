import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { getOrganizerByUserId, findById, createRecord, getTicketTypes } from "@/lib/db";
import { ticketTypeSchema } from "@/lib/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tipos = await getTicketTypes(id);
    return NextResponse.json(tipos);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(
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
    const data = ticketTypeSchema.parse(body);

    const tipo = await createRecord("tipos_entrada", {
      ...data,
      vendidos: 0,
      evento_id: id,
    });

    return NextResponse.json(tipo);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
