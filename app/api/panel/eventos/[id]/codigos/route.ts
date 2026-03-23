import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import {
  getOrganizerByUserId,
  findById,
  getEventCodes,
  createRecord,
  deleteRecord,
} from "@/lib/db";
import { discountCodeSchema } from "@/lib/schemas";

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

    const codigos = await getEventCodes(id);
    return NextResponse.json(codigos);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
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
    if (!org) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const evento = await findById("eventos", id);
    if (!evento || (evento as Record<string, unknown>).organizador_id !== org.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const data = discountCodeSchema.parse({ ...body, evento_id: id });

    const codigo = await createRecord("codigos", {
      ...data,
      usos_actual: 0,
      estado: "activo",
    });

    return NextResponse.json(codigo);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigoId = searchParams.get("codigoId");
    if (!codigoId) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const user = await getCurrentUserOrThrow();
    const org = await getOrganizerByUserId(user.id);
    if (!org) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    await deleteRecord("codigos", codigoId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
