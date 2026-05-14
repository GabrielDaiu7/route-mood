import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { loginHandler, logoutHandler, meHandler, registerHandler } from "./auth";
import moods from "./moods";
import {
  getPreferences,
  getRecentMoodSignals,
  getStats,
  initializePostgres,
  insertFeedback,
  insertRouteHistory,
  type Preference,
  upsertPreferences
} from "./postgres";
import { generateSuggestions, getMoodById } from "./routesEngine";
import { getGoogleRoute } from "./googleRouting";
import { findSpotifyPlaylist } from "./spotify";
import { sendWaitlistEmail } from "./waitlistEmail";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedTransports = new Set(["walking", "bike", "car", "transit"]);
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  }
}));
app.use(express.json({ limit: "64kb" }));

app.use((req: Request, res: Response, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const windowMs = 60_000;
  const limit = req.path.startsWith("/api/auth") ? 20 : 90;
  const bucket = requestBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
  }

  return next();
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "route-mood-api" });
});

app.get("/api/moods", (_req: Request, res: Response) => {
  res.json({ moods });
});

app.get("/api/playlist", async (req: Request, res: Response) => {
  const moodId = String(req.query.moodId || "");
  const query = String(req.query.q || "");
  const mood = moodId ? getMoodById(moodId) : undefined;
  const searchQuery = query || mood?.musicKeywords || "mood playlist";

  res.json({ playlist: await findSpotifyPlaylist(searchQuery) });
});

app.post("/api/waitlist", async (req: Request, res: Response) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email and message are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: "Message must be 2000 characters or fewer." });
  }

  const result = await sendWaitlistEmail({ name, email, message });
  return res.status(result.sent ? 201 : 202).json(result);
});

app.post("/api/auth/register", (req: Request, res: Response) => {
  registerHandler(req, res).catch((error: unknown) => {
    console.error("register failed", error);
    res.status(500).json({ error: "Could not register user." });
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  loginHandler(req, res).catch((error: unknown) => {
    console.error("login failed", error);
    res.status(500).json({ error: "Could not log in." });
  });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  meHandler(req, res).catch((error: unknown) => {
    console.error("auth me failed", error);
    res.status(500).json({ error: "Could not verify session." });
  });
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  logoutHandler(req, res).catch((error: unknown) => {
    console.error("logout failed", error);
    res.status(500).json({ error: "Could not log out." });
  });
});

app.post("/api/route-suggestions", async (req: Request, res: Response) => {
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
  if (!getMoodById(moodId)) {
    return res.status(400).json({ error: "Unknown moodId." });
  }
  if (!allowedTransports.has(transport)) {
    return res.status(400).json({ error: "Unsupported transport mode." });
  }

  let suggestions = generateSuggestions({ from, to, moodId, transport, avoid });
  const googleRoute = await getGoogleRoute({ from, to, transport });
  if (googleRoute) {
    suggestions = suggestions.map((item, index) => ({
      ...item,
      routeCoords: index === 0 ? googleRoute.coords : item.routeCoords,
      etaMinutes: index === 0 && googleRoute.etaMinutes ? googleRoute.etaMinutes : item.etaMinutes,
      distanceKm: index === 0 ? googleRoute.distanceKm : undefined,
      why: index === 0
        ? ["Uses Google Maps route geometry when the API key is configured.", ...item.why.slice(0, 2)]
        : item.why
    }));
  }
  await insertRouteHistory({
    id: randomUUID(),
    userId,
    from,
    to,
    moodId,
    transport,
    createdAt: new Date().toISOString()
  });

  return res.json({ suggestions });
});

app.get("/api/mood-trend", async (req: Request, res: Response) => {
  const moodId = String(req.query.moodId || "calm");
  const signals = await getRecentMoodSignals(moodId);

  const routeVolumeBoost = Math.min(12, signals.routes24h * 1.5);
  const feedbackBoost = (signals.avgRating - 3) * 7;
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
    signals: { ...signals, avgRating: Number(signals.avgRating.toFixed(2)) }
  });
});

app.get("/api/preferences/:userId", async (req: Request, res: Response) => {
  const preferences: Preference = await getPreferences(req.params.userId);
  res.json({ preferences });
});

app.put("/api/preferences/:userId", async (req: Request, res: Response) => {
  const preferences = await upsertPreferences(req.params.userId, req.body as Partial<Preference>);
  res.json({ preferences });
});

app.post("/api/feedback", async (req: Request, res: Response) => {
  const { userId = "guest", moodId, rating, comment = "", routeTitle = "", moodMatch, relaxing, tooCrowded } = req.body as {
    userId?: string;
    moodId?: string;
    rating?: number;
    comment?: string;
    routeTitle?: string;
    moodMatch?: boolean;
    relaxing?: boolean;
    tooCrowded?: boolean;
  };

  if (!moodId || typeof rating !== "number") {
    return res.status(400).json({ error: "moodId and numeric rating are required." });
  }
  if (!getMoodById(moodId)) {
    return res.status(400).json({ error: "Unknown moodId." });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be an integer from 1 to 5." });
  }

  const entry = {
    id: randomUUID(),
    userId,
    moodId,
    rating,
    comment,
    routeTitle,
    moodMatch,
    relaxing,
    tooCrowded,
    createdAt: new Date().toISOString()
  };

  await insertFeedback(entry);
  return res.status(201).json({ feedback: entry });
});

app.get("/api/stats", async (_req: Request, res: Response) => {
  res.json(await getStats());
});

initializePostgres()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Route Mood backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to initialize PostgreSQL", error);
    process.exit(1);
  });
