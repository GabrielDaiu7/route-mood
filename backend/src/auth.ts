import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import {
  createSession,
  deleteExpiredSessions,
  deleteSession,
  getUserByEmail,
  getUserBySessionToken,
  registerUser,
  loginUser
} from "./postgres";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
}

export async function registerHandler(req: Request, res: Response) {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required." });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: "This email is already registered." });
  }

  const user = await registerUser({ id: randomUUID(), name, email, password });
  const token = await createSession(user.id);
  return res.status(201).json({ user, token });
}

export async function loginHandler(req: Request, res: Response) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  const user = await loginUser(email, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = await createSession(user.id);
  return res.json({ user, token });
}

export async function meHandler(req: Request, res: Response) {
  await deleteExpiredSessions();
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing session token." });
  }

  const user = await getUserBySessionToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid session token." });
  }

  return res.json({ user });
}

export async function logoutHandler(req: Request, res: Response) {
  const token = getBearerToken(req);
  if (token) {
    await deleteSession(token);
  }
  return res.status(204).send();
}
