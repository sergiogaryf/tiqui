import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient;

function supabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// Generic helpers

export async function findAll<T extends Record<string, unknown>>(
  table: string,
  options?: {
    filters?: Record<string, unknown>;
    eq?: [string, unknown][];
    gt?: [string, unknown][];
    order?: { column: string; ascending?: boolean };
    limit?: number;
    select?: string;
  }
): Promise<(T & { id: string })[]> {
  let query = supabase().from(table).select(options?.select || "*");

  if (options?.eq) {
    for (const [col, val] of options.eq) {
      query = query.eq(col, val);
    }
  }
  if (options?.gt) {
    for (const [col, val] of options.gt) {
      query = query.gt(col, val);
    }
  }
  if (options?.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? true,
    });
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`DB findAll ${table}: ${error.message}`);
  return (data || []) as unknown as (T & { id: string })[];
}

export async function findOne<T extends Record<string, unknown>>(
  table: string,
  eq: [string, unknown][]
): Promise<(T & { id: string }) | null> {
  let query = supabase().from(table).select("*");
  for (const [col, val] of eq) {
    query = query.eq(col, val);
  }
  const { data, error } = await query.limit(1).single();
  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows
    throw new Error(`DB findOne ${table}: ${error.message}`);
  }
  return (data as T & { id: string }) || null;
}

export async function findById<T extends Record<string, unknown>>(
  table: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const { data, error } = await supabase()
    .from(table)
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") return null;
  return (data as T & { id: string }) || null;
}

export async function createRecord<T extends Record<string, unknown>>(
  table: string,
  fields: Partial<T>
): Promise<T & { id: string }> {
  const { data, error } = await supabase()
    .from(table)
    .insert(fields)
    .select()
    .single();
  if (error) throw new Error(`DB create ${table}: ${error.message}`);
  return data as T & { id: string };
}

export async function updateRecord<T extends Record<string, unknown>>(
  table: string,
  id: string,
  fields: Partial<T>
): Promise<T & { id: string }> {
  const { data, error } = await supabase()
    .from(table)
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`DB update ${table}: ${error.message}`);
  return data as T & { id: string };
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  const { error } = await supabase().from(table).delete().eq("id", id);
  if (error) throw new Error(`DB delete ${table}: ${error.message}`);
}

// Domain-specific helpers

export async function getEventBySlug(slug: string) {
  return findOne("eventos", [["slug", slug]]);
}

export async function getPublicEvents(categoria?: string) {
  let query = supabase()
    .from("eventos")
    .select("*")
    .eq("estado", "publicado")
    .gt("fecha", new Date().toISOString().split("T")[0])
    .order("fecha", { ascending: true });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data, error } = await query;
  if (error) throw new Error(`getPublicEvents: ${error.message}`);
  return (data || []) as (Record<string, unknown> & { id: string })[];
}

export async function getFeaturedEvents() {
  const { data, error } = await supabase()
    .from("eventos")
    .select("*")
    .eq("estado", "publicado")
    .eq("destacado", true)
    .gt("fecha", new Date().toISOString().split("T")[0])
    .order("fecha", { ascending: true })
    .limit(5);

  if (error) throw new Error(`getFeaturedEvents: ${error.message}`);
  return (data || []) as (Record<string, unknown> & { id: string })[];
}

export async function getTicketTypes(eventoId: string) {
  const { data, error } = await supabase()
    .from("tipos_entrada")
    .select("*")
    .eq("evento_id", eventoId);

  if (error) throw new Error(`getTicketTypes: ${error.message}`);
  return (data || []) as (Record<string, unknown> & { id: string })[];
}

export async function getTicketByQRHash(qrHash: string) {
  return findOne("tickets", [["qr_hash", qrHash]]);
}

export async function getUserByEmail(email: string) {
  return findOne("usuarios", [["email", email]]);
}

export async function getSessionByToken(token: string) {
  const { data, error } = await supabase()
    .from("sesiones")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error && error.code !== "PGRST116") return null;
  return (data as Record<string, unknown> & { id: string }) || null;
}

export async function getOrganizerEvents(organizadorId: string) {
  const { data, error } = await supabase()
    .from("eventos")
    .select("*")
    .eq("organizador_id", organizadorId)
    .order("fecha", { ascending: false });

  if (error) throw new Error(`getOrganizerEvents: ${error.message}`);
  return (data || []) as (Record<string, unknown> & { id: string })[];
}

export async function getEventTickets(eventoId: string) {
  return findAll("tickets", { eq: [["evento_id", eventoId]] });
}

export async function getEventAttendees(eventoId: string) {
  return findAll("asistentes", { eq: [["evento_id", eventoId]] });
}

export async function getEventCodes(eventoId: string) {
  return findAll("codigos", { eq: [["evento_id", eventoId]] });
}

export async function getOrganizerByUserId(userId: string) {
  return findOne("organizadores", [["usuario_id", userId]]);
}

export async function getPaymentByMPId(mpPaymentId: string) {
  return findOne("pagos", [["mp_payment_id", mpPaymentId]]);
}

export async function getOrderTickets(pagoId: string) {
  return findAll("tickets", { eq: [["pago_id", pagoId]] });
}

export async function getPendingTicketsOlderThan(minutes: number) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const { data, error } = await supabase()
    .from("tickets")
    .select("*")
    .eq("estado", "pendiente")
    .lt("created_at", cutoff);

  if (error) throw new Error(`getPendingTickets: ${error.message}`);
  return (data || []) as (Record<string, unknown> & { id: string })[];
}

export async function getEventsForTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  const { data, error } = await supabase()
    .from("eventos")
    .select("*")
    .eq("estado", "publicado")
    .eq("fecha", dateStr);

  if (error) throw new Error(`getEventsForTomorrow: ${error.message}`);
  return (data || []) as (Record<string, unknown> & { id: string })[];
}
