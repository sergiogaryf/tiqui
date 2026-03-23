import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { getOrganizerByUserId, findById, updateRecord, deleteRecord } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; tid: string }> }
) {
  try {
    const { id, tid } = await params;
    const user = await getCurrentUserOrThrow();
    const org = await getOrganizerByUserId(user.id);
    if (!org) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const evento = await findById("eventos", id);
    if (!evento || (evento as Record<string, unknown>).organizador_id !== org.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await updateRecord("tipos_entrada", tid, body);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; tid: string }> }
) {
  try {
    const { id, tid } = await params;
    const user = await getCurrentUserOrThrow();
    const org = await getOrganizerByUserId(user.id);
    if (!org) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const evento = await findById("eventos", id);
    if (!evento || (evento as Record<string, unknown>).organizador_id !== org.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await deleteRecord("tipos_entrada", tid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
