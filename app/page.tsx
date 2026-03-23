import { Suspense } from "react";
import { HeroEvent } from "@/components/HeroEvent";
import { EventCard } from "@/components/EventCard";
import { CategoryPills } from "@/components/CategoryPills";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const DEMO_FEATURED = {
  slug: "neon-night-festival",
  nombre: "Neon Night Festival",
  fecha: "2026-04-15",
  lugar: "Parque Bicentenario, Vina del Mar",
  descripcion: "La fiesta mas esperada del otono. Musica electronica, luces y buena energia.",
  imagen_url: "",
  precio_desde: 12000,
};

const DEMO_EVENTS = [
  { slug: "mulata-social-dance", nombre: "Mulata Social Dance", fecha: "2026-04-05", lugar: "Valparaiso", categoria: "Fiestas", precio_desde: 8000, capacidad_total: 200, vendidos: 150 },
  { slug: "sunset-jazz-session", nombre: "Sunset Jazz Session", fecha: "2026-04-08", lugar: "Reñaca", categoria: "Musica", precio_desde: 5000, capacidad_total: 100, vendidos: 45 },
  { slug: "yoga-al-amanecer", nombre: "Yoga al Amanecer", fecha: "2026-04-10", lugar: "Playa Ancha", categoria: "Bienestar", precio_desde: 0, capacidad_total: 30, vendidos: 22 },
  { slug: "tech-meetup-vlp", nombre: "Tech Meetup VLP", fecha: "2026-04-12", lugar: "Wework Valparaiso", categoria: "Tech", precio_desde: 0, capacidad_total: 80, vendidos: 35 },
  { slug: "comedy-night", nombre: "Comedy Night", fecha: "2026-04-14", lugar: "Bar El Huevo", categoria: "Cultura", precio_desde: 6000, capacidad_total: 60, vendidos: 58 },
  { slug: "street-food-fest", nombre: "Street Food Fest", fecha: "2026-04-18", lugar: "Cerro Alegre", categoria: "Gastro", precio_desde: 3000, capacidad_total: 500, vendidos: 120 },
];

export default async function HomePage() {
  let featured = DEMO_FEATURED;
  let events = DEMO_EVENTS;

  try {
    const [featRes, evtRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/eventos?featured=true`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/eventos`, { cache: "no-store" }),
    ]);

    if (featRes.ok) {
      const featData = await featRes.json();
      if (featData.length > 0) {
        const f = featData[0];
        featured = { slug: f.slug, nombre: f.nombre, fecha: f.fecha, lugar: f.lugar, descripcion: f.descripcion, imagen_url: f.imagen_url, precio_desde: f.precio_desde };
      }
    }
    if (evtRes.ok) {
      const evtData = await evtRes.json();
      if (evtData.length > 0) events = evtData;
    }
  } catch {
    // Use demo data
  }

  return (
    <>
      {/* Hero */}
      <HeroEvent {...featured} />

      {/* Categories + Events */}
      <section className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
            Descubre eventos
          </h2>
          <Link href="/eventos" className="text-sm text-mandarina hover:text-mandarina-light flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <Suspense fallback={<div className="h-10" />}>
          <CategoryPills />
        </Suspense>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event, i) => (
            <EventCard
              key={event.slug}
              {...event}
              size={i === 0 ? "large" : "default"}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold">
          Organiza tu proximo <span className="text-gradient">evento</span>
        </h2>
        <p className="text-texto-dim text-lg">
          Crea, vende y gestiona entradas en minutos. Scanner QR, estadisticas en vivo y mas.
        </p>
        <Link href="/registro" className="btn-primary inline-flex items-center gap-2 text-lg !px-8 !py-3">
          Empieza gratis <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </>
  );
}
