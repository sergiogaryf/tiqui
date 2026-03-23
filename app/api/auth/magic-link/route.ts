import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createRecord, findAll } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/email";
import { checkRate, getRateKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const key = getRateKey(request, "magic-link");
  if (!checkRate(key, 3)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const tickets = await findAll("tickets", {
      eq: [["email_asistente", email]],
      limit: 1,
    });

    if (tickets.length === 0) {
      return NextResponse.json({ ok: true, message: "Si tienes entradas, recibiras un email" });
    }

    const token = uuid();
    await createRecord("magic_links", {
      token,
      email,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    });

    await sendMagicLinkEmail({ to: email, token });

    return NextResponse.json({ ok: true, message: "Si tienes entradas, recibiras un email" });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
