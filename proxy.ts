import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/eventos",
  "/evento",
  "/buscar",
  "/login",
  "/registro",
  "/recuperar",
  "/reset-password",
  "/confirmacion",
  "/mis-tickets",
  "/scan",
  "/terminos",
  "/privacidad",
  "/politica-compra",
  "/api/eventos",
  "/api/checkout",
  "/api/webhook",
  "/api/checkin",
  "/api/codigos",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot",
  "/api/auth/reset",
  "/api/auth/magic-link",
  "/api/stats",
  "/api/qr",
  "/api/og",
];

const CRON_PATHS = ["/api/cron"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return NextResponse.next();

  // Cron paths require CRON_SECRET
  const isCron = CRON_PATHS.some((p) => pathname.startsWith(p));
  if (isCron) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protected paths require session cookie
  const session = request.cookies.get("tiqui_session");
  if (!session?.value) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin paths require admin role check (done at API level for now)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
