"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "todos", label: "Todos", icon: "🔥" },
  { id: "musica", label: "Musica", icon: "🎵" },
  { id: "fiestas", label: "Fiestas", icon: "🎉" },
  { id: "deportes", label: "Deportes", icon: "⚽" },
  { id: "cultura", label: "Cultura", icon: "🎭" },
  { id: "gastronomia", label: "Gastro", icon: "🍷" },
  { id: "talleres", label: "Talleres", icon: "🎨" },
  { id: "bienestar", label: "Bienestar", icon: "🧘" },
  { id: "tecnologia", label: "Tech", icon: "💻" },
];

export function CategoryPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("cat") || "todos";

  function handleClick(id: string) {
    if (id === "todos") {
      router.push("/eventos");
    } else {
      router.push(`/eventos?cat=${id}`);
    }
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleClick(cat.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            active === cat.id
              ? "bg-mandarina text-white"
              : "bg-surface hover:bg-surface-2 text-texto-dim hover:text-texto"
          )}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
