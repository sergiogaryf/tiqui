import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getUserByEmail, createRecord } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRate, getRateKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const key = getRateKey(request, "forgot");
  if (!checkRate(key, 3)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (user) {
      const token = uuid();
      await createRecord("reset_tokens", {
        token,
        usuario_id: user.id,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        used: false,
      });
      await sendPasswordResetEmail({ to: email, token });
    }

    return NextResponse.json({
      ok: true,
      message: "Si la cuenta existe, recibiras un email",
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
