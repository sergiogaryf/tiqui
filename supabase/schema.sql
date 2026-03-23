-- Tiqui — Schema Supabase/PostgreSQL
-- Ejecutar en el SQL Editor de Supabase

-- Usuarios (organizadores, admins)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  telefono TEXT DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'organizador' CHECK (rol IN ('organizador', 'admin', 'comprador')),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('activo', 'pendiente', 'suspendido')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Organizadores
CREATE TABLE IF NOT EXISTS organizadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('activo', 'pendiente', 'suspendido')),
  usuario_id UUID REFERENCES usuarios(id),
  comision_pct INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT DEFAULT '',
  fecha DATE NOT NULL,
  hora_inicio TEXT DEFAULT '',
  hora_fin TEXT DEFAULT '',
  lugar TEXT NOT NULL,
  direccion TEXT DEFAULT '',
  categoria TEXT CHECK (categoria IN ('musica', 'fiestas', 'deportes', 'cultura', 'gastronomia', 'talleres', 'bienestar', 'tecnologia')),
  capacidad_total INTEGER DEFAULT 0,
  imagen_url TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'finalizado', 'cancelado')),
  destacado BOOLEAN DEFAULT false,
  pin_scanner TEXT DEFAULT '',
  organizador_id UUID REFERENCES organizadores(id),
  edad_minima INTEGER DEFAULT 0,
  precio_desde INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tipos de entrada
CREATE TABLE IF NOT EXISTS tipos_entrada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  precio INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  vendidos INTEGER DEFAULT 0,
  descripcion TEXT DEFAULT '',
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  requiere_codigo BOOLEAN DEFAULT false,
  fecha_limite TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monto_base INTEGER DEFAULT 0,
  monto_comision INTEGER DEFAULT 0,
  monto_total INTEGER DEFAULT 0,
  metodo TEXT DEFAULT 'mercadopago' CHECK (metodo IN ('mercadopago', 'cortesia')),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  fecha TIMESTAMPTZ DEFAULT now(),
  mp_payment_id TEXT DEFAULT '',
  mp_preference_id TEXT DEFAULT '',
  organizador_id UUID REFERENCES organizadores(id),
  evento_id UUID REFERENCES eventos(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Asistentes
CREATE TABLE IF NOT EXISTS asistentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT DEFAULT '',
  evento_id UUID REFERENCES eventos(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE NOT NULL,
  qr_hash TEXT DEFAULT '',
  qr_data_url TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'checkin', 'cancelado', 'expirado')),
  tipo_entrada_id UUID REFERENCES tipos_entrada(id),
  asistente_id UUID REFERENCES asistentes(id),
  pago_id UUID REFERENCES pagos(id),
  evento_id UUID REFERENCES eventos(id),
  email_asistente TEXT DEFAULT '',
  checkin_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sesiones
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Codigos de descuento
CREATE TABLE IF NOT EXISTS codigos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('cortesia', 'descuento')),
  descuento_pct INTEGER DEFAULT 0,
  usos_max INTEGER DEFAULT 1,
  usos_actual INTEGER DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Checkins
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id),
  evento_id UUID REFERENCES eventos(id),
  resultado TEXT CHECK (resultado IN ('valido', 'invalido', 'ya_usado')),
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Magic Links
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reset Tokens
CREATE TABLE IF NOT EXISTS reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_eventos_slug ON eventos(slug);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_organizador ON eventos(organizador_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_evento ON tickets(evento_id);
CREATE INDEX IF NOT EXISTS idx_tickets_pago ON tickets(pago_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets(estado);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(session_token);
CREATE INDEX IF NOT EXISTS idx_sesiones_expires ON sesiones(expires_at);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_organizadores_usuario ON organizadores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tipos_entrada_evento ON tipos_entrada(evento_id);
CREATE INDEX IF NOT EXISTS idx_pagos_evento ON pagos(evento_id);
CREATE INDEX IF NOT EXISTS idx_codigos_evento ON codigos(evento_id);
CREATE INDEX IF NOT EXISTS idx_asistentes_evento ON asistentes(evento_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token);

-- RLS (Row Level Security) - deshabilitado para API server-side
-- Habilitar solo si usas Supabase Auth directamente desde el cliente
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_entrada ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE reset_tokens ENABLE ROW LEVEL SECURITY;

-- Politica de acceso completo para service_role (usado desde el servidor)
CREATE POLICY "Service role full access" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON organizadores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON eventos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON tipos_entrada FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON pagos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON asistentes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON sesiones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON codigos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON checkins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON magic_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reset_tokens FOR ALL USING (true) WITH CHECK (true);

-- Eventos publicos visibles para anon
CREATE POLICY "Public events" ON eventos FOR SELECT USING (estado = 'publicado');
CREATE POLICY "Public ticket types" ON tipos_entrada FOR SELECT USING (true);
