"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoodById = getMoodById;
exports.generateSuggestions = generateSuggestions;
const moods_1 = __importDefault(require("./moods"));
const tiranaPlaces_1 = require("./tiranaPlaces");
function midpoint(a, b, latOffset = 0, lngOffset = 0) {
    return [((a[0] + b[0]) / 2) + latOffset, ((a[1] + b[1]) / 2) + lngOffset];
}
function routeCoordsBetweenPlaces(fromPlace, toPlace, moodId, routeKind) {
    if (!fromPlace || !toPlace) {
        return routeCoordsForMood(moodId, routeKind);
    }
    const moodBias = {
        calm: [0.0018, -0.0012],
        happy: [0.0011, 0.0015],
        focused: [0.0003, 0.0002],
        energetic: [0.002, 0.0018],
        stressed: [-0.0014, -0.0008]
    };
    const kindBias = {
        balanced: [0.0006, 0.0004],
        scenic: [0.0017, 0.0012],
        fastest: [0.0001, 0.0001]
    };
    const baseMood = moodBias[moodId] || [0.001, 0.001];
    const baseKind = kindBias[routeKind];
    const bendOne = midpoint(fromPlace.coords, toPlace.coords, baseMood[0] + baseKind[0], baseMood[1] + baseKind[1]);
    const bendTwo = midpoint(fromPlace.coords, toPlace.coords, -(baseKind[0] / 2), baseMood[1] - baseKind[1]);
    if (routeKind === "fastest") {
        return [fromPlace.coords, midpoint(fromPlace.coords, toPlace.coords, baseKind[0], baseKind[1]), toPlace.coords];
    }
    if (routeKind === "balanced") {
        return [fromPlace.coords, bendOne, bendTwo, toPlace.coords];
    }
    return [fromPlace.coords, bendOne, midpoint(bendOne, bendTwo, baseKind[0], -baseKind[1]), bendTwo, toPlace.coords];
}
function streetStepsBetweenPlaces(fromPlace, toPlace, variant) {
    if (!fromPlace || !toPlace) {
        return variant.streetSteps;
    }
    const moodLineByKind = {
        balanced: "Follow the mood-balanced city line between the two areas.",
        scenic: "Stay on the more scenic corridor between the two areas.",
        fastest: "Keep to the direct connector for the quickest route."
    };
    return [
        {
            title: `Start on ${fromPlace.street}`,
            detail: `Leave ${fromPlace.name} and head out through ${fromPlace.area}.`,
            icon: "start"
        },
        {
            title: `Continue via ${variant.routeKind === "scenic" ? "Bulevardi Deshmoret e Kombit" : "Bulevardi Bajram Curri"}`,
            detail: moodLineByKind[variant.routeKind],
            icon: "straight"
        },
        {
            title: `Join ${toPlace.street}`,
            detail: `Approach ${toPlace.name} through ${toPlace.area}.`,
            icon: "straight"
        },
        {
            title: `Arrive at ${toPlace.name}`,
            detail: `Finish the route near ${toPlace.street}.`,
            icon: "arrive"
        }
    ];
}
function getMoodById(moodId) {
    return moods_1.default.find((m) => m.id === moodId);
}
function estimateDurationMinutes(transport, moodId) {
    const baseByTransport = {
        walking: 28,
        bike: 18,
        car: 12,
        transit: 22
    };
    const moodDelta = {
        calm: 8,
        happy: 3,
        focused: -2,
        energetic: 0,
        stressed: 10
    };
    const base = baseByTransport[transport] ?? 20;
    return Math.max(8, base + (moodDelta[moodId] ?? 0));
}
function buildGoogleMapsLink(from, to, transport) {
    const modeByTransport = {
        walking: "walking",
        bike: "bicycling",
        car: "driving",
        transit: "transit"
    };
    const mode = modeByTransport[transport] ?? "driving";
    const origin = encodeURIComponent(from);
    const destination = encodeURIComponent(to);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}`;
}
function routeCoordsForMood(moodId, routeKind) {
    const seeds = {
        calm: {
            balanced: [[41.332, 19.807], [41.329, 19.812], [41.323, 19.819], [41.318, 19.826]],
            scenic: [[41.336, 19.801], [41.333, 19.81], [41.327, 19.818], [41.32, 19.823], [41.314, 19.828]],
            fastest: [[41.331, 19.814], [41.324, 19.82], [41.317, 19.824]]
        },
        happy: {
            balanced: [[41.335, 19.814], [41.331, 19.821], [41.324, 19.833], [41.315, 19.818]],
            scenic: [[41.338, 19.809], [41.334, 19.818], [41.329, 19.829], [41.321, 19.835], [41.314, 19.824]],
            fastest: [[41.333, 19.818], [41.326, 19.825], [41.319, 19.821]]
        },
        focused: {
            balanced: [[41.329, 19.842], [41.325, 19.839], [41.319, 19.836], [41.312, 19.821]],
            scenic: [[41.333, 19.846], [41.328, 19.842], [41.322, 19.838], [41.315, 19.831], [41.31, 19.824]],
            fastest: [[41.328, 19.844], [41.321, 19.838], [41.314, 19.829]]
        },
        energetic: {
            balanced: [[41.339, 19.825], [41.334, 19.833], [41.326, 19.848], [41.314, 19.834]],
            scenic: [[41.342, 19.819], [41.338, 19.829], [41.332, 19.841], [41.323, 19.848], [41.314, 19.839]],
            fastest: [[41.337, 19.827], [41.329, 19.838], [41.319, 19.836]]
        },
        stressed: {
            balanced: [[41.333, 19.836], [41.329, 19.828], [41.322, 19.819], [41.313, 19.813]],
            scenic: [[41.336, 19.832], [41.332, 19.824], [41.326, 19.816], [41.319, 19.812], [41.312, 19.809]],
            fastest: [[41.332, 19.834], [41.324, 19.823], [41.315, 19.816]]
        }
    };
    return seeds[moodId]?.[routeKind] || seeds.calm.balanced;
}
function routeVariantsForMood(moodId, moodLabel, routeStyle) {
    const variants = {
        calm: [
            {
                id: "parkline-calm",
                title: "Parkline Calm Route",
                description: `A quieter route shaped around ${routeStyle}.`,
                routeKind: "balanced",
                confidence: 0.88,
                tags: ["mood-match", "green-corridor"],
                streetSteps: [
                    { title: "Start on Sheshi Skenderbej", detail: "Leave the square and head toward Rruga e Barrikadave.", icon: "start" },
                    { title: "Continue on Rruga e Barrikadave", detail: "Stay on the calmer section and pass toward the park edge.", icon: "straight" },
                    { title: "Bear onto Rruga Ibrahim Rugova", detail: "Keep a steady pace through the quieter corridor near Blloku.", icon: "straight" },
                    { title: "Arrive near Bulevardi Bajram Curri", detail: "Finish the route by joining the final approach into the destination area.", icon: "arrive" }
                ]
            },
            {
                id: "waterside-calm",
                title: "Waterside Calm Drift",
                description: "A softer scenic path designed to reduce stimulation.",
                routeKind: "scenic",
                confidence: 0.82,
                tags: ["scenic", "comfort"],
                streetSteps: [
                    { title: "Start on Rruga Mine Peza", detail: "Join the route gently and move east toward the river corridor.", icon: "start" },
                    { title: "Follow Rruga George W. Bush", detail: "Stay on the broader scenic segment with fewer sharp turns.", icon: "straight" },
                    { title: "Continue to Rruga Ismail Qemali", detail: "Keep following the calmer spine into the central district.", icon: "straight" },
                    { title: "Arrive near Rruga Abdyl Frasheri", detail: "Use the final short segment into the destination zone.", icon: "arrive" }
                ]
            },
            {
                id: "steady-calm",
                title: "Steady Calm Shortcut",
                description: "A direct route with fewer decision points and smoother turns.",
                routeKind: "fastest",
                confidence: 0.79,
                tags: ["efficient", "low-complexity"],
                streetSteps: [
                    { title: "Start on Rruga Ded Gjo Luli", detail: "Head out directly from the center and avoid side turns.", icon: "start" },
                    { title: "Continue on Rruga Myslym Shyri", detail: "Stay straight for the quickest mid-section of the route.", icon: "straight" },
                    { title: "Arrive via Rruga Sami Frasheri", detail: "Use the final connector into the destination block.", icon: "arrive" }
                ]
            }
        ],
        happy: [
            {
                id: "boulevard-happy",
                title: "Boulevard Happy Route",
                description: `A social route tuned for ${routeStyle}.`,
                routeKind: "balanced",
                confidence: 0.86,
                tags: ["mood-match", "crowded"],
                streetSteps: [
                    { title: "Start on Rruga 28 Nentori", detail: "Join the lively city stretch and head toward the central boulevard.", icon: "start" },
                    { title: "Continue on Bulevardi Deshmoret e Kombit", detail: "Stay on the busier boulevard with stronger city energy.", icon: "straight" },
                    { title: "Turn onto Rruga Pjeter Bogdani", detail: "Move into the more social streets around Blloku.", icon: "straight" },
                    { title: "Arrive near Rruga Brigada VIII", detail: "Finish inside the destination district.", icon: "arrive" }
                ]
            },
            {
                id: "landmark-happy",
                title: "Landmark Happy Loop",
                description: "A lively scenic route through brighter, more animated streets.",
                routeKind: "scenic",
                confidence: 0.84,
                tags: ["scenic", "comfort", "noisy"],
                streetSteps: [
                    { title: "Start on Rruga e Durresit", detail: "Head into the city and follow the route toward the more animated core.", icon: "start" },
                    { title: "Continue on Rruga Murat Toptani", detail: "Pass the landmark corridor and keep the scenic line.", icon: "straight" },
                    { title: "Follow Rruga Papa Gjon Pali II", detail: "Stay on the open civic stretch before turning west.", icon: "straight" },
                    { title: "Arrive via Rruga Ismail Qemali", detail: "Enter the final block on one of the livelier connectors.", icon: "arrive" }
                ]
            },
            {
                id: "spark-happy",
                title: "Spark Happy Express",
                description: "A quicker line that keeps the trip upbeat and energetic.",
                routeKind: "fastest",
                confidence: 0.8,
                tags: ["efficient", "urban"],
                streetSteps: [
                    { title: "Start on Rruga Myslym Shyri", detail: "Use the direct commercial corridor out of the center.", icon: "start" },
                    { title: "Continue to Rruga Sami Frasheri", detail: "Keep moving through the straight urban segment.", icon: "straight" },
                    { title: "Arrive via Rruga Abdyl Frasheri", detail: "Finish on the short final connector.", icon: "arrive" }
                ]
            }
        ],
        focused: [
            {
                id: "grid-focused",
                title: "Grid Focus Route",
                description: `A clean route optimized for ${routeStyle}.`,
                routeKind: "balanced",
                confidence: 0.9,
                tags: ["mood-match", "predictable"],
                streetSteps: [
                    { title: "Start on Rruga Elbasanit", detail: "Leave the origin on a predictable main corridor.", icon: "start" },
                    { title: "Continue on Bulevardi Bajram Curri", detail: "Stay on the long straight segment with fewer interruptions.", icon: "straight" },
                    { title: "Follow Rruga Ibrahim Rugova", detail: "Keep the route disciplined and direct into the destination zone.", icon: "straight" },
                    { title: "Arrive near Rruga Sami Frasheri", detail: "Use the final controlled turn into the endpoint.", icon: "arrive" }
                ]
            },
            {
                id: "clarity-focused",
                title: "Clarity Focus Corridor",
                description: "A scenic option with long straight segments and less interruption.",
                routeKind: "scenic",
                confidence: 0.8,
                tags: ["scenic", "structured"],
                streetSteps: [
                    { title: "Start on Rruga Faik Konica", detail: "Begin on the eastern side and join the straighter civic corridor.", icon: "start" },
                    { title: "Continue on Rruga Papa Gjon Pali II", detail: "Stay focused through the open boulevard section.", icon: "straight" },
                    { title: "Follow Rruga Ismail Qemali", detail: "Maintain direction through the longer structured segment.", icon: "straight" },
                    { title: "Arrive via Rruga Vaso Pasha", detail: "Finish the trip with a short final approach.", icon: "arrive" }
                ]
            },
            {
                id: "direct-focused",
                title: "Direct Focus Sprint",
                description: "The fastest route with minimal detours and sharper ETA control.",
                routeKind: "fastest",
                confidence: 0.87,
                tags: ["efficient", "eta-first"],
                streetSteps: [
                    { title: "Start on Rruga e Elbasanit", detail: "Take the most direct exit from the origin area.", icon: "start" },
                    { title: "Continue on Rruga George W. Bush", detail: "Hold the central straight-line segment.", icon: "straight" },
                    { title: "Arrive via Rruga Myslym Shyri", detail: "Use the last quick connector into the destination.", icon: "arrive" }
                ]
            }
        ],
        energetic: [
            {
                id: "pulse-energetic",
                title: "Pulse Energy Route",
                description: `An active route built for ${routeStyle}.`,
                routeKind: "balanced",
                confidence: 0.87,
                tags: ["mood-match", "dynamic"],
                streetSteps: [
                    { title: "Start on Rruga e Kavajes", detail: "Join the route on a faster-moving city street.", icon: "start" },
                    { title: "Continue on Bulevardi Bajram Curri", detail: "Stay with the energetic corridor and keep momentum.", icon: "straight" },
                    { title: "Push onto Rruga Ibrahim Rugova", detail: "Follow the route into the more active destination district.", icon: "straight" },
                    { title: "Arrive near Rruga Nikolla Tupe", detail: "Finish with a final short move into the endpoint.", icon: "arrive" }
                ]
            },
            {
                id: "summit-energetic",
                title: "Summit Energy Ride",
                description: "A more dramatic scenic path with stronger movement and visual rhythm.",
                routeKind: "scenic",
                confidence: 0.83,
                tags: ["scenic", "noisy", "comfort"],
                streetSteps: [
                    { title: "Start on Rruga Dervish Hima", detail: "Begin on the eastern edge and head into the city curve.", icon: "start" },
                    { title: "Continue on Rruga Gramoz Pashko", detail: "Keep moving through the higher-energy scenic section.", icon: "straight" },
                    { title: "Follow Rruga Jul Variboba", detail: "Stay on the route as it swings through the active district.", icon: "straight" },
                    { title: "Arrive via Rruga Komuna e Parisit", detail: "Use the final approach to reach the destination area.", icon: "arrive" }
                ]
            },
            {
                id: "drive-energetic",
                title: "Drive Energy Dash",
                description: "A high-tempo shortcut that keeps momentum up from start to finish.",
                routeKind: "fastest",
                confidence: 0.81,
                tags: ["efficient", "fast-lane"],
                streetSteps: [
                    { title: "Start on Rruga e Kavajes", detail: "Take the direct fast-moving departure line.", icon: "start" },
                    { title: "Continue on Rruga Sulejman Delvina", detail: "Keep pace through the shortest middle section.", icon: "straight" },
                    { title: "Arrive via Rruga Sami Frasheri", detail: "Finish on the last direct connector.", icon: "arrive" }
                ]
            }
        ],
        stressed: [
            {
                id: "shelter-stressed",
                title: "Shelter Relief Route",
                description: `A gentler path chosen for ${routeStyle}.`,
                routeKind: "balanced",
                confidence: 0.89,
                tags: ["mood-match", "quiet"],
                streetSteps: [
                    { title: "Start on Rruga e Barrikadave", detail: "Leave the origin on a calmer feeder street.", icon: "start" },
                    { title: "Continue on Rruga Hoxha Tahsim", detail: "Stay on the quieter section and avoid busier connectors.", icon: "straight" },
                    { title: "Follow Rruga Qemal Stafa", detail: "Keep the route soft and low-pressure into the destination side.", icon: "straight" },
                    { title: "Arrive near Rruga Tefta Tashko-Koco", detail: "Complete the trip on the final quiet approach.", icon: "arrive" }
                ]
            },
            {
                id: "breather-stressed",
                title: "Breather Scenic Route",
                description: "A slower route that avoids pressure points and crowded stretches.",
                routeKind: "scenic",
                confidence: 0.8,
                tags: ["scenic", "comfort"],
                streetSteps: [
                    { title: "Start on Rruga Luigj Gurakuqi", detail: "Begin on a calmer segment away from the busiest turns.", icon: "start" },
                    { title: "Continue on Rruga Fortuzi", detail: "Stay on the lower-pressure scenic corridor.", icon: "straight" },
                    { title: "Follow Rruga Reshit Petrela", detail: "Keep moving on the softer outer connector.", icon: "straight" },
                    { title: "Arrive via Rruga Hoxha Tahsim", detail: "Use the short final section into the destination.", icon: "arrive" }
                ]
            },
            {
                id: "relief-stressed",
                title: "Relief Direct Route",
                description: "A shorter route designed to finish the trip without adding friction.",
                routeKind: "fastest",
                confidence: 0.78,
                tags: ["efficient", "low-stress"],
                streetSteps: [
                    { title: "Start on Rruga e Dibres", detail: "Take the shortest clean exit from the origin area.", icon: "start" },
                    { title: "Continue on Rruga Bardhyl", detail: "Stay on the direct segment with fewer interruptions.", icon: "straight" },
                    { title: "Arrive via Rruga Aleksander Moisiu", detail: "Complete the route on the final direct stretch.", icon: "arrive" }
                ]
            }
        ]
    };
    return variants[moodId] || [
        {
            id: `${moodId}-balanced`,
            title: `${moodLabel} Balanced Route`,
            description: `A route optimized for ${routeStyle}.`,
            routeKind: "balanced",
            confidence: 0.85,
            tags: ["mood-match"],
            streetSteps: [
                { title: "Start route", detail: "Join the balanced route from the origin area.", icon: "start" },
                { title: "Continue forward", detail: "Stay on the central route corridor.", icon: "straight" },
                { title: "Arrive", detail: "Finish inside the destination area.", icon: "arrive" }
            ]
        },
        {
            id: `${moodId}-scenic`,
            title: `${moodLabel} Scenic Route`,
            description: "A scenic option with more atmosphere and comfort.",
            routeKind: "scenic",
            confidence: 0.8,
            tags: ["scenic"],
            streetSteps: [
                { title: "Start route", detail: "Join the scenic route from the origin area.", icon: "start" },
                { title: "Continue through the scenic corridor", detail: "Stay on the softer, more atmospheric path.", icon: "straight" },
                { title: "Arrive", detail: "Finish inside the destination area.", icon: "arrive" }
            ]
        },
        {
            id: `${moodId}-fastest`,
            title: `${moodLabel} Fast Route`,
            description: "A quicker option with a stronger ETA focus.",
            routeKind: "fastest",
            confidence: 0.8,
            tags: ["efficient"],
            streetSteps: [
                { title: "Start route", detail: "Join the direct route from the origin area.", icon: "start" },
                { title: "Continue on the direct line", detail: "Hold the shortest path toward the destination.", icon: "straight" },
                { title: "Arrive", detail: "Finish inside the destination area.", icon: "arrive" }
            ]
        }
    ];
}
function generateSuggestions({ from, to, moodId, transport, avoid }) {
    const mood = getMoodById(moodId);
    if (!mood)
        return [];
    const fromPlace = (0, tiranaPlaces_1.getTiranaPlace)(from);
    const toPlace = (0, tiranaPlaces_1.getTiranaPlace)(to);
    const firstDuration = estimateDurationMinutes(transport, moodId);
    const secondDuration = firstDuration + 5;
    const thirdDuration = Math.max(10, firstDuration - 3);
    const durationByKind = {
        balanced: firstDuration,
        scenic: secondDuration,
        fastest: thirdDuration
    };
    const stressByKind = {
        balanced: moodId === "stressed" ? 2 : 4,
        scenic: 3,
        fastest: moodId === "focused" ? 4 : 5
    };
    const suggestions = routeVariantsForMood(moodId, mood.label, mood.routeStyle).map((variant) => ({
        id: variant.id,
        title: variant.title,
        description: variant.description,
        etaMinutes: durationByKind[variant.routeKind],
        stressScore: stressByKind[variant.routeKind],
        confidence: variant.confidence,
        routeCoords: routeCoordsBetweenPlaces(fromPlace, toPlace, moodId, variant.routeKind),
        streetSteps: streetStepsBetweenPlaces(fromPlace, toPlace, variant),
        routeKind: variant.routeKind,
        tags: variant.tags,
        googleMapsUrl: buildGoogleMapsLink(from, to, transport)
    }));
    const avoidZones = avoid || {};
    return suggestions.filter((item) => {
        if (avoidZones.highStress && item.stressScore > 3)
            return false;
        if (avoidZones.crowded && item.tags.includes("crowded"))
            return false;
        if (avoidZones.noisy && item.tags.includes("noisy"))
            return false;
        return true;
    });
}
