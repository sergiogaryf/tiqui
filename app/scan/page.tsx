"use client";

import { useState } from "react";
import { QRScanner } from "@/components/QRScanner";
import { Loader2 } from "lucide-react";

export default function ScanPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [eventoId, setEventoId] = useState("");
  const [pin, setPin] = useState("");
  const [staffName, setStaffName] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (eventoId.trim() && pin.trim()) {
      setLoggedIn(true);
    }
  }

  if (!loggedIn) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
              Scanner QR
            </h1>
            <p className="text-texto-dim mt-1">Staff check-in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-texto-dim mb-1">Tu nombre</label>
              <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm text-texto-dim mb-1">ID del evento</label>
              <input type="text" value={eventoId} onChange={(e) => setEventoId(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm text-texto-dim mb-1">PIN</label>
              <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="input" required minLength={4} maxLength={6} />
            </div>
            <button type="submit" className="btn-primary w-full">
              Iniciar scanner
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 max-w-md mx-auto px-4 py-8 space-y-4">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">
          Scanner QR
        </h1>
        <p className="text-texto-dim text-sm">{staffName}</p>
      </div>

      <QRScanner eventoId={eventoId} pin={pin} />
    </div>
  );
}
