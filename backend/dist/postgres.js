"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initializePostgres = initializePostgres;
exports.registerUser = registerUser;
exports.createSession = createSession;
exports.loginUser = loginUser;
exports.getUserByEmail = getUserByEmail;
exports.getUserBySessionToken = getUserBySessionToken;
exports.deleteSession = deleteSession;
exports.deleteExpiredSessions = deleteExpiredSessions;
exports.insertRouteHistory = insertRouteHistory;
exports.getRecentMoodSignals = getRecentMoodSignals;
exports.getPreferences = getPreferences;
exports.upsertPreferences = upsertPreferences;
exports.insertFeedback = insertFeedback;
exports.getStats = getStats;
require("dotenv/config");
const node_crypto_1 = require("node:crypto");
const pg_1 = require("pg");
function readEnvString(key) {
    const value = process.env[key];
    if (typeof value === "string")
        return value;
    if (value == null)
        return undefined;
    return String(value);
}
const pgHost = readEnvString("PGHOST") || "127.0.0.1";
const pgPort = Number(readEnvString("PGPORT") || 5432);
const pgUser = readEnvString("PGUSER") || "postgres";
const pgPassword = readEnvString("PGPASSWORD");
const pgDatabase = readEnvString("PGDATABASE") || "route_mood";
const sessionTtlHours = Number(readEnvString("SESSION_TTL_HOURS") || 24);
const adminEmail = (readEnvString("ADMIN_EMAIL") || "admin@routemood.local").trim().toLowerCase();
const adminPassword = readEnvString("ADMIN_PASSWORD") || "RouteMoodAdmin123!";
if (!Number.isFinite(pgPort)) {
    throw new Error(`Invalid PGPORT value "${String(process.env.PGPORT)}". Expected a number.`);
}
if (typeof pgPassword !== "string" || pgPassword.trim() === "") {
    throw new Error("Invalid PGPASSWORD: set a non-empty PostgreSQL password string in backend/.env.");
}
if (!Number.isFinite(sessionTtlHours) || sessionTtlHours <= 0) {
    throw new Error(`Invalid SESSION_TTL_HOURS value "${String(process.env.SESSION_TTL_HOURS)}". Expected a positive number.`);
}
const pool = new pg_1.Pool({
    host: pgHost,
    port: pgPort,
    user: pgUser,
    password: pgPassword,
    database: pgDatabase
});
exports.pool = pool;
async function ensureDatabaseExists() {
    try {
        await pool.query("SELECT 1;");
        return;
    }
    catch (error) {
        if (error?.code !== "3D000")
            throw error;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(pgDatabase)) {
        throw new Error(`Refusing to auto-create database with unsafe name "${pgDatabase}".`);
    }
    const adminPool = new pg_1.Pool({
        host: pgHost,
        port: pgPort,
        user: pgUser,
        password: pgPassword,
        database: "postgres"
    });
    try {
        await adminPool.query(`CREATE DATABASE "${pgDatabase}";`);
    }
    catch (error) {
        if (error?.code !== "42P04")
            throw error;
    }
    finally {
        await adminPool.end();
    }
}
function hashPassword(password, salt = (0, node_crypto_1.randomBytes)(16).toString("hex")) {
    const derived = (0, node_crypto_1.scryptSync)(password, salt, 64).toString("hex");
    return `${salt}:${derived}`;
}
function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash)
        return false;
    const derivedBuffer = (0, node_crypto_1.scryptSync)(password, salt, 64);
    const hashBuffer = Buffer.from(hash, "hex");
    if (derivedBuffer.length !== hashBuffer.length)
        return false;
    return (0, node_crypto_1.timingSafeEqual)(derivedBuffer, hashBuffer);
}
async function initializePostgres() {
    await ensureDatabaseExists();
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';");
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'admin')
      ON CONFLICT (email) DO UPDATE
      SET role = 'admin',
          name = EXCLUDED.name,
          password_hash = EXCLUDED.password_hash;
    `, [(0, node_crypto_1.randomUUID)(), "Route Mood Admin", adminEmail, hashPassword(adminPassword)]);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
    );
  `);
    await pool.query(`
    ALTER TABLE auth_sessions
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours';
  `);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS preferences (
      user_id TEXT PRIMARY KEY,
      favorite_moods TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      default_transport TEXT NOT NULL DEFAULT 'walking',
      notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      preferred_music_style TEXT NOT NULL DEFAULT '',
      avoid_crowded BOOLEAN NOT NULL DEFAULT FALSE,
      avoid_noisy BOOLEAN NOT NULL DEFAULT FALSE,
      avoid_high_stress BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
    await pool.query("ALTER TABLE preferences ADD COLUMN IF NOT EXISTS preferred_music_style TEXT NOT NULL DEFAULT ''; ");
    await pool.query("ALTER TABLE preferences ADD COLUMN IF NOT EXISTS avoid_crowded BOOLEAN NOT NULL DEFAULT FALSE; ");
    await pool.query("ALTER TABLE preferences ADD COLUMN IF NOT EXISTS avoid_noisy BOOLEAN NOT NULL DEFAULT FALSE; ");
    await pool.query("ALTER TABLE preferences ADD COLUMN IF NOT EXISTS avoid_high_stress BOOLEAN NOT NULL DEFAULT FALSE; ");
    await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id UUID PRIMARY KEY,
      user_id TEXT NOT NULL,
      mood_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL DEFAULT '',
      route_title TEXT NOT NULL DEFAULT '',
      mood_match BOOLEAN,
      relaxing BOOLEAN,
      too_crowded BOOLEAN,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
    await pool.query("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS route_title TEXT NOT NULL DEFAULT ''; ");
    await pool.query("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS mood_match BOOLEAN; ");
    await pool.query("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS relaxing BOOLEAN; ");
    await pool.query("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS too_crowded BOOLEAN; ");
    await pool.query(`
    CREATE TABLE IF NOT EXISTS routes_history (
      id UUID PRIMARY KEY,
      user_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      mood_id TEXT NOT NULL,
      transport TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
async function registerUser(input) {
    const result = await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'user')
      RETURNING id, name, email, role;
    `, [input.id, input.name, input.email, hashPassword(input.password)]);
    return result.rows[0];
}
async function createSession(userId) {
    const token = (0, node_crypto_1.randomBytes)(32).toString("hex");
    const expiresAt = new Date(Date.now() + sessionTtlHours * 60 * 60 * 1000);
    await pool.query(`
      INSERT INTO auth_sessions (token, user_id, expires_at)
      VALUES ($1, $2, $3);
    `, [token, userId, expiresAt.toISOString()]);
    return token;
}
async function loginUser(email, password) {
    const result = await pool.query(`
      SELECT id, name, email, role, password_hash
      FROM users
      WHERE email = $1;
    `, [email]);
    const user = result.rows[0];
    if (!user)
        return null;
    if (!verifyPassword(password, user.password_hash))
        return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
}
async function getUserByEmail(email) {
    const result = await pool.query(`
      SELECT id, name, email, role
      FROM users
      WHERE email = $1;
    `, [email]);
    return result.rows[0] || null;
}
async function getUserBySessionToken(token) {
    const result = await pool.query(`
      SELECT users.id, users.name, users.email, users.role
      FROM auth_sessions
      JOIN users ON users.id = auth_sessions.user_id
      WHERE auth_sessions.token = $1
      AND auth_sessions.expires_at > NOW();
    `, [token]);
    return result.rows[0] || null;
}
async function deleteSession(token) {
    await pool.query("DELETE FROM auth_sessions WHERE token = $1;", [token]);
}
async function deleteExpiredSessions() {
    await pool.query("DELETE FROM auth_sessions WHERE expires_at <= NOW();");
}
async function insertRouteHistory(entry) {
    await pool.query(`
      INSERT INTO routes_history (id, user_id, origin, destination, mood_id, transport, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [entry.id, entry.userId, entry.from, entry.to, entry.moodId, entry.transport, entry.createdAt]);
}
async function getRecentMoodSignals(moodId) {
    const routeResult = await pool.query(`
      SELECT COUNT(*)::TEXT AS count
      FROM routes_history
      WHERE mood_id = $1
      AND created_at >= NOW() - INTERVAL '24 hours';
    `, [moodId]);
    const feedbackResult = await pool.query(`
      SELECT COUNT(*)::TEXT AS count, AVG(rating)::TEXT AS avg_rating
      FROM feedback
      WHERE mood_id = $1
      AND created_at >= NOW() - INTERVAL '7 days';
    `, [moodId]);
    return {
        routes24h: Number(routeResult.rows[0]?.count || 0),
        feedback7d: Number(feedbackResult.rows[0]?.count || 0),
        avgRating: Number(feedbackResult.rows[0]?.avg_rating || 3.4)
    };
}
async function getPreferences(userId) {
    const result = await pool.query(`
      SELECT favorite_moods, default_transport, notifications_enabled, preferred_music_style, avoid_crowded, avoid_noisy, avoid_high_stress, updated_at
      FROM preferences
      WHERE user_id = $1;
    `, [userId]);
    const row = result.rows[0];
    if (!row) {
        return {
            favoriteMoods: [],
            defaultTransport: "walking",
            notificationsEnabled: false,
            preferredMusicStyle: "",
            avoidCrowded: false,
            avoidNoisy: false,
            avoidHighStress: false
        };
    }
    return {
        favoriteMoods: row.favorite_moods,
        defaultTransport: row.default_transport,
        notificationsEnabled: row.notifications_enabled,
        preferredMusicStyle: row.preferred_music_style,
        avoidCrowded: row.avoid_crowded,
        avoidNoisy: row.avoid_noisy,
        avoidHighStress: row.avoid_high_stress,
        updatedAt: row.updated_at.toISOString()
    };
}
async function upsertPreferences(userId, updates) {
    const current = await getPreferences(userId);
    const next = {
        favoriteMoods: Array.isArray(updates.favoriteMoods) ? updates.favoriteMoods : current.favoriteMoods,
        defaultTransport: updates.defaultTransport || current.defaultTransport,
        notificationsEnabled: typeof updates.notificationsEnabled === "boolean" ? updates.notificationsEnabled : current.notificationsEnabled,
        preferredMusicStyle: typeof updates.preferredMusicStyle === "string" ? updates.preferredMusicStyle : current.preferredMusicStyle,
        avoidCrowded: typeof updates.avoidCrowded === "boolean" ? updates.avoidCrowded : current.avoidCrowded,
        avoidNoisy: typeof updates.avoidNoisy === "boolean" ? updates.avoidNoisy : current.avoidNoisy,
        avoidHighStress: typeof updates.avoidHighStress === "boolean" ? updates.avoidHighStress : current.avoidHighStress,
        updatedAt: new Date().toISOString()
    };
    await pool.query(`
      INSERT INTO preferences (user_id, favorite_moods, default_transport, notifications_enabled, preferred_music_style, avoid_crowded, avoid_noisy, avoid_high_stress, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE
      SET favorite_moods = EXCLUDED.favorite_moods,
          default_transport = EXCLUDED.default_transport,
          notifications_enabled = EXCLUDED.notifications_enabled,
          preferred_music_style = EXCLUDED.preferred_music_style,
          avoid_crowded = EXCLUDED.avoid_crowded,
          avoid_noisy = EXCLUDED.avoid_noisy,
          avoid_high_stress = EXCLUDED.avoid_high_stress,
          updated_at = EXCLUDED.updated_at;
    `, [
        userId,
        next.favoriteMoods,
        next.defaultTransport,
        next.notificationsEnabled,
        next.preferredMusicStyle,
        next.avoidCrowded,
        next.avoidNoisy,
        next.avoidHighStress,
        next.updatedAt
    ]);
    return next;
}
async function insertFeedback(entry) {
    await pool.query(`
      INSERT INTO feedback (id, user_id, mood_id, rating, comment, route_title, mood_match, relaxing, too_crowded, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
    `, [
        entry.id,
        entry.userId,
        entry.moodId,
        entry.rating,
        entry.comment,
        entry.routeTitle || "",
        entry.moodMatch ?? null,
        entry.relaxing ?? null,
        entry.tooCrowded ?? null,
        entry.createdAt
    ]);
}
async function getStats() {
    const [activeUsersResult, feedbackResult, routesResult, moodCountsResult, topRoutesResult, recentFeedbackResult] = await Promise.all([
        pool.query(`
        SELECT COUNT(DISTINCT user_id)::TEXT AS count
        FROM (
          SELECT user_id FROM preferences
          UNION
          SELECT user_id FROM feedback
          UNION
          SELECT user_id FROM routes_history
        ) combined;
      `),
        pool.query("SELECT COUNT(*)::TEXT AS count, AVG(rating)::TEXT AS avg_rating FROM feedback;"),
        pool.query("SELECT COUNT(*)::TEXT AS count FROM routes_history;"),
        pool.query(`
        SELECT mood_id, COUNT(*)::TEXT AS count
        FROM routes_history
        GROUP BY mood_id;
      `),
        pool.query(`
        SELECT COALESCE(NULLIF(route_title, ''), mood_id || ' route') AS route_title, mood_id, AVG(rating)::TEXT AS avg_rating, COUNT(*)::TEXT AS count
        FROM feedback
        GROUP BY COALESCE(NULLIF(route_title, ''), mood_id || ' route'), mood_id
        HAVING AVG(rating) >= 4
        ORDER BY AVG(rating) DESC, COUNT(*) DESC
        LIMIT 6;
      `),
        pool.query(`
        SELECT mood_id, rating, comment, route_title, created_at
        FROM feedback
        ORDER BY created_at DESC
        LIMIT 8;
      `)
    ]);
    return {
        activeUsers: Number(activeUsersResult.rows[0]?.count || 0),
        totalFeedback: Number(feedbackResult.rows[0]?.count || 0),
        avgSatisfaction: Number(Number(feedbackResult.rows[0]?.avg_rating || 0).toFixed(2)),
        totalRoutesGenerated: Number(routesResult.rows[0]?.count || 0),
        moodCounts: moodCountsResult.rows.reduce((acc, row) => {
            acc[row.mood_id] = Number(row.count);
            return acc;
        }, {}),
        topPositiveRoutes: topRoutesResult.rows.map((row) => ({
            routeTitle: row.route_title,
            moodId: row.mood_id,
            avgRating: Number(Number(row.avg_rating).toFixed(2)),
            count: Number(row.count)
        })),
        recentFeedback: recentFeedbackResult.rows.map((row) => ({
            moodId: row.mood_id,
            rating: row.rating,
            comment: row.comment,
            routeTitle: row.route_title,
            createdAt: row.created_at.toISOString()
        }))
    };
}
