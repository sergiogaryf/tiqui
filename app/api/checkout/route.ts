import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/schemas";
import {
  findById,
  findOne,
  createRecord,
  updateRecord,
  getTicketTypes,
} from "@/lib/db";
import { createPreference, calculateCommission } from "@/lib/mercadopago";
import { generateTicketId, createQRPayload, generateQRDataUrl } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/email";
import { checkRate, getRateKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const key = getRateKey(request, "checkout");
  if (!checkRate(key, 5)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const evento = await findById("eventos", data.eventoId);
    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const ef = evento as Record<string, unknown>;
    if (ef.estado !== "publicado") {
      return NextResponse.json({ error: "Evento no disponible" }, { status: 400 });
    }

    const tipos = await getTicketTypes(data.eventoId);
    let montoBase = 0;

    for (const item of data.items) {
      const tipo = tipos.find((t) => t.id === item.tipoId) as Record<string, unknown> | undefined;
      if (!tipo) {
        return NextResponse.json({ error: "Tipo de entrada no encontrado" }, { status: 400 });
      }

      const available = (tipo.stock as number) - ((tipo.vendidos as number) || 0);
      if (item.cantidad > available) {
        return NextResponse.json(
          { error: `No hay suficientes entradas de ${tipo.nombre}` },
          { status: 400 }
        );
      }

      if (item.asistentes.length !== item.cantidad) {
        return NextResponse.json(
          { error: "Debe ingresar datos de cada asistente" },
          { status: 400 }
        );
      }

      montoBase += (tipo.precio as number) * item.cantidad;
    }

    let descuentoPct = 0;
    if (data.codigo) {
      const codigo = await findOne(
        "codigos",
        [["codigo", data.codigo], ["evento_id", data.eventoId], ["estado", "activo"]]
      );

      if (codigo) {
        const cf = codigo as Record<string, unknown>;
        const usosActual = (cf.usos_actual as number) || 0;
        const usosMax = cf.usos_max as number;

        if (usosActual < usosMax) {
          descuentoPct = cf.tipo === "cortesia" ? 100 : ((cf.descuento_pct as number) || 0);
          await updateRecord("codigos", codigo.id, { usos_actual: usosActual + 1 });
        }
      }
    }

    const montoFinal = Math.round(montoBase * (1 - descuentoPct / 100));
    const { commission } = calculateCommission(montoFinal);

    const pago = await createRecord("pagos", {
      monto_base: montoBase,
      monto_comision: commission,
      monto_total: montoFinal,
      metodo: montoFinal === 0 ? "cortesia" : "mercadopago",
      estado: montoFinal === 0 ? "aprobado" : "pendiente",
      organizador_id: ef.organizador_id,
      evento_id: data.eventoId,
    });

    for (const item of data.items) {
      const tipo = tipos.find((t) => t.id === item.tipoId) as Record<string, unknown>;

      for (const asistente of item.asistentes) {
        const att = await createRecord("asistentes", {
          nombre: asistente.nombre,
          apellido: asistente.apellido,
          email: asistente.email,
          telefono: asistente.telefono || "",
          evento_id: data.eventoId,
        });

        const ticketId = generateTicketId();
        const qrPayload = createQRPayload(ticketId, data.eventoId);
        const qrDataUrl = montoFinal === 0 ? await generateQRDataUrl(qrPayload) : "";

        await createRecord("tickets", {
          ticket_id: ticketId,
          qr_hash: qrPayload.split(":")[2],
          qr_data_url: qrDataUrl,
          estado: montoFinal === 0 ? "pagado" : "pendiente",
          tipo_entrada_id: item.tipoId,
          asistente_id: att.id,
          pago_id: pago.id,
          evento_id: data.eventoId,
          email_asistente: asistente.email,
        });

        await updateRecord("tipos_entrada", item.tipoId, {
          vendidos: ((tipo.vendidos as number) || 0) + 1,
        });

        if (montoFinal === 0) {
          sendTicketEmail({
            to: asistente.email,
            evento: ef.nombre as string,
            tipo: tipo.nombre as string,
            asistente: `${asistente.nombre} ${asistente.apellido}`,
            ticketId,
            qrDataUrl,
            fecha: ef.fecha as string,
            lugar: ef.lugar as string,
          }).catch(() => {});
        }
      }
    }

    if (montoFinal === 0) {
      return NextResponse.json({ confirmacionId: pago.id });
    }

    const mpItems = data.items.map((item) => {
      const tipo = tipos.find((t) => t.id === item.tipoId) as Record<string, unknown>;
      const unitPrice = Math.round((tipo.precio as number) * (1 - descuentoPct / 100));
      return {
        title: `${ef.nombre} - ${tipo.nombre}`,
        quantity: item.cantidad,
        unit_price: unitPrice,
      };
    });

    const preference = await createPreference({
      items: mpItems,
      externalReference: pago.id,
      payerEmail: data.items[0]?.asistentes[0]?.email,
    });

    await updateRecord("pagos", pago.id, { mp_preference_id: preference.id });

    return NextResponse.json({ checkoutUrl: preference.init_point });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en checkout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
