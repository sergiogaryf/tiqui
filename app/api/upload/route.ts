import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    await getCurrentUserOrThrow();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Archivo muy grande (max 5MB)" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.type);

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
