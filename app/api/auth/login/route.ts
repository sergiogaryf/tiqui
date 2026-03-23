import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/schemas";
import { loginUser, createSession } from "@/lib/auth";
import { checkRate, getRateKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const key = getRateKey(request, "login");
  if (!checkRate(key, 10)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const data = loginSchema.parse(body);
    const user = await loginUser(data.email, data.password);
    const fields = user as Record<string, unknown>;

    await createSession(
      user.id,
      request.headers.get("x-forwarded-for") || undefined,
      request.headers.get("user-agent") || undefined
    );

    const redirectTo = fields.rol === "admin" ? "/admin" : "/panel";

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        nombre: fields.nombre,
        email: fields.email,
        rol: fields.rol,
      },
      redirectTo,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al iniciar sesion";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
