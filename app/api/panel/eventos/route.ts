import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import {
  getOrganizerEvents,
  getOrganizerByUserId,
  createRecord,
} from "@/lib/db";
import { createEventSchema } from "@/lib/schemas";
import { slugify, generatePin } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUserOrThrow();
    const org = await getOrganizerByUserId(user.id);
    if (!org) {
      return NextResponse.json({ error: "No eres organizador" }, { status: 403 });
    }

    const eventos = await getOrganizerEvents(org.id);
    return NextResponse.json(eventos);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    const status = message.includes("autenticado") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserOrThrow();
    const org = await getOrganizerByUserId(user.id);
    if (!org) {
      return NextResponse.json({ error: "No eres organizador" }, { status: 403 });
    }

    const orgFields = org as Record<string, unknown>;
    if (orgFields.estado !== "activo") {
      return NextResponse.json(
        { error: "Tu cuenta de organizador esta pendiente de aprobacion" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = createEventSchema.parse(body);

    const evento = await createRecord("eventos", {
      ...data,
      slug: slugify(data.nombre),
      estado: "borrador",
      destacado: false,
      pin_scanner: generatePin(),
      organizador_id: org.id,
    });

    return NextResponse.json({ ok: true, id: evento.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear evento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
