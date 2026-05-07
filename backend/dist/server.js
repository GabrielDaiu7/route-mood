"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const node_crypto_1 = require("node:crypto");
const dataStore_1 = require("./dataStore");
const moods_1 = __importDefault(require("./moods"));
const routesEngine_1 = require("./routesEngine");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "route-mood-api" });
});
app.get("/api/moods", (_req, res) => {
    res.json({ moods: moods_1.default });
});
app.post("/api/route-suggestions", (req, res) => {
    const { userId = "guest", from, to, moodId, transport = "walking", avoid } = req.body;
    if (!from || !to || !moodId) {
        return res.status(400).json({ error: "from, to and moodId are required." });
    }
    const suggestions = (0, routesEngine_1.generateSuggestions)({ from, to, moodId, transport, avoid });
    const db = (0, dataStore_1.readDb)();
    db.routesHistory.push({
        id: (0, node_crypto_1.randomUUID)(),
        userId,
        from,
        to,
        moodId,
        transport,
        createdAt: new Date().toISOString()
    });
    (0, dataStore_1.writeDb)(db);
    return res.json({ suggestions });
});
app.get("/api/mood-trend", (req, res) => {
    const moodId = String(req.query.moodId || "calm");
    const db = (0, dataStore_1.readDb)();
    const now = Date.now();
    const routes = db.routesHistory
        .filter((item) => item.moodId === moodId)
        .filter((item) => now - new Date(item.createdAt).getTime() <= 24 * 60 * 60 * 1000);
    const recentFeedback = db.feedback
        .filter((item) => item.moodId === moodId)
        .filter((item) => now - new Date(item.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);
    const feedbackAvg = recentFeedback.length > 0
        ? recentFeedback.reduce((sum, item) => sum + item.rating, 0) / recentFeedback.length
        : 3.4;
    const routeVolumeBoost = Math.min(12, routes.length * 1.5);
    const feedbackBoost = (feedbackAvg - 3) * 7;
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
        signals: {
            routes24h: routes.length,
            feedback7d: recentFeedback.length,
            avgRating: Number(feedbackAvg.toFixed(2))
        }
    });
});
app.get("/api/preferences/:userId", (req, res) => {
    const db = (0, dataStore_1.readDb)();
    const preferences = db.preferences[req.params.userId] || {
        favoriteMoods: [],
        defaultTransport: "walking",
        notificationsEnabled: false
    };
    res.json({ preferences });
});
app.put("/api/preferences/:userId", (req, res) => {
    const db = (0, dataStore_1.readDb)();
    const current = db.preferences[req.params.userId] || {
        favoriteMoods: [],
        defaultTransport: "walking",
        notificationsEnabled: false
    };
    db.preferences[req.params.userId] = {
        ...current,
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    (0, dataStore_1.writeDb)(db);
    res.json({ preferences: db.preferences[req.params.userId] });
});
app.post("/api/feedback", (req, res) => {
    const { userId = "guest", moodId, rating, comment = "" } = req.body;
    if (!moodId || typeof rating !== "number") {
        return res.status(400).json({ error: "moodId and numeric rating are required." });
    }
    const db = (0, dataStore_1.readDb)();
    const entry = {
        id: (0, node_crypto_1.randomUUID)(),
        userId,
        moodId,
        rating,
        comment,
        createdAt: new Date().toISOString()
    };
    db.feedback.push(entry);
    (0, dataStore_1.writeDb)(db);
    return res.status(201).json({ feedback: entry });
});
app.get("/api/stats", (_req, res) => {
    const db = (0, dataStore_1.readDb)();
    const activeUsers = new Set([
        ...Object.keys(db.preferences),
        ...db.routesHistory.map((r) => r.userId),
        ...db.feedback.map((f) => f.userId)
    ]).size;
    const moodCounts = db.routesHistory.reduce((acc, route) => {
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
