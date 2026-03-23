import { NextRequest, NextResponse } from "next/server";
import { getPublicEvents, getFeaturedEvents } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const cat = searchParams.get("cat") || undefined;
    const featured = searchParams.get("featured") === "true";
    const q = searchParams.get("q") || undefined;

    if (featured) {
      const events = await getFeaturedEvents();
      return NextResponse.json(events);
    }

    const events = await getPublicEvents(cat);

    if (q) {
      const lower = q.toLowerCase();
      const filtered = events.filter((e) => {
        const f = e as Record<string, unknown>;
        return (
          (f.nombre as string)?.toLowerCase().includes(lower) ||
          (f.lugar as string)?.toLowerCase().includes(lower) ||
          (f.descripcion as string)?.toLowerCase().includes(lower)
        );
      });
      return NextResponse.json(filtered);
    }

    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Error cargando eventos" }, { status: 500 });
  }
}
