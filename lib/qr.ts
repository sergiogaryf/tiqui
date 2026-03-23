import crypto from "crypto";
import QRCode from "qrcode";
import { v4 as uuid } from "uuid";

const SIGNING_SECRET = process.env.QR_SIGNING_SECRET || "dev-secret-change-me";

export function generateTicketId(): string {
  const rand = uuid().replace(/-/g, "").substring(0, 12).toUpperCase();
  return `TQ-${rand.substring(0, 5)}-${rand.substring(5)}`;
}

export function signQR(data: string): string {
  return crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(data)
    .digest("hex");
}

export function verifyQR(data: string, hash: string): boolean {
  const expected = signQR(data);
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(hash, "hex")
  );
}

export function createQRPayload(ticketId: string, eventoId: string): string {
  const data = `${ticketId}:${eventoId}`;
  const hash = signQR(data);
  return `${data}:${hash}`;
}

export function parseQRPayload(
  payload: string
): { ticketId: string; eventoId: string; valid: boolean } | null {
  const parts = payload.split(":");
  if (parts.length !== 3) return null;

  const [ticketId, eventoId, hash] = parts;
  const data = `${ticketId}:${eventoId}`;
  const valid = verifyQR(data, hash);

  return { ticketId, eventoId, valid };
}

export async function generateQRDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 300,
    margin: 2,
    color: { dark: "#1A1A2E", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
}
