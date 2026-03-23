"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type ScanResult = {
  status: "valido" | "ya_usado" | "invalido" | "cancelado";
  mensaje: string;
  evento?: string;
  tipo?: string;
  asistente?: string;
  usadoEn?: string;
};

interface QRScannerProps {
  eventoId: string;
  pin: string;
  onCheckin?: (result: ScanResult) => void;
}

export function QRScanner({ eventoId, pin, onCheckin }: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(true);
  const [checkins, setCheckins] = useState(0);

  const handleScan = useCallback(
    async (qrData: string) => {
      setScanning(false);

      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qr_data: qrData, evento_id: eventoId, pin }),
        });
        const data: ScanResult = await res.json();
        setResult(data);
        if (data.status === "valido") {
          setCheckins((c) => c + 1);
        }
        onCheckin?.(data);
      } catch {
        setResult({
          status: "invalido",
          mensaje: "Error de conexion al validar",
        });
      }
    },
    [eventoId, pin, onCheckin]
  );

  useEffect(() => {
    if (!scanning || !scannerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode("qr-reader");
      html5QrRef.current = qr;
      scanner = qr;

      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          qr.stop().catch(() => {});
          handleScan(decodedText);
        },
        () => {}
      );
    })();

    return () => {
      scanner?.clear().catch(() => {});
    };
  }, [scanning, handleScan]);

  function reset() {
    setResult(null);
    setScanning(true);
  }

  return (
    <div className="space-y-4">
      {/* Counter */}
      <div className="text-center">
        <span className="badge badge-success text-sm">
          {checkins} check-ins realizados
        </span>
      </div>

      {/* Scanner */}
      {scanning && (
        <div className="rounded-2xl overflow-hidden bg-surface border border-white/6">
          <div id="qr-reader" ref={scannerRef} className="w-full" />
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={cn(
            "p-6 rounded-2xl border text-center space-y-3 animate-fade-in",
            result.status === "valido" && "bg-success/10 border-success/30",
            result.status === "ya_usado" && "bg-error/10 border-error/30",
            result.status === "invalido" && "bg-error/10 border-error/30",
            result.status === "cancelado" && "bg-warning/10 border-warning/30"
          )}
        >
          {result.status === "valido" && (
            <CheckCircle className="w-16 h-16 text-success mx-auto" />
          )}
          {result.status === "ya_usado" && (
            <AlertTriangle className="w-16 h-16 text-error mx-auto" />
          )}
          {result.status === "invalido" && (
            <XCircle className="w-16 h-16 text-error mx-auto" />
          )}
          {result.status === "cancelado" && (
            <AlertTriangle className="w-16 h-16 text-warning mx-auto" />
          )}

          <p className="text-lg font-bold">{result.mensaje}</p>

          {result.asistente && (
            <p className="text-texto-dim">{result.asistente}</p>
          )}
          {result.tipo && (
            <p className="text-sm text-texto-muted">{result.tipo}</p>
          )}
          {result.usadoEn && (
            <p className="text-xs text-texto-muted">
              Usado: {result.usadoEn}
            </p>
          )}

          <button
            onClick={reset}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            <RotateCcw className="w-4 h-4" />
            Escanear otra entrada
          </button>
        </div>
      )}
    </div>
  );
}
