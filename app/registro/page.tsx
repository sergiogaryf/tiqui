"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Cuenta creada. Pendiente de aprobacion.");
        router.push("/login");
      } else {
        toast.error(data.error || "Error al registrar");
      }
    } catch {
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
            Crear cuenta
          </h1>
          <p className="text-texto-dim mt-2">
            Registrate como organizador de eventos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-texto-dim mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm text-texto-dim mb-1">Apellido</label>
              <input type="text" value={form.apellido} onChange={(e) => update("apellido", e.target.value)} className="input" required />
            </div>
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" required />
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Telefono (opcional)</label>
            <input type="tel" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} className="input" placeholder="+56 9 1234 5678" />
          </div>

          <div>
            <label className="block text-sm text-texto-dim mb-1">Contrasena</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className="input" required minLength={8} />
            <p className="text-xs text-texto-muted mt-1">
              Minimo 8 caracteres, 1 mayuscula y 1 numero
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-texto-dim text-sm">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="text-mandarina hover:text-mandarina-light">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
