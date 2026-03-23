import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { getOrganizerByUserId, findById, getEventAttendees } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUserOrThrow();
    const org = await getOrganizerByUserId(user.id);
    if (!org) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const evento = await findById("eventos", id);
    if (!evento || (evento as Record<string, unknown>).organizador_id !== org.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const asistentes = await getEventAttendees(id);
    return NextResponse.json(asistentes);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
