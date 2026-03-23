import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/schemas";
import { registerUser } from "@/lib/auth";
import { checkRate, getRateKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const key = getRateKey(request, "register");
  if (!checkRate(key, 5)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const user = await registerUser({
      ...data,
      rol: "organizador",
    });

    return NextResponse.json({
      ok: true,
      message: "Cuenta creada. Pendiente de aprobacion por admin.",
      userId: user.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al registrar";
    const status = message.includes("registrado") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
