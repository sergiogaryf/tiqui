"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const CATEGORIAS = [
  "musica", "fiestas", "deportes", "cultura",
  "gastronomia", "talleres", "bienestar", "tecnologia",
];

interface TipoEntrada {
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string;
}

export default function NuevoEventoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    lugar: "",
    direccion: "",
    categoria: "musica",
    capacidad_total: 100,
    imagen_url: "",
    edad_minima: 0,
  });
  const [tipos, setTipos] = useState<TipoEntrada[]>([
    { nombre: "General", precio: 0, stock: 100, descripcion: "" },
  ]);

  function updateForm(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateTipo(index: number, field: keyof TipoEntrada, value: string | number) {
    setTipos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addTipo() {
    setTipos((prev) => [...prev, { nombre: "", precio: 0, stock: 50, descripcion: "" }]);
  }

  function removeTipo(index: number) {
    if (tipos.length <= 1) return;
    setTipos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tipos.some((t) => !t.nombre.trim())) {
      toast.error("Todos los tipos de entrada necesitan nombre");
      return;
    }

    setLoading(true);
    try {
      // Create event
      const totalCapacity = tipos.reduce((s, t) => s + t.stock, 0);
      const res = await fetch("/api/panel/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, capacidad_total: totalCapacity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Create ticket types
      for (const tipo of tipos) {
        await fetch(`/api/panel/eventos/${data.id}/tipos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tipo),
        });
      }

      toast.success("Evento creado");
      router.push("/panel");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear evento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-20 max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
        Crear evento
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Informacion basica</h2>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Nombre del evento</label>
            <input type="text" value={form.nombre} onChange={(e) => updateForm("nombre", e.target.value)} className="input" required />
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Descripcion</label>
            <textarea value={form.descripcion} onChange={(e) => updateForm("descripcion", e.target.value)} className="input min-h-[120px] resize-y" required />
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Categoria</label>
            <select value={form.categoria} onChange={(e) => updateForm("categoria", e.target.value)} className="input">
              {CATEGORIAS.map((c) => (
                <option key={c} value={c} className="bg-surface">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">URL de imagen (opcional)</label>
            <input type="url" value={form.imagen_url} onChange={(e) => updateForm("imagen_url", e.target.value)} className="input" placeholder="https://..." />
          </div>
        </div>

        {/* Date & location */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Fecha y lugar</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-texto-dim mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => updateForm("fecha", e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm text-texto-dim mb-1">Hora inicio</label>
              <input type="time" value={form.hora_inicio} onChange={(e) => updateForm("hora_inicio", e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm text-texto-dim mb-1">Hora fin (opc.)</label>
              <input type="time" value={form.hora_fin} onChange={(e) => updateForm("hora_fin", e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Lugar</label>
            <input type="text" value={form.lugar} onChange={(e) => updateForm("lugar", e.target.value)} className="input" required />
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Direccion (opcional)</label>
            <input type="text" value={form.direccion} onChange={(e) => updateForm("direccion", e.target.value)} className="input" />
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Edad minima</label>
            <input type="number" value={form.edad_minima} onChange={(e) => updateForm("edad_minima", parseInt(e.target.value) || 0)} className="input w-24" min={0} />
          </div>
        </div>

        {/* Ticket types */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Tipos de entrada</h2>
            <button type="button" onClick={addTipo} className="btn-ghost text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>

          {tipos.map((tipo, i) => (
            <div key={i} className="p-4 rounded-xl bg-base border border-white/6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-texto-dim">Tipo {i + 1}</span>
                {tipos.length > 1 && (
                  <button type="button" onClick={() => removeTipo(i)} className="text-error hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 md:col-span-1">
                  <input type="text" placeholder="Nombre" value={tipo.nombre} onChange={(e) => updateTipo(i, "nombre", e.target.value)} className="input text-sm" required />
                </div>
                <div>
                  <input type="number" placeholder="Precio" value={tipo.precio} onChange={(e) => updateTipo(i, "precio", parseInt(e.target.value) || 0)} className="input text-sm" min={0} />
                </div>
                <div>
                  <input type="number" placeholder="Stock" value={tipo.stock} onChange={(e) => updateTipo(i, "stock", parseInt(e.target.value) || 1)} className="input text-sm" min={1} />
                </div>
              </div>

              <input type="text" placeholder="Descripcion (opc.)" value={tipo.descripcion} onChange={(e) => updateTipo(i, "descripcion", e.target.value)} className="input text-sm" />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Creando..." : "Crear evento"}
        </button>
      </form>
    </div>
  );
}
