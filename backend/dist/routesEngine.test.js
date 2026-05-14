"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const routesEngine_1 = require("./routesEngine");
(0, node_test_1.default)("generateSuggestions returns route choices for known Tirana places", () => {
    const suggestions = (0, routesEngine_1.generateSuggestions)({
        from: "Skanderbeg Square, Tirana",
        to: "Grand Park of Tirana, Tirana",
        moodId: "calm",
        transport: "walking"
    });
    strict_1.default.equal(suggestions.length, 3);
    strict_1.default.equal(suggestions[0].routeCoords[0][0] > 41, true);
    strict_1.default.equal(suggestions[0].googleMapsUrl.includes("travelmode=walking"), true);
});
(0, node_test_1.default)("generateSuggestions applies avoid filters", () => {
    const suggestions = (0, routesEngine_1.generateSuggestions)({
        from: "Skanderbeg Square, Tirana",
        to: "Blloku, Tirana",
        moodId: "happy",
        transport: "walking",
        avoid: { crowded: true, noisy: true, highStress: false }
    });
    strict_1.default.equal(suggestions.some((item) => item.tags.includes("crowded")), false);
    strict_1.default.equal(suggestions.some((item) => item.tags.includes("noisy")), false);
});
(0, node_test_1.default)("generateSuggestions rejects unknown moods with no results", () => {
    const suggestions = (0, routesEngine_1.generateSuggestions)({
        from: "Skanderbeg Square, Tirana",
        to: "Blloku, Tirana",
        moodId: "unknown",
        transport: "walking"
    });
    strict_1.default.deepEqual(suggestions, []);
});
(0, node_test_1.default)("generateSuggestions supports romantic mood routes", () => {
    const suggestions = (0, routesEngine_1.generateSuggestions)({
        from: "Skanderbeg Square, Tirana",
        to: "Grand Park of Tirana, Tirana",
        moodId: "romantic",
        transport: "walking"
    });
    strict_1.default.equal(suggestions.length, 3);
    strict_1.default.equal(suggestions[0].title.toLowerCase().includes("romantic"), true);
});
