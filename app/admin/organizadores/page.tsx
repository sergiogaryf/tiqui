"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Organizer {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  estado: string;
}

export default function OrganizadoresPage() {
  const [orgs, setOrgs] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/organizadores")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrgs(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function updateEstado(id: string, estado: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/organizadores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, estado } : o)));
        toast.success(`Organizador ${estado}`);
      } else {
        toast.error("Error al actualizar");
      }
    } catch {
      toast.error("Error de conexion");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
        Organizadores
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card h-20 animate-pulse bg-surface" />)}
        </div>
      ) : orgs.length === 0 ? (
        <p className="text-texto-dim">No hay organizadores registrados</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div key={org.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{org.nombre}</h3>
                <p className="text-sm text-texto-dim">{org.email}</p>
                {org.telefono && <p className="text-xs text-texto-muted">{org.telefono}</p>}
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  "badge",
                  org.estado === "activo" && "badge-success",
                  org.estado === "pendiente" && "badge-warning",
                  org.estado === "suspendido" && "badge-error"
                )}>
                  {org.estado}
                </span>

                {updating === org.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="flex gap-1">
                    {org.estado !== "activo" && (
                      <button onClick={() => updateEstado(org.id, "activo")} className="p-1.5 rounded-lg bg-success/10 hover:bg-success/20 text-success" title="Aprobar">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {org.estado !== "suspendido" && (
                      <button onClick={() => updateEstado(org.id, "suspendido")} className="p-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error" title="Suspender">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
