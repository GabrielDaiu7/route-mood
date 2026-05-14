"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = registerHandler;
exports.loginHandler = loginHandler;
exports.meHandler = meHandler;
exports.logoutHandler = logoutHandler;
const node_crypto_1 = require("node:crypto");
const postgres_1 = require("./postgres");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function getBearerToken(req) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
        return "";
    return header.slice("Bearer ".length).trim();
}
async function registerHandler(req, res) {
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
    const existingUser = await (0, postgres_1.getUserByEmail)(email);
    if (existingUser) {
        return res.status(409).json({ error: "This email is already registered." });
    }
    const user = await (0, postgres_1.registerUser)({ id: (0, node_crypto_1.randomUUID)(), name, email, password });
    const token = await (0, postgres_1.createSession)(user.id);
    return res.status(201).json({ user, token });
}
async function loginHandler(req, res) {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required." });
    }
    if (!emailPattern.test(email)) {
        return res.status(400).json({ error: "Enter a valid email address." });
    }
    const user = await (0, postgres_1.loginUser)(email, password);
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = await (0, postgres_1.createSession)(user.id);
    return res.json({ user, token });
}
async function meHandler(req, res) {
    await (0, postgres_1.deleteExpiredSessions)();
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).json({ error: "Missing session token." });
    }
    const user = await (0, postgres_1.getUserBySessionToken)(token);
    if (!user) {
        return res.status(401).json({ error: "Invalid session token." });
    }
    return res.json({ user });
}
async function logoutHandler(req, res) {
    const token = getBearerToken(req);
    if (token) {
        await (0, postgres_1.deleteSession)(token);
    }
    return res.status(204).send();
}
