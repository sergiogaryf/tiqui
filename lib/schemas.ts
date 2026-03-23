import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Password requerido"),
});

export const registerSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  apellido: z.string().min(2, "Apellido muy corto"),
  email: z.string().email("Email invalido"),
  password: z
    .string()
    .min(8, "Minimo 8 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos 1 mayuscula")
    .regex(/[0-9]/, "Debe tener al menos 1 numero"),
  telefono: z.string().optional(),
});

export const createEventSchema = z.object({
  nombre: z.string().min(3, "Nombre muy corto").max(100),
  descripcion: z.string().min(10, "Descripcion muy corta").max(2000),
  fecha: z.string().min(1, "Fecha requerida"),
  hora_inicio: z.string().min(1, "Hora requerida"),
  hora_fin: z.string().optional(),
  lugar: z.string().min(2, "Lugar requerido"),
  direccion: z.string().optional(),
  categoria: z.enum([
    "musica",
    "fiestas",
    "deportes",
    "cultura",
    "gastronomia",
    "talleres",
    "bienestar",
    "tecnologia",
  ]),
  capacidad_total: z.number().int().min(1),
  imagen_url: z.string().url().optional(),
  edad_minima: z.number().int().min(0).optional(),
});

export const ticketTypeSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  precio: z.number().min(0, "Precio invalido"),
  stock: z.number().int().min(1, "Stock minimo 1"),
  descripcion: z.string().optional(),
  requiere_codigo: z.boolean().optional(),
  fecha_limite: z.string().optional(),
});

export const checkoutSchema = z.object({
  eventoId: z.string().min(1),
  items: z.array(
    z.object({
      tipoId: z.string().min(1),
      cantidad: z.number().int().min(1).max(10),
      asistentes: z.array(
        z.object({
          nombre: z.string().min(1),
          apellido: z.string().min(1),
          email: z.string().email(),
          telefono: z.string().optional(),
        })
      ),
    })
  ),
  codigo: z.string().optional(),
});

export const checkinSchema = z.object({
  qr_data: z.string().min(1),
  evento_id: z.string().min(1),
  pin: z.string().min(4).max(6),
});

export const discountCodeSchema = z.object({
  codigo: z.string().min(3).max(20),
  tipo: z.enum(["cortesia", "descuento"]),
  descuento_pct: z.number().min(0).max(100).optional(),
  usos_max: z.number().int().min(1),
  evento_id: z.string().min(1),
});
