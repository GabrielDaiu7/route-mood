import fs from "node:fs";
import path from "node:path";

export type Preference = {
  favoriteMoods: string[];
  defaultTransport: string;
  notificationsEnabled: boolean;
  updatedAt?: string;
};

export type Feedback = {
  id: string;
  userId: string;
  moodId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type RouteHistory = {
  id: string;
  userId: string;
  from: string;
  to: string;
  moodId: string;
  transport: string;
  createdAt: string;
};

export type Db = {
  preferences: Record<string, Preference>;
  feedback: Feedback[];
  routesHistory: RouteHistory[];
};

const dbPath = path.join(__dirname, "..", "data", "db.json");

const defaultDb: Db = {
  preferences: {},
  feedback: [],
  routesHistory: []
};

function ensureDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
  }
}

export function readDb(): Db {
  ensureDb();
  const raw = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(raw) as Db;
}

export function writeDb(db: Db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}
