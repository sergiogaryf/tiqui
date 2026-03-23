"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else toast.error("Error al enviar");
    } catch {
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {sent ? (
          <>
            <Mail className="w-16 h-16 text-success mx-auto" />
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Revisa tu email</h1>
            <p className="text-texto-dim">Si la cuenta existe, recibiras un enlace para restablecer tu contrasena.</p>
            <Link href="/login" className="btn-secondary inline-block">Volver al login</Link>
          </>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">Recuperar contrasena</h1>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm text-texto-dim mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required autoFocus />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar enlace
              </button>
            </form>
            <Link href="/login" className="text-sm text-texto-dim hover:text-texto">Volver al login</Link>
          </>
        )}
      </div>
    </div>
  );
}
