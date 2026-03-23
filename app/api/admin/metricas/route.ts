import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { findAll } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUserOrThrow();
    if ((user as Record<string, unknown>).rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const [eventos, organizadores, pagos, tickets] = await Promise.all([
      findAll("eventos"),
      findAll("organizadores"),
      findAll("pagos", { eq: [["estado", "aprobado"]] }),
      findAll("tickets", { eq: [["estado", "pagado"]] }),
    ]);

    const ingresosBrutos = pagos.reduce(
      (sum, p) => sum + ((p as Record<string, unknown>).monto_total as number || 0),
      0
    );
    const comisionTotal = pagos.reduce(
      (sum, p) => sum + ((p as Record<string, unknown>).monto_comision as number || 0),
      0
    );

    return NextResponse.json({
      totalEventos: eventos.length,
      eventosPublicados: eventos.filter(
        (e) => (e as Record<string, unknown>).estado === "publicado"
      ).length,
      totalOrganizadores: organizadores.length,
      organizadoresActivos: organizadores.filter(
        (o) => (o as Record<string, unknown>).estado === "activo"
      ).length,
      totalPagos: pagos.length,
      ingresosBrutos,
      comisionTotal,
      ingresosNetos: ingresosBrutos - comisionTotal,
      ticketsEmitidos: tickets.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
