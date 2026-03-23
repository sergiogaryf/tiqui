import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { cookies } from "next/headers";
import {
  createRecord,
  findById,
  findOne,
  getUserByEmail,
  getSessionByToken,
  deleteRecord,
} from "./db";

const SESSION_COOKIE = "tiqui_session";
const SESSION_DURATION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<string> {
  const token = uuid();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await createRecord("sesiones", {
    session_token: token,
    usuario_id: userId,
    expires_at: expiresAt.toISOString(),
    ip: ip || "",
    user_agent: userAgent || "",
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await getSessionByToken(token);
  if (!session) return null;

  const userId = (session as Record<string, unknown>).usuario_id as string;
  const user = await findById("usuarios", userId);
  return user;
}

export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const session = await getSessionByToken(token);
    if (session) {
      await deleteRecord("sesiones", session.id);
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function registerUser(data: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol: "organizador" | "admin";
}) {
  const existing = await getUserByEmail(data.email);
  if (existing) throw new Error("Email ya registrado");

  const passwordHash = await hashPassword(data.password);

  const user = await createRecord("usuarios", {
    nombre: data.nombre,
    apellido: data.apellido,
    email: data.email,
    password_hash: passwordHash,
    telefono: data.telefono || "",
    rol: data.rol,
    estado: "pendiente",
  });

  if (data.rol === "organizador") {
    await createRecord("organizadores", {
      nombre: `${data.nombre} ${data.apellido}`,
      email: data.email,
      telefono: data.telefono || "",
      estado: "pendiente",
      usuario_id: user.id,
    });
  }

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("Credenciales invalidas");

  const fields = user as Record<string, unknown>;

  if (fields.estado === "suspendido") {
    throw new Error("Cuenta suspendida");
  }

  const valid = await verifyPassword(
    password,
    fields.password_hash as string
  );
  if (!valid) throw new Error("Credenciales invalidas");

  return user;
}
