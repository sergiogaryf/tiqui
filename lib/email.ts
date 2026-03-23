import { Resend } from "resend";

let _resend: Resend;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}
const FROM = process.env.RESEND_FROM || "Tiqui <entradas@tiqui.cl>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#1A1A2E;font-family:Inter,system-ui,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:24px;font-weight:bold;">
            <span style="color:#F5F0EB;">TI</span><span style="color:#FF6B35;">QUI</span>
          </span>
        </div>
        <div style="background:#25253D;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.06);">
          ${content}
        </div>
        <p style="text-align:center;color:#6E6B82;font-size:12px;margin-top:24px;">
          &copy; ${new Date().getFullYear()} Tiqui — Tu entrada al momento
        </p>
      </div>
    </body>
    </html>
  `;
}

export async function sendTicketEmail(data: {
  to: string;
  evento: string;
  tipo: string;
  asistente: string;
  ticketId: string;
  qrDataUrl: string;
  fecha: string;
  lugar: string;
}) {
  const html = baseTemplate(`
    <h2 style="color:#F5F0EB;margin:0 0 8px;">Tu entrada esta confirmada</h2>
    <p style="color:#9E9BB2;margin:0 0 24px;">Presenta este QR en la entrada del evento</p>

    <div style="text-align:center;margin:24px 0;">
      <div style="background:white;display:inline-block;padding:12px;border-radius:12px;">
        <img src="${data.qrDataUrl}" alt="QR" width="200" height="200" />
      </div>
    </div>

    <div style="background:#1A1A2E;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="color:#FF6B35;font-weight:bold;margin:0 0 4px;">${data.evento}</p>
      <p style="color:#9E9BB2;margin:0 0 4px;font-size:14px;">${data.tipo}</p>
      <p style="color:#9E9BB2;margin:0 0 4px;font-size:14px;">${data.fecha} — ${data.lugar}</p>
      <p style="color:#9E9BB2;margin:0;font-size:14px;">Asistente: ${data.asistente}</p>
    </div>

    <p style="color:#6E6B82;font-size:12px;text-align:center;margin:16px 0 0;">
      ID: ${data.ticketId}
    </p>
  `);

  return getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: `Tu entrada para ${data.evento}`,
    html,
  });
}

export async function sendReminderEmail(data: {
  to: string;
  evento: string;
  fecha: string;
  lugar: string;
  direccion?: string;
  qrDataUrl: string;
}) {
  const mapsUrl = data.direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.direccion)}`
    : null;

  const html = baseTemplate(`
    <h2 style="color:#F5F0EB;margin:0 0 8px;">Tu evento es manana</h2>
    <p style="color:#9E9BB2;margin:0 0 24px;">No olvides tu entrada</p>

    <div style="text-align:center;margin:24px 0;">
      <div style="background:white;display:inline-block;padding:12px;border-radius:12px;">
        <img src="${data.qrDataUrl}" alt="QR" width="180" height="180" />
      </div>
    </div>

    <div style="background:#1A1A2E;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="color:#FF6B35;font-weight:bold;margin:0 0 4px;">${data.evento}</p>
      <p style="color:#9E9BB2;margin:0 0 4px;font-size:14px;">${data.fecha}</p>
      <p style="color:#9E9BB2;margin:0;font-size:14px;">${data.lugar}</p>
    </div>

    ${
      mapsUrl
        ? `<p style="text-align:center;"><a href="${mapsUrl}" style="color:#7B68EE;font-size:14px;">Ver ubicacion en Google Maps</a></p>`
        : ""
    }
  `);

  return getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: `Recordatorio: ${data.evento} es manana`,
    html,
  });
}

export async function sendMagicLinkEmail(data: {
  to: string;
  token: string;
}) {
  const link = `${BASE_URL}/mis-tickets?token=${data.token}`;
  const html = baseTemplate(`
    <h2 style="color:#F5F0EB;margin:0 0 8px;">Accede a tus entradas</h2>
    <p style="color:#9E9BB2;margin:0 0 24px;">Haz clic en el boton para ver tus entradas</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${link}" style="display:inline-block;background:#FF6B35;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;">
        Ver mis entradas
      </a>
    </div>

    <p style="color:#6E6B82;font-size:12px;text-align:center;">
      Este enlace expira en 24 horas.
    </p>
  `);

  return getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: "Accede a tus entradas en Tiqui",
    html,
  });
}

export async function sendPasswordResetEmail(data: {
  to: string;
  token: string;
}) {
  const link = `${BASE_URL}/reset-password?token=${data.token}`;
  const html = baseTemplate(`
    <h2 style="color:#F5F0EB;margin:0 0 8px;">Restablecer contrasena</h2>
    <p style="color:#9E9BB2;margin:0 0 24px;">Haz clic en el boton para crear una nueva contrasena</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${link}" style="display:inline-block;background:#FF6B35;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;">
        Restablecer contrasena
      </a>
    </div>

    <p style="color:#6E6B82;font-size:12px;text-align:center;">
      Si no solicitaste este cambio, ignora este email. El enlace expira en 1 hora.
    </p>
  `);

  return getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: "Restablecer tu contrasena en Tiqui",
    html,
  });
}
