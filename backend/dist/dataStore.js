"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDb = readDb;
exports.writeDb = writeDb;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const dbPath = node_path_1.default.join(__dirname, "..", "data", "db.json");
const defaultDb = {
    preferences: {},
    feedback: [],
    routesHistory: []
};
function ensureDb() {
    if (!node_fs_1.default.existsSync(dbPath)) {
        node_fs_1.default.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
    }
}
function readDb() {
    ensureDb();
    const raw = node_fs_1.default.readFileSync(dbPath, "utf8");
    return JSON.parse(raw);
}
function writeDb(db) {
    node_fs_1.default.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}
