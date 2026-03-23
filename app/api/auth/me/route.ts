import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizerByUserId } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const fields = user as Record<string, unknown>;
  let organizador = null;

  if (fields.rol === "organizador") {
    organizador = await getOrganizerByUserId(user.id);
  }

  return NextResponse.json({
    id: user.id,
    nombre: fields.nombre,
    apellido: fields.apellido,
    email: fields.email,
    telefono: fields.telefono,
    rol: fields.rol,
    estado: fields.estado,
    organizador: organizador
      ? {
          id: organizador.id,
          estado: (organizador as Record<string, unknown>).estado,
        }
      : null,
  });
}
