const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface MPItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

interface MPPreference {
  id: string;
  init_point: string;
}

export async function createPreference(data: {
  items: MPItem[];
  externalReference: string;
  payerEmail?: string;
}): Promise<MPPreference> {
  const body = {
    items: data.items.map((item) => ({
      ...item,
      currency_id: "CLP",
    })),
    external_reference: data.externalReference,
    back_urls: {
      success: `${BASE_URL}/confirmacion/${data.externalReference}`,
      failure: `${BASE_URL}/confirmacion/${data.externalReference}?status=failure`,
      pending: `${BASE_URL}/confirmacion/${data.externalReference}?status=pending`,
    },
    auto_return: "approved",
    notification_url: `${BASE_URL}/api/webhook`,
    ...(data.payerEmail ? { payer: { email: data.payerEmail } } : {}),
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error creando preference MP: ${err}`);
  }

  return res.json();
}

export async function getPayment(paymentId: string) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    }
  );

  if (!res.ok) throw new Error("Error obteniendo pago MP");
  return res.json();
}

export function calculateCommission(
  amount: number,
  commissionPct: number = 10
): { base: number; commission: number; total: number } {
  const commission = Math.round(amount * (commissionPct / 100));
  return {
    base: amount,
    commission,
    total: amount,
  };
}
