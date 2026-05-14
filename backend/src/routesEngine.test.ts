import test from "node:test";
import assert from "node:assert/strict";
import { generateSuggestions } from "./routesEngine";

test("generateSuggestions returns route choices for known Tirana places", () => {
  const suggestions = generateSuggestions({
    from: "Skanderbeg Square, Tirana",
    to: "Grand Park of Tirana, Tirana",
    moodId: "calm",
    transport: "walking"
  });

  assert.equal(suggestions.length, 3);
  assert.equal(suggestions[0].routeCoords[0][0] > 41, true);
  assert.equal(suggestions[0].googleMapsUrl.includes("travelmode=walking"), true);
});

test("generateSuggestions applies avoid filters", () => {
  const suggestions = generateSuggestions({
    from: "Skanderbeg Square, Tirana",
    to: "Blloku, Tirana",
    moodId: "happy",
    transport: "walking",
    avoid: { crowded: true, noisy: true, highStress: false }
  });

  assert.equal(suggestions.some((item) => item.tags.includes("crowded")), false);
  assert.equal(suggestions.some((item) => item.tags.includes("noisy")), false);
});

test("generateSuggestions rejects unknown moods with no results", () => {
  const suggestions = generateSuggestions({
    from: "Skanderbeg Square, Tirana",
    to: "Blloku, Tirana",
    moodId: "unknown",
    transport: "walking"
  });

  assert.deepEqual(suggestions, []);
});

test("generateSuggestions supports romantic mood routes", () => {
  const suggestions = generateSuggestions({
    from: "Skanderbeg Square, Tirana",
    to: "Grand Park of Tirana, Tirana",
    moodId: "romantic",
    transport: "walking"
  });

  assert.equal(suggestions.length, 3);
  assert.equal(suggestions[0].title.toLowerCase().includes("romantic"), true);
});
