import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { updateRecord, findById } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUserOrThrow();
    if ((user as Record<string, unknown>).rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { estado } = body;

    if (!["activo", "suspendido", "pendiente"].includes(estado)) {
      return NextResponse.json({ error: "Estado invalido" }, { status: 400 });
    }

    const org = await findById("organizadores", id);
    if (!org) {
      return NextResponse.json({ error: "Organizador no encontrado" }, { status: 404 });
    }

    const updated = await updateRecord("organizadores", id, { estado });

    const orgFields = org as Record<string, unknown>;
    if (orgFields.usuario_id) {
      await updateRecord("usuarios", orgFields.usuario_id as string, { estado });
    }

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
