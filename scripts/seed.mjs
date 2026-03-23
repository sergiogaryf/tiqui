import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log("Seeding Tiqui...\n");

  // 1. Admin user
  const adminHash = await bcrypt.hash("Admin123", 12);
  const { data: admin, error: e1 } = await supabase
    .from("usuarios")
    .insert({
      nombre: "Sergio",
      apellido: "Gary",
      email: "admin@tiqui.cl",
      password_hash: adminHash,
      telefono: "",
      rol: "admin",
      estado: "activo",
    })
    .select()
    .single();
  if (e1) throw new Error("Admin: " + e1.message);
  console.log("Admin creado:", admin.email);

  // 2. Organizador user
  const orgHash = await bcrypt.hash("Org12345", 12);
  const { data: orgUser, error: e2 } = await supabase
    .from("usuarios")
    .insert({
      nombre: "Demo",
      apellido: "Organizador",
      email: "org@tiqui.cl",
      password_hash: orgHash,
      telefono: "+56912345678",
      rol: "organizador",
      estado: "activo",
    })
    .select()
    .single();
  if (e2) throw new Error("OrgUser: " + e2.message);
  console.log("Usuario organizador creado:", orgUser.email);

  // 3. Organizador record
  const { data: org, error: e3 } = await supabase
    .from("organizadores")
    .insert({
      nombre: "Demo Organizador",
      email: "org@tiqui.cl",
      telefono: "+56912345678",
      estado: "activo",
      usuario_id: orgUser.id,
      comision_pct: 10,
    })
    .select()
    .single();
  if (e3) throw new Error("Org: " + e3.message);
  console.log("Organizador creado:", org.id);

  // 4. Eventos
  const eventosData = [
    {
      nombre: "Festival Electronico Santiago 2026",
      slug: "festival-electronico-santiago-2026",
      descripcion:
        "La mejor fiesta electronica del ano en Santiago. DJs internacionales, tres escenarios, food trucks y mucho mas. Una noche que no te puedes perder.",
      fecha: "2026-05-15",
      hora_inicio: "22:00",
      hora_fin: "06:00",
      lugar: "Espacio Riesco",
      direccion: "Av. El Salto 5000, Huechuraba",
      categoria: "musica",
      capacidad_total: 5000,
      imagen_url: "",
      estado: "publicado",
      destacado: true,
      pin_scanner: "1234",
      organizador_id: org.id,
      edad_minima: 18,
      precio_desde: 15000,
    },
    {
      nombre: "Clase de Salsa y Bachata",
      slug: "clase-salsa-bachata-abril",
      descripcion:
        "Aprende a bailar salsa y bachata desde cero. Clase abierta para todos los niveles. Incluye practica libre al final.",
      fecha: "2026-04-10",
      hora_inicio: "19:00",
      hora_fin: "21:00",
      lugar: "Al Paso Dance Studio",
      direccion: "Av. Providencia 1234",
      categoria: "talleres",
      capacidad_total: 40,
      imagen_url: "",
      estado: "publicado",
      destacado: true,
      pin_scanner: "5678",
      organizador_id: org.id,
      edad_minima: 0,
      precio_desde: 5000,
    },
    {
      nombre: "Torneo de Padel Verano",
      slug: "torneo-padel-verano-2026",
      descripcion:
        "Torneo amateur de padel. Categorias masculina, femenina y mixta. Premios para los tres primeros lugares.",
      fecha: "2026-04-20",
      hora_inicio: "09:00",
      hora_fin: "18:00",
      lugar: "Club de Padel Las Condes",
      direccion: "Av. Las Condes 9876",
      categoria: "deportes",
      capacidad_total: 64,
      imagen_url: "",
      estado: "publicado",
      destacado: false,
      pin_scanner: "9012",
      organizador_id: org.id,
      edad_minima: 16,
      precio_desde: 20000,
    },
    {
      nombre: "Feria Gastronomica Barrio Italia",
      slug: "feria-gastronomica-barrio-italia",
      descripcion:
        "Los mejores restaurantes de Barrio Italia reunidos en un solo lugar. Degustaciones, shows en vivo y talleres de cocina.",
      fecha: "2026-04-25",
      hora_inicio: "12:00",
      hora_fin: "22:00",
      lugar: "Barrio Italia",
      direccion: "Av. Italia 1500, Providencia",
      categoria: "gastronomia",
      capacidad_total: 2000,
      imagen_url: "",
      estado: "publicado",
      destacado: true,
      pin_scanner: "3456",
      organizador_id: org.id,
      edad_minima: 0,
      precio_desde: 0,
    },
  ];

  const { data: eventos, error: e4 } = await supabase
    .from("eventos")
    .insert(eventosData)
    .select();
  if (e4) throw new Error("Eventos: " + e4.message);
  console.log(`${eventos.length} eventos creados`);

  // 5. Tipos de entrada por evento
  const tiposData = [
    // Festival Electronico
    { nombre: "Early Bird", precio: 15000, stock: 500, vendidos: 0, evento_id: eventos[0].id, descripcion: "Precio especial por compra anticipada" },
    { nombre: "General", precio: 25000, stock: 3000, vendidos: 0, evento_id: eventos[0].id, descripcion: "Acceso general al festival" },
    { nombre: "VIP", precio: 55000, stock: 200, vendidos: 0, evento_id: eventos[0].id, descripcion: "Barra libre, zona preferencial, meet & greet" },
    // Salsa
    { nombre: "Individual", precio: 5000, stock: 30, vendidos: 0, evento_id: eventos[1].id, descripcion: "Una persona" },
    { nombre: "Pareja", precio: 8000, stock: 10, vendidos: 0, evento_id: eventos[1].id, descripcion: "Dos personas" },
    // Padel
    { nombre: "Inscripcion Equipo", precio: 20000, stock: 32, vendidos: 0, evento_id: eventos[2].id, descripcion: "Pareja de jugadores" },
    // Feria Gastro
    { nombre: "Entrada Libre", precio: 0, stock: 2000, vendidos: 0, evento_id: eventos[3].id, descripcion: "Acceso gratuito a la feria" },
    { nombre: "Pack Degustacion", precio: 12000, stock: 300, vendidos: 0, evento_id: eventos[3].id, descripcion: "10 degustaciones incluidas" },
  ];

  const { data: tipos, error: e5 } = await supabase
    .from("tipos_entrada")
    .insert(tiposData)
    .select();
  if (e5) throw new Error("Tipos: " + e5.message);
  console.log(`${tipos.length} tipos de entrada creados`);

  // 6. Codigos de descuento
  const codigosData = [
    { codigo: "AMIGOS20", tipo: "descuento", descuento_pct: 20, usos_max: 50, usos_actual: 0, estado: "activo", evento_id: eventos[0].id },
    { codigo: "VIPFREE", tipo: "cortesia", descuento_pct: 0, usos_max: 5, usos_actual: 0, estado: "activo", evento_id: eventos[0].id },
    { codigo: "SALSA50", tipo: "descuento", descuento_pct: 50, usos_max: 10, usos_actual: 0, estado: "activo", evento_id: eventos[1].id },
  ];

  const { error: e6 } = await supabase.from("codigos").insert(codigosData);
  if (e6) throw new Error("Codigos: " + e6.message);
  console.log(`${codigosData.length} codigos de descuento creados`);

  console.log("\n--- Seed completado ---");
  console.log("Admin:       admin@tiqui.cl / Admin123");
  console.log("Organizador: org@tiqui.cl / Org12345");
  console.log("PIN scanner: 1234 (festival), 5678 (salsa), 9012 (padel), 3456 (feria)");
}

seed().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
