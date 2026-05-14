"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const node_crypto_1 = require("node:crypto");
const auth_1 = require("./auth");
const moods_1 = __importDefault(require("./moods"));
const postgres_1 = require("./postgres");
const routesEngine_1 = require("./routesEngine");
const googleRouting_1 = require("./googleRouting");
const spotify_1 = require("./spotify");
const waitlistEmail_1 = require("./waitlistEmail");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 4000;
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedTransports = new Set(["walking", "bike", "car", "transit"]);
const requestBuckets = new Map();
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS."));
    }
}));
app.use(express_1.default.json({ limit: "64kb" }));
app.use((req, res, next) => {
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
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "route-mood-api" });
});
app.get("/api/moods", (_req, res) => {
    res.json({ moods: moods_1.default });
});
app.get("/api/playlist", async (req, res) => {
    const moodId = String(req.query.moodId || "");
    const query = String(req.query.q || "");
    const mood = moodId ? (0, routesEngine_1.getMoodById)(moodId) : undefined;
    const searchQuery = query || mood?.musicKeywords || "mood playlist";
    res.json({ playlist: await (0, spotify_1.findSpotifyPlaylist)(searchQuery) });
});
app.post("/api/waitlist", async (req, res) => {
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
    const result = await (0, waitlistEmail_1.sendWaitlistEmail)({ name, email, message });
    return res.status(result.sent ? 201 : 202).json(result);
});
app.post("/api/auth/register", (req, res) => {
    (0, auth_1.registerHandler)(req, res).catch((error) => {
        console.error("register failed", error);
        res.status(500).json({ error: "Could not register user." });
    });
});
app.post("/api/auth/login", (req, res) => {
    (0, auth_1.loginHandler)(req, res).catch((error) => {
        console.error("login failed", error);
        res.status(500).json({ error: "Could not log in." });
    });
});
app.get("/api/auth/me", (req, res) => {
    (0, auth_1.meHandler)(req, res).catch((error) => {
        console.error("auth me failed", error);
        res.status(500).json({ error: "Could not verify session." });
    });
});
app.post("/api/auth/logout", (req, res) => {
    (0, auth_1.logoutHandler)(req, res).catch((error) => {
        console.error("logout failed", error);
        res.status(500).json({ error: "Could not log out." });
    });
});
app.post("/api/route-suggestions", async (req, res) => {
    const { userId = "guest", from, to, moodId, transport = "walking", avoid } = req.body;
    if (!from || !to || !moodId) {
        return res.status(400).json({ error: "from, to and moodId are required." });
    }
    if (!(0, routesEngine_1.getMoodById)(moodId)) {
        return res.status(400).json({ error: "Unknown moodId." });
    }
    if (!allowedTransports.has(transport)) {
        return res.status(400).json({ error: "Unsupported transport mode." });
    }
    let suggestions = (0, routesEngine_1.generateSuggestions)({ from, to, moodId, transport, avoid });
    const googleRoute = await (0, googleRouting_1.getGoogleRoute)({ from, to, transport });
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
    await (0, postgres_1.insertRouteHistory)({
        id: (0, node_crypto_1.randomUUID)(),
        userId,
        from,
        to,
        moodId,
        transport,
        createdAt: new Date().toISOString()
    });
    return res.json({ suggestions });
});
app.get("/api/mood-trend", async (req, res) => {
    const moodId = String(req.query.moodId || "calm");
    const signals = await (0, postgres_1.getRecentMoodSignals)(moodId);
    const routeVolumeBoost = Math.min(12, signals.routes24h * 1.5);
    const feedbackBoost = (signals.avgRating - 3) * 7;
    const baseByMood = { calm: 66, happy: 72, focused: 69, energetic: 75, stressed: 45 };
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
app.get("/api/preferences/:userId", async (req, res) => {
    const preferences = await (0, postgres_1.getPreferences)(req.params.userId);
    res.json({ preferences });
});
app.put("/api/preferences/:userId", async (req, res) => {
    const preferences = await (0, postgres_1.upsertPreferences)(req.params.userId, req.body);
    res.json({ preferences });
});
app.post("/api/feedback", async (req, res) => {
    const { userId = "guest", moodId, rating, comment = "", routeTitle = "", moodMatch, relaxing, tooCrowded } = req.body;
    if (!moodId || typeof rating !== "number") {
        return res.status(400).json({ error: "moodId and numeric rating are required." });
    }
    if (!(0, routesEngine_1.getMoodById)(moodId)) {
        return res.status(400).json({ error: "Unknown moodId." });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "rating must be an integer from 1 to 5." });
    }
    const entry = {
        id: (0, node_crypto_1.randomUUID)(),
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
    await (0, postgres_1.insertFeedback)(entry);
    return res.status(201).json({ feedback: entry });
});
app.get("/api/stats", async (_req, res) => {
    res.json(await (0, postgres_1.getStats)());
});
(0, postgres_1.initializePostgres)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Route Mood backend running on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error("Failed to initialize PostgreSQL", error);
    process.exit(1);
});
