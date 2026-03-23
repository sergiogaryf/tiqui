import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { findAll } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUserOrThrow();
    if ((user as Record<string, unknown>).rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const organizadores = await findAll("organizadores", {
      order: { column: "created_at", ascending: false },
    });

    return NextResponse.json(organizadores);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
