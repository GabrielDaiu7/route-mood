import cors from "cors";
import express, { type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { readDb, writeDb, type Preference } from "./dataStore";
import moods from "./moods";
import { generateSuggestions } from "./routesEngine";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "route-mood-api" });
});

app.get("/api/moods", (_req: Request, res: Response) => {
  res.json({ moods });
});

app.post("/api/route-suggestions", (req: Request, res: Response) => {
  const { userId = "guest", from, to, moodId, transport = "walking", avoid } = req.body as {
    userId?: string;
    from?: string;
    to?: string;
    moodId?: string;
    transport?: string;
    avoid?: {
      crowded?: boolean;
      noisy?: boolean;
      highStress?: boolean;
    };
  };

  if (!from || !to || !moodId) {
    return res.status(400).json({ error: "from, to and moodId are required." });
  }

  const suggestions = generateSuggestions({ from, to, moodId, transport, avoid });
  const db = readDb();

  db.routesHistory.push({
    id: randomUUID(),
    userId,
    from,
    to,
    moodId,
    transport,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return res.json({ suggestions });
});

app.get("/api/mood-trend", (req: Request, res: Response) => {
  const moodId = String(req.query.moodId || "calm");
  const db = readDb();
  const now = Date.now();

  const routes = db.routesHistory
    .filter((item) => item.moodId === moodId)
    .filter((item) => now - new Date(item.createdAt).getTime() <= 24 * 60 * 60 * 1000);

  const recentFeedback = db.feedback
    .filter((item) => item.moodId === moodId)
    .filter((item) => now - new Date(item.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);

  const feedbackAvg =
    recentFeedback.length > 0
      ? recentFeedback.reduce((sum, item) => sum + item.rating, 0) / recentFeedback.length
      : 3.4;

  const routeVolumeBoost = Math.min(12, routes.length * 1.5);
  const feedbackBoost = (feedbackAvg - 3) * 7;
  const baseByMood: Record<string, number> = { calm: 66, happy: 72, focused: 69, energetic: 75, stressed: 45 };
  const base = baseByMood[moodId] ?? 64;

  const score1 = Math.max(30, Math.min(95, Math.round(base + routeVolumeBoost + feedbackBoost - 3)));
  const score2 = Math.max(30, Math.min(95, Math.round(base + routeVolumeBoost + feedbackBoost + 2)));
  const score3 = Math.max(30, Math.min(95, Math.round(base + routeVolumeBoost + feedbackBoost - 1)));

  res.json({
    moodId,
    trend: [
      { hour: "+1h", score: score1 },
      { hour: "+2h", score: score2 },
      { hour: "+3h", score: score3 }
    ],
    signals: {
      routes24h: routes.length,
      feedback7d: recentFeedback.length,
      avgRating: Number(feedbackAvg.toFixed(2))
    }
  });
});

app.get("/api/preferences/:userId", (req: Request, res: Response) => {
  const db = readDb();
  const preferences: Preference = db.preferences[req.params.userId] || {
    favoriteMoods: [],
    defaultTransport: "walking",
    notificationsEnabled: false
  };

  res.json({ preferences });
});

app.put("/api/preferences/:userId", (req: Request, res: Response) => {
  const db = readDb();
  const current = db.preferences[req.params.userId] || {
    favoriteMoods: [],
    defaultTransport: "walking",
    notificationsEnabled: false
  };

  db.preferences[req.params.userId] = {
    ...current,
    ...(req.body as Partial<Preference>),
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  res.json({ preferences: db.preferences[req.params.userId] });
});

app.post("/api/feedback", (req: Request, res: Response) => {
  const { userId = "guest", moodId, rating, comment = "" } = req.body as {
    userId?: string;
    moodId?: string;
    rating?: number;
    comment?: string;
  };

  if (!moodId || typeof rating !== "number") {
    return res.status(400).json({ error: "moodId and numeric rating are required." });
  }

  const db = readDb();
  const entry = {
    id: randomUUID(),
    userId,
    moodId,
    rating,
    comment,
    createdAt: new Date().toISOString()
  };

  db.feedback.push(entry);
  writeDb(db);
  return res.status(201).json({ feedback: entry });
});

app.get("/api/stats", (_req: Request, res: Response) => {
  const db = readDb();

  const activeUsers = new Set([
    ...Object.keys(db.preferences),
    ...db.routesHistory.map((r) => r.userId),
    ...db.feedback.map((f) => f.userId)
  ]).size;

  const moodCounts = db.routesHistory.reduce<Record<string, number>>((acc, route) => {
    acc[route.moodId] = (acc[route.moodId] || 0) + 1;
    return acc;
  }, {});

  res.json({
    activeUsers,
    totalFeedback: db.feedback.length,
    totalRoutesGenerated: db.routesHistory.length,
    moodCounts
  });
});

app.listen(PORT, () => {
  console.log(`Route Mood backend running on http://localhost:${PORT}`);
});
