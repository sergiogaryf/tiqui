import { NextResponse } from "next/server";
import { findOne, updateRecord } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const resetToken = await findOne(
      "reset_tokens",
      [["token", token], ["used", false]]
    );

    if (!resetToken) {
      return NextResponse.json({ error: "Token invalido o expirado" }, { status: 400 });
    }

    const fields = resetToken as Record<string, unknown>;

    // Check expiration
    if (new Date(fields.expires_at as string) < new Date()) {
      return NextResponse.json({ error: "Token invalido o expirado" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    await updateRecord("usuarios", fields.usuario_id as string, {
      password_hash: passwordHash,
    });

    await updateRecord("reset_tokens", resetToken.id, { used: true });

    return NextResponse.json({ ok: true, message: "Contrasena actualizada" });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
