import { useEffect, useMemo, useRef, useState } from "react";
import HomePage from "./components/HomePage";
import SignalDisclosure from "./components/SignalDisclosure";
import SiteNav from "./components/SiteNav";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const USER_ID = "website-demo";
const DEFAULT_PAIR = {
  from: "Skanderbeg Square, Tirana",
  to: "Grand Park of Tirana, Tirana",
  mood: "calm",
  transport: "walking"
};
const MAP_STYLES = {
  street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
};
const PROTECTED_PAGES = new Set(["map"]);
const moodThemes = {
  calm: { "--mood-soft": "#e4f6f2", "--mood-accent": "#0f9f89" },
  energetic: { "--mood-soft": "#ffe8ef", "--mood-accent": "#ef476f" },
  romantic: { "--mood-soft": "#fde7f1", "--mood-accent": "#d9468f" },
  stressed: { "--mood-soft": "#e8f4fb", "--mood-accent": "#1877b9" },
  happy: { "--mood-soft": "#fff3c7", "--mood-accent": "#c58b18" }
};

const trustStats = [
  {
    value: "100%",
    label: "Private by default",
    detail: "Your mood and route history stay on this device unless you choose to share."
  },
  {
    value: "24h",
    label: "Mood-aware planning",
    detail: "Route suggestions adapt to your current feeling, not just the destination."
  },
  {
    value: "Local",
    label: "Personal preferences",
    detail: "Save favorite moods, transport choices, and routes you want to use again."
  },
  {
    value: "Crowd Safe",
    label: "Safer shared signals",
    detail: "Crowd mood insights appear only when enough people contribute data."
  }
];

const pillars = [
  {
    title: "Privacy-first Architecture",
    body: "Route Mood protects people first. Locations are generalized, identities are abstracted, and sensitive mood signals are short-lived by design."
  },
  {
    title: "Live Emotional Signals",
    body: "See what an area feels like right now, not last week. Route Mood updates emotional trends continuously so decisions stay relevant."
  },
  {
    title: "Spatial Intelligence",
    body: "From city-wide context to neighborhood-level nuance, Route Mood layers mood and mobility data so routes feel both efficient and human."
  },
  {
    title: "Matching Engine",
    body: "Recommendations balance mood alignment, transport choices, destination intent, and pace so every trip feels tailored."
  }
];

const featuresAlb = [
  "User mood selection",
  "Personalized route suggestions",
  "Adaptive design based on mood",
  "Companion music by emotional state",
  "Saved preferences",
  "User feedback and ratings"
];

const fallbackMoods = [
  { id: "calm", label: "Calm", color: "#56d5b8", musicKeywords: "lofi chill ambient", routeStyle: "Qete dhe pa trafik" },
  { id: "stressed", label: "Stressed", color: "#8ecae6", musicKeywords: "meditation anti stress", routeStyle: "Rruge te qeta dhe relaksuese" },
  { id: "energetic", label: "Energetic", color: "#ef476f", musicKeywords: "energetic edm workout", routeStyle: "Skenike dhe dinamike" },
  { id: "romantic", label: "Romantic", color: "#d9468f", musicKeywords: "romantic acoustic chill", routeStyle: "Rruge panoramike dhe te ngrohta" },
  { id: "happy", label: "Happy / Positive", color: "#ffd166", musicKeywords: "happy upbeat pop", routeStyle: "Rruge te gjalla me energji" }
];

const tiranaPlaceGroups = [
  {
    label: "Squares and Landmarks",
    places: [
      "Skanderbeg Square, Tirana",
      "Mother Teresa Square, Tirana",
      "Air Albania Stadium, Tirana",
      "Toptani Shopping Center, Tirana",
      "Clock Tower of Tirana, Tirana",
      "Et'hem Bey Mosque, Tirana",
      "Pyramid of Tirana, Tirana"
    ]
  },
  {
    label: "Neighborhoods",
    places: [
      "Blloku, Tirana",
      "Pazari i Ri, Tirana",
      "Komuna e Parisit, Tirana",
      "Ali Demi, Tirana",
      "Kinostudio, Tirana",
      "21 Dhjetori, Tirana",
      "Medreseja, Tirana",
      "Don Bosko, Tirana",
      "Astir, Tirana",
      "Lapraka, Tirana",
      "Sauk, Tirana"
    ]
  },
  {
    label: "Parks and Open Areas",
    places: [
      "Grand Park of Tirana, Tirana",
      "Liqeni i Thate, Tirana",
      "New Boulevard, Tirana",
      "Youth Park, Tirana",
      "Farka Lake, Tirana"
    ]
  },
  {
    label: "Streets and Corridors",
    places: [
      "Myslym Shyri, Tirana",
      "Rruga e Kavajes, Tirana",
      "Rruga e Durresit, Tirana",
      "Bulevardi Bajram Curri, Tirana",
      "Bulevardi Deshmoret e Kombit, Tirana",
      "Rruga e Elbasanit, Tirana"
    ]
  },
  {
    label: "Education and Shopping",
    places: [
      "University of Tirana, Tirana",
      "Tirana East Gate, Tirana",
      "Casa Italia, Tirana",
      "Politechnic University of Tirana, Tirana",
      "European University of Tirana, Tirana",
      "Kristal Center, Tirana",
      "Ring Center, Tirana"
    ]
  },
  {
    label: "Transport and Services",
    places: [
      "Regional Bus Terminal, Tirana",
      "Train Station Area, Tirana",
      "University Hospital Center Mother Teresa, Tirana",
      "Tirana International Bus Station, Tirana"
    ]
  },
  {
    label: "Culture and Leisure",
    places: [
      "National Theatre of Opera and Ballet, Tirana",
      "National Historical Museum, Tirana",
      "Bunk'Art 2, Tirana",
      "Arena Center, Tirana",
      "Pallati i Kongreseve, Tirana"
    ]
  }
];

const copy = {
  en: {
    story: "Story",
    interactiveMap: "Interactive Map",
    technology: "Technology",
    join: "Join Waitlist",
    from: "From",
    to: "To",
    transport: "Transport",
    getRoutes: "Get Live Routes",
    loading: "Loading...",
    liveSuggestions: "Live Suggestions",
    retry: "Retry",
    refresh: "Refresh",
    noSuggestions: "No suggestions yet. Try a different mood or route.",
    directions: "Turn-by-turn",
    compare: "Compare mode",
    avoidZones: "Avoid zones",
    saveTrip: "Save trip",
    shareTrip: "Share trip",
    useMyLocation: "Use my location",
    trend: "Mood trend (next 3h)",
    trafficOverlay: "Traffic overlay",
    noiseOverlay: "Noise overlay"
  },
};

function readInitialParam(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || localStorage.getItem(`rm:${key}`) || fallback;
}

function readPageFromHash() {
  if (typeof window === "undefined") return "home";
  const page = window.location.hash.replace("#", "");
  return ["home", "map", "trust", "insights", "admin", "join", "login"].includes(page) ? page : "home";
}

function confidenceColor(confidence = 0.8) {
  if (confidence >= 0.86) return "#44d07b";
  if (confidence >= 0.8) return "#ffd166";
  return "#ff8b7b";
}

function formatSignalTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function estimateRouteDistance(route) {
  const coords = Array.isArray(route?.routeCoords) ? route.routeCoords : [];
  if (coords.length < 2) return route?.distanceKm ? `${route.distanceKm} km` : "Route pending";

  let km = 0;
  for (let index = 1; index < coords.length; index += 1) {
    const [prevLat, prevLng] = coords[index - 1];
    const [lat, lng] = coords[index];
    const latScale = 111;
    const lngScale = 111 * Math.cos(((prevLat + lat) / 2) * (Math.PI / 180));
    const latKm = (lat - prevLat) * latScale;
    const lngKm = (lng - prevLng) * lngScale;
    km += Math.sqrt((latKm * latKm) + (lngKm * lngKm));
  }
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function routeReasons(route, moodLabel) {
  if (Array.isArray(route?.why) && route.why.length > 0) return route.why.slice(0, 3);
  const tags = Array.isArray(route?.tags) ? route.tags : [];
  return [
    `${Math.round((route?.confidence || 0.8) * 100)}% match for ${moodLabel.toLowerCase()} mode.`,
    tags.includes("scenic") ? "Adds a calmer scenic segment." : "Keeps the route simple with fewer decision points.",
    `Balances ETA with stress score ${route?.stressScore || 3}/5.`
  ];
}

function trackEvent(name, payload = {}) {
  try {
    const events = JSON.parse(localStorage.getItem("rm:analytics") || "[]");
    events.push({ name, payload, at: new Date().toISOString() });
    localStorage.setItem("rm:analytics", JSON.stringify(events.slice(-80)));
  } catch {
    // Analytics is local-only and non-blocking.
  }
}

function formatDistanceKm(start, end) {
  const latScale = 111;
  const avgLat = ((start[0] + end[0]) / 2) * (Math.PI / 180);
  const lngScale = 111 * Math.cos(avgLat);
  const latKm = (end[0] - start[0]) * latScale;
  const lngKm = (end[1] - start[1]) * lngScale;
  const km = Math.sqrt((latKm * latKm) + (lngKm * lngKm));
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function segmentDirection(start, end) {
  const latDiff = end[0] - start[0];
  const lngDiff = end[1] - start[1];
  const northSouth = latDiff >= 0 ? "north" : "south";
  const eastWest = lngDiff >= 0 ? "east" : "west";

  if (Math.abs(latDiff) > Math.abs(lngDiff) * 1.6) return northSouth;
  if (Math.abs(lngDiff) > Math.abs(latDiff) * 1.6) return eastWest;
  return `${northSouth}-${eastWest}`;
}

function buildRouteSteps(route, from, to) {
  const coords = Array.isArray(route?.routeCoords) ? route.routeCoords : [];
  if (coords.length < 2) return [];
  const streetSteps = Array.isArray(route?.streetSteps) ? route.streetSteps : [];

  if (streetSteps.length > 0) {
    return streetSteps.map((step, index) => ({
      id: `${route.id}-street-${index}`,
      title: step.title,
      detail: step.detail,
      segmentCoords: [coords[index] || coords[0], coords[Math.min(index + 1, coords.length - 1)] || coords[coords.length - 1]],
      icon: step.icon || "straight"
    }));
  }

  const steps = [
    {
      id: `${route.id}-start`,
      title: `Start at ${from}`,
      detail: `Begin at ${from} and join the ${route.title.toLowerCase()}. Follow the highlighted path out of the starting area.`,
      segmentCoords: [coords[0], coords[1]],
      icon: "start"
    }
  ];

  for (let index = 1; index < coords.length; index += 1) {
    const prev = coords[index - 1];
    const current = coords[index];
    const direction = segmentDirection(prev, current);
    const distance = formatDistanceKm(prev, current);
    const isLast = index === coords.length - 1;
    const next = coords[index + 1];
    const nextDirection = next ? segmentDirection(current, next) : null;

    if (!isLast) {
      steps.push({
        id: `${route.id}-segment-${index}`,
        title: `Continue ${direction}`,
        detail: `Travel ${distance} heading ${direction} and stay on the current route line.`,
        segmentCoords: [prev, current],
        icon: "straight"
      });
    }

    if (!isLast && nextDirection && nextDirection !== direction) {
      steps.push({
        id: `${route.id}-transition-${index}`,
        title: `Bear ${nextDirection}`,
        detail: `At the next bend, shift from ${direction} toward ${nextDirection} and keep following the highlighted route.`,
        segmentCoords: [current, next],
        icon: "straight"
      });
    }

    if (isLast) {
      steps.push({
        id: `${route.id}-arrival-${index}`,
        title: `Arrive at ${to}`,
        detail: `Stay on this final stretch for ${distance}, then arrive at ${to}.`,
        segmentCoords: [prev, current],
        icon: "arrive"
      });
    }
  }

  return steps;
}

function midpointCoord(coords) {
  if (!Array.isArray(coords) || coords.length === 0) return null;
  return coords[Math.floor(coords.length / 2)];
}

function StepIcon({ icon }) {
  if (icon === "start") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="step-icon">
        <circle cx="12" cy="12" r="7" fill="currentColor" opacity="0.22" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "arrive") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="step-icon">
        <path d="M6 5h2v14H6z" fill="currentColor" />
        <path d="M9 6h9l-3 4 3 4H9z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="step-icon">
      <path d="M5 12h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M12 7l5 5-5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Icon({ name }) {
  const common = { "aria-hidden": "true", viewBox: "0 0 24 24", className: "ui-icon" };
  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="10" r="2.2" fill="currentColor" />
      </svg>
    );
  }
  if (name === "star") {
    return (
      <svg {...common}>
        <path d="m12 3 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8L12 3z" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (name === "share") {
    return (
      <svg {...common}>
        <circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "navigate") {
    return (
      <svg {...common}>
        <path d="M5 12 20 4l-5.2 16-3-7.1L5 12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "layers") {
    return (
      <svg {...common}>
        <path d="m12 3 9 5-9 5-9-5 9-5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "map") {
    return (
      <svg {...common}>
        <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 3v15M15 6v15" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return null;
}

function filterPlaceGroups(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return tiranaPlaceGroups;

  return tiranaPlaceGroups
    .map((group) => ({
      ...group,
      places: group.places.filter((place) => place.toLowerCase().includes(normalized))
    }))
    .filter((group) => group.places.length > 0);
}

function demoRouteSuggestions({ from, to, moodId, transport, avoid }) {
  const baseByMood = {
    calm: {
      color: "calm",
      routes: [
        ["parkline-calm", "Parkline Calm Route", "A quiet demo route through calmer central corridors.", "balanced", 0.88],
        ["waterside-calm", "Waterside Calm Drift", "A softer scenic path designed to reduce stimulation.", "scenic", 0.82],
        ["steady-calm", "Steady Calm Shortcut", "A direct route with fewer decision points.", "fastest", 0.79]
      ]
    },
    happy: {
      color: "happy",
      routes: [
        ["boulevard-happy", "Boulevard Happy Route", "A lively demo route with brighter city energy.", "balanced", 0.86],
        ["landmark-happy", "Landmark Happy Loop", "A social route through animated landmark streets.", "scenic", 0.84],
        ["spark-happy", "Spark Happy Express", "A quicker upbeat route.", "fastest", 0.8]
      ]
    },
    energetic: {
      color: "energetic",
      routes: [
        ["pulse-energetic", "Pulse Energy Route", "An active route with more movement.", "balanced", 0.87],
        ["summit-energetic", "Summit Energy Ride", "A dramatic scenic path.", "scenic", 0.83],
        ["drive-energetic", "Drive Energy Dash", "A high-tempo shortcut.", "fastest", 0.81]
      ]
    },
    stressed: {
      color: "stressed",
      routes: [
        ["shelter-stressed", "Shelter Relief Route", "A gentle route away from pressure points.", "balanced", 0.89],
        ["breather-stressed", "Breather Scenic Route", "A slower route that avoids crowded stretches.", "scenic", 0.8],
        ["relief-stressed", "Relief Direct Route", "A shorter low-friction route.", "fastest", 0.78]
      ]
    },
    romantic: {
      color: "romantic",
      routes: [
        ["promenade-romantic", "Promenade Romantic Route", "A softer route through cozier streets.", "balanced", 0.88],
        ["golden-hour-romantic", "Golden Hour Scenic Walk", "A scenic route with calmer atmosphere.", "scenic", 0.84],
        ["sweet-shortcut-romantic", "Sweet Shortcut", "A short route that avoids harsh noisy sections.", "fastest", 0.79]
      ]
    }
  };
  const coordsByKind = {
    balanced: [[41.332, 19.807], [41.329, 19.812], [41.323, 19.819], [41.318, 19.826]],
    scenic: [[41.336, 19.801], [41.333, 19.81], [41.327, 19.818], [41.32, 19.823], [41.314, 19.828]],
    fastest: [[41.331, 19.814], [41.324, 19.82], [41.317, 19.824]]
  };
  const mode = baseByMood[moodId] || baseByMood.calm;
  const transportMode = { walking: "walking", bike: "bicycling", car: "driving", transit: "transit" }[transport] || "walking";

  return mode.routes.map(([id, title, description, routeKind, confidence], index) => ({
    id,
    title,
    description,
    etaMinutes: [28, 33, 24][index] || 28,
    stressScore: [3, 2, 4][index] || 3,
    confidence,
    elevationGainM: [24, 38, 18][index] || 24,
    safetyScore: [86, 82, 76][index] || 82,
    noiseLevel: routeKind === "scenic" ? "Low" : "Medium",
    why: [
      "Demo fallback shown because the backend route API is unavailable.",
      routeKind === "scenic" ? "Chooses calmer visual corridors over pure speed." : "Balances directness with emotional comfort.",
      `Uses ${transport || "walking"} mode with visible route geometry.`
    ],
    routeCoords: coordsByKind[routeKind],
    streetSteps: [
      { title: `Start at ${from}`, detail: "Join the highlighted route from the origin area.", icon: "start" },
      { title: "Continue along the highlighted corridor", detail: "Follow the route line toward the destination.", icon: "straight" },
      { title: `Arrive at ${to}`, detail: "Finish at the selected destination.", icon: "arrive" }
    ],
    routeKind,
    tags: routeKind === "scenic" ? ["scenic", "comfort"] : ["mood-match"],
    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=${transportMode}`
  })).filter((item) => {
    if (avoid?.highStress && item.stressScore > 3) return false;
    if (avoid?.noisy && item.noiseLevel === "High") return false;
    return true;
  });
}

function App() {
  const mapRef = useRef(null);
  const mapApiRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef([]);
  const routeLayersRef = useRef({});
  const activeStepLayerRef = useRef(null);
  const currentLocationRef = useRef(null);
  const routeSectionRef = useRef(null);
  const placePickerRef = useRef(null);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const pickModeRef = useRef("");

  const [moods, setMoods] = useState(fallbackMoods);
  const [activeMood, setActiveMood] = useState(readInitialParam("mood", DEFAULT_PAIR.mood));
  const [from, setFrom] = useState(readInitialParam("from", DEFAULT_PAIR.from));
  const [to, setTo] = useState(readInitialParam("to", DEFAULT_PAIR.to));
  const [transport, setTransport] = useState(readInitialParam("transport", DEFAULT_PAIR.transport));
  const [suggestions, setSuggestions] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [formError, setFormError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [uiTheme, setUiTheme] = useState(() => localStorage.getItem("rm:uiTheme") || "light");
  const [activePage, setActivePage] = useState(readPageFromHash);
  const [pendingPage, setPendingPage] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authOk, setAuthOk] = useState("");
  const [waitlistForm, setWaitlistForm] = useState({ name: "", email: "", message: "" });
  const [waitlistStatus, setWaitlistStatus] = useState("");
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistBusy, setWaitlistBusy] = useState(false);
  const [questionnaire, setQuestionnaire] = useState({ feeling: "calm", environment: "quiet", intent: "nature" });
  const [routeFeedback, setRouteFeedback] = useState({ rating: 5, moodMatch: true, relaxing: true, tooCrowded: false, comment: "" });
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rm:preferences") || "null") || {
        favoriteMoods: [],
        defaultTransport: "walking",
        preferredMusicStyle: "",
        avoidCrowded: false,
        avoidNoisy: false,
        avoidHighStress: false,
        notificationsEnabled: false
      };
    } catch {
      return {
        favoriteMoods: [],
        defaultTransport: "walking",
        preferredMusicStyle: "",
        avoidCrowded: false,
        avoidNoisy: false,
        avoidHighStress: false,
        notificationsEnabled: false
      };
    }
  });
  const [preferencesStatus, setPreferencesStatus] = useState("");
  const [adminStats, setAdminStats] = useState(null);
  const [coachPrompt, setCoachPrompt] = useState("");
  const [coachSuggestion, setCoachSuggestion] = useState("");
  const [authToken, setAuthToken] = useState(localStorage.getItem("rm:authToken") || "");
  const [authChecking, setAuthChecking] = useState(Boolean(localStorage.getItem("rm:authToken")));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rm:user") || "null");
    } catch {
      return null;
    }
  });
  const [mapVisible, setMapVisible] = useState(false);
  const [mapStyle, setMapStyle] = useState(localStorage.getItem("rm:mapStyle") || "street");
  const [activePlaceField, setActivePlaceField] = useState("");
  const [placeMenuPosition, setPlaceMenuPosition] = useState(null);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [pickMode, setPickMode] = useState("");
  const [compareMode, setCompareMode] = useState(true);
  const [mobileMapPanel, setMobileMapPanel] = useState("routes");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedStepId, setSelectedStepId] = useState("");
  const [avoid, setAvoid] = useState({ crowded: false, noisy: false, highStress: false });
  const [overlays, setOverlays] = useState({ traffic: true, noise: false });
  const [lastUpdated, setLastUpdated] = useState(formatSignalTime());
  const [playlist, setPlaylist] = useState(null);
  const [tourStep, setTourStep] = useState(() => (localStorage.getItem("rm:tourDone") ? 4 : 0));
  const [moodTrend, setMoodTrend] = useState([
    { hour: "+1h", score: 65 },
    { hour: "+2h", score: 67 },
    { hour: "+3h", score: 66 }
  ]);
  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rm:savedTrips") || "[]");
    } catch {
      return [];
    }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rm:favorites") || "[]");
    } catch {
      return [];
    }
  });

  const scene = useMemo(() => moods.find((m) => m.id === activeMood) || moods[0], [moods, activeMood]);
  const t = copy.en;
  const filteredFromGroups = useMemo(() => filterPlaceGroups(fromSearch), [fromSearch]);
  const filteredToGroups = useMemo(() => filterPlaceGroups(toSearch), [toSearch]);

  const topSuggestions = useMemo(() => {
    let items = [...suggestions];
    if (!compareMode) items = items.slice(0, 1);
    return items.slice(0, 3);
  }, [suggestions, compareMode]);

  const activeRoute = useMemo(
    () => topSuggestions.find((item) => item.id === selectedRouteId) || topSuggestions[0] || null,
    [topSuggestions, selectedRouteId]
  );
  const activeRouteSteps = useMemo(
    () => (activeRoute ? buildRouteSteps(activeRoute, from, to) : []),
    [activeRoute, from, to]
  );
  const insightMetrics = useMemo(() => {
    const moodLabels = moods.reduce((acc, mood) => ({ ...acc, [mood.id]: mood.label }), {});
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentTrips = savedTrips.filter((trip) => {
      const time = new Date(trip.createdAt || trip.savedAt || 0).getTime();
      return Number.isFinite(time) && time >= oneWeekAgo;
    });
    const usageTrips = recentTrips.length > 0 ? recentTrips : savedTrips;
    const countBy = (items, key) => items.reduce((acc, item) => {
      const value = item[key] || "unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    const moodCounts = countBy(usageTrips, "moodId");
    const transportCounts = countBy(usageTrips, "transport");
    const moodBars = Object.entries(moodCounts)
      .map(([id, count]) => ({ id, label: moodLabels[id] || id, count }))
      .sort((a, b) => b.count - a.count);
    const transportBars = Object.entries(transportCounts)
      .map(([id, count]) => ({ id, label: id === "unknown" ? "Saved route" : id, count }))
      .sort((a, b) => b.count - a.count);
    const maxMood = Math.max(1, ...moodBars.map((item) => item.count));
    const maxTransport = Math.max(1, ...transportBars.map((item) => item.count));
    const topMood = moodBars[0]?.label || scene?.label || "Calm";
    const topTransport = transportBars[0]?.label || transport;
    const positiveRoutes = adminStats?.topPositiveRoutes || [];

    return {
      usageTrips,
      totalSaved: savedTrips.length,
      favoritesCount: favorites.length,
      topMood,
      topTransport,
      moodBars: moodBars.length > 0 ? moodBars : [{ id: activeMood, label: scene?.label || "Calm", count: 1 }],
      transportBars: transportBars.length > 0 ? transportBars : [{ id: transport, label: transport, count: 1 }],
      maxMood,
      maxTransport,
      positiveRoutes,
      averageTrend: Math.round(moodTrend.reduce((sum, point) => sum + Number(point.score || 0), 0) / Math.max(1, moodTrend.length))
    };
  }, [activeMood, adminStats, favorites, moodTrend, moods, savedTrips, scene, transport]);
  const adminMetrics = useMemo(() => {
    const moodLabels = moods.reduce((acc, mood) => ({ ...acc, [mood.id]: mood.label }), {});
    const moodBars = Object.entries(adminStats?.moodCounts || {})
      .map(([id, count]) => ({ id, label: moodLabels[id] || id, count: Number(count) || 0 }))
      .sort((a, b) => b.count - a.count);
    const maxMoodCount = Math.max(1, ...moodBars.map((item) => item.count));
    const avgSatisfaction = Number(adminStats?.avgSatisfaction || 0);
    const kpis = [
      { label: "Active users", value: adminStats?.activeUsers ?? 0, hint: "Unique users with activity", icon: "AU", progress: Math.min(100, ((adminStats?.activeUsers || 0) / 10) * 100) },
      { label: "Routes generated", value: adminStats?.totalRoutesGenerated ?? 0, hint: "Total route requests", icon: "RG", progress: Math.min(100, ((adminStats?.totalRoutesGenerated || 0) / 150) * 100) },
      { label: "Total feedback", value: adminStats?.totalFeedback ?? 0, hint: "Submitted trip ratings", icon: "TF", progress: Math.min(100, ((adminStats?.totalFeedback || 0) / 25) * 100) },
      { label: "Avg satisfaction", value: `${avgSatisfaction || 0}/5`, hint: "Average route rating", icon: "AS", progress: Math.min(100, (avgSatisfaction / 5) * 100) }
    ];

    return {
      kpis,
      moodBars,
      maxMoodCount,
      positiveRoutes: adminStats?.topPositiveRoutes || [],
      recentFeedback: adminStats?.recentFeedback || [],
      statusText: adminStats ? "Live stats connected" : "Waiting for stats"
    };
  }, [adminStats, moods]);
  const currentUserId = currentUser?.id || USER_ID;
  const themeVars = moodThemes[activeMood] || moodThemes.calm;
  const liveSignalText = `Traffic updated ${lastUpdated} | Noise estimated | Mood score demo data`;

  useEffect(() => {
    document.documentElement.dataset.theme = uiTheme;
    localStorage.setItem("rm:uiTheme", uiTheme);
  }, [uiTheme]);

  useEffect(() => {
    localStorage.removeItem("rm:pendingPage");
    function syncPage() {
      const requestedPage = readPageFromHash();
      const isProtected = PROTECTED_PAGES.has(requestedPage);
      const isSignedIn = Boolean(authToken && currentUser);

      if (requestedPage === "login" && isSignedIn) {
        setPendingPage("");
        setActivePage("home");
        if (window.location.hash !== "#home") {
          window.location.hash = "home";
        }
        setShowMobileNav(false);
        return;
      }

      if (isProtected && !isSignedIn) {
        localStorage.setItem("rm:pendingPage", requestedPage);
        setPendingPage(requestedPage);
        setActivePage("login");
        if (window.location.hash !== "#login") {
          window.location.hash = "login";
        }
      } else {
        setActivePage(requestedPage);
      }
      setShowMobileNav(false);
    }

    syncPage();
    window.addEventListener("hashchange", syncPage);
    return () => window.removeEventListener("hashchange", syncPage);
  }, [authToken, currentUser]);

  useEffect(() => {
    if (activePage !== "map") return undefined;
    setMapVisible(true);
    const id = setTimeout(() => {
      mapApiRef.current?.invalidateSize();
    }, 80);
    return () => clearTimeout(id);
  }, [activePage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setMapVisible(true);
        });
      },
      { threshold: 0.15 }
    );

    if (routeSectionRef.current) observer.observe(routeSectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem("rm:mood", activeMood);
    localStorage.setItem("rm:from", from);
    localStorage.setItem("rm:to", to);
    localStorage.setItem("rm:transport", transport);
  }, [activeMood, from, to, transport]);

  useEffect(() => {
    localStorage.setItem("rm:mapStyle", mapStyle);
  }, [mapStyle]);

  useEffect(() => {
    pickModeRef.current = pickMode;
  }, [pickMode]);

  useEffect(() => {
    localStorage.setItem("rm:savedTrips", JSON.stringify(savedTrips));
  }, [savedTrips]);

  useEffect(() => {
    if (!authToken) {
      setAuthChecking(false);
      return undefined;
    }

    let cancelled = false;
    setAuthChecking(true);
    async function loadUser() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error("session expired");
        const data = await res.json();
        if (cancelled) return;
        setCurrentUser(data.user);
        localStorage.setItem("rm:user", JSON.stringify(data.user));
      } catch {
        if (cancelled) return;
        setAuthToken("");
        setCurrentUser(null);
        localStorage.removeItem("rm:authToken");
        localStorage.removeItem("rm:user");
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem("rm:favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("rm:preferences", JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    setAvoid({
      crowded: Boolean(preferences.avoidCrowded),
      noisy: Boolean(preferences.avoidNoisy),
      highStress: Boolean(preferences.avoidHighStress)
    });
    if (preferences.defaultTransport) setTransport(preferences.defaultTransport);
  }, [preferences.avoidCrowded, preferences.avoidNoisy, preferences.avoidHighStress, preferences.defaultTransport]);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch(`${API_BASE}/preferences/${encodeURIComponent(currentUserId)}`);
        if (!res.ok) throw new Error("preferences request failed");
        const data = await res.json();
        if (data.preferences) setPreferences((prev) => ({ ...prev, ...data.preferences }));
      } catch {
        // Keep local preferences.
      }
    }

    loadPreferences();
  }, [currentUserId]);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(`${API_BASE}/stats`);
        if (!res.ok) throw new Error("stats request failed");
        setAdminStats(await res.json());
      } catch {
        setAdminStats(null);
      }
    }

    if (["admin", "insights"].includes(activePage)) loadStats();
  }, [activePage, feedbackStatus]);

  useEffect(() => {
    if (tourStep >= 4) {
      localStorage.setItem("rm:tourDone", "true");
      return undefined;
    }
    const id = setTimeout(() => setTourStep((step) => Math.min(step + 1, 4)), 5000);
    return () => clearTimeout(id);
  }, [tourStep]);

  useEffect(() => {
    function handlePointerDown(event) {
      const fromNode = fromInputRef.current;
      const toNode = toInputRef.current;
      const menuNode = placePickerRef.current;
      if (fromNode?.contains(event.target) || toNode?.contains(event.target) || menuNode?.contains(event.target)) return;
      setActivePlaceField("");
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    function updatePlaceMenuPosition() {
      const activeInput = activePlaceField === "from" ? fromInputRef.current : activePlaceField === "to" ? toInputRef.current : null;
      if (!activeInput) {
        setPlaceMenuPosition(null);
        return;
      }

      const rect = activeInput.getBoundingClientRect();
      setPlaceMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }

    updatePlaceMenuPosition();
    if (!activePlaceField) return;

    window.addEventListener("resize", updatePlaceMenuPosition);
    window.addEventListener("scroll", updatePlaceMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updatePlaceMenuPosition);
      window.removeEventListener("scroll", updatePlaceMenuPosition, true);
    };
  }, [activePlaceField]);

  useEffect(() => {
    if (!mapRef.current || mapApiRef.current || !mapVisible) return undefined;
    let cancelled = false;

    async function loadMap() {
      const [{ default: Leaflet }] = await Promise.all([
        import("leaflet"),
        import("leaflet/dist/leaflet.css")
      ]);
      if (cancelled || mapApiRef.current || !mapRef.current) return;

      window.L = Leaflet;
      const map = Leaflet.map(mapRef.current, { zoomControl: false, keyboard: true }).setView([41.3275, 19.8187], 13);
      Leaflet.control.zoom({ position: "bottomright" }).addTo(map);
      const tileLayer = Leaflet.tileLayer(MAP_STYLES[mapStyle] || MAP_STYLES.street, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
        detectRetina: true
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      map.on("click", (event) => {
        const activePickMode = pickModeRef.current;
        if (!activePickMode) return;
        const { lat, lng } = event.latlng;
        const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (activePickMode === "start") {
          setFrom(label);
          if (startMarkerRef.current) map.removeLayer(startMarkerRef.current);
          startMarkerRef.current = Leaflet.marker([lat, lng]).addTo(map).bindPopup("Start").openPopup();
        }
        if (activePickMode === "end") {
          setTo(label);
          if (endMarkerRef.current) map.removeLayer(endMarkerRef.current);
          endMarkerRef.current = Leaflet.marker([lat, lng]).addTo(map).bindPopup("Destination").openPopup();
        }
        setPickMode("");
      });

      mapApiRef.current = map;
      setMapReady(true);
    }

    loadMap();
    return () => {
      cancelled = true;
    };
  }, [mapVisible, mapStyle]);

  useEffect(() => {
    const map = mapApiRef.current;
    if (!map || !window.L || !tileLayerRef.current) return;
    map.removeLayer(tileLayerRef.current);
    const tileLayer = window.L.tileLayer(MAP_STYLES[mapStyle] || MAP_STYLES.street, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
      detectRetina: true
    }).addTo(map);
    tileLayerRef.current = tileLayer;
  }, [mapStyle]);

  useEffect(() => {
    if (activePage !== "map" || mobileMapPanel !== "map") return undefined;
    const id = setTimeout(() => {
      mapApiRef.current?.invalidateSize();
      if (activeRoute) focusRoute(activeRoute.id);
    }, 80);
    return () => clearTimeout(id);
  }, [activePage, mobileMapPanel, activeRoute?.id]);

  useEffect(() => {
    async function fetchMoods() {
      try {
        const res = await fetch(`${API_BASE}/moods`);
        if (!res.ok) throw new Error("moods request failed");
        const data = await res.json();
        if (Array.isArray(data.moods) && data.moods.length > 0) {
          setMoods(data.moods);
          setActiveMood((curr) => (data.moods.some((m) => m.id === curr) ? curr : data.moods[0].id));
        }
      } catch (_error) {
        // keep fallback moods
      }
    }

    fetchMoods();
  }, []);

  async function fetchSuggestions() {
    if (!from.trim() || !to.trim()) return;

    setLoadingRoutes(true);
    setRouteError("");
    try {
      const res = await fetch(`${API_BASE}/route-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, from, to, moodId: activeMood, transport, avoid })
      });

      if (!res.ok) throw new Error("route request failed");
      const data = await res.json();
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setLastUpdated(formatSignalTime());
      setMobileMapPanel("map");
      trackEvent("route_suggestions_loaded", { moodId: activeMood, transport });
    } catch (_error) {
      setSuggestions(demoRouteSuggestions({ from, to, moodId: activeMood, transport, avoid }));
      setRouteError("");
      setMobileMapPanel("map");
    } finally {
      setLoadingRoutes(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchPlaylist() {
      const fallback = {
        url: `https://open.spotify.com/search/${encodeURIComponent(scene?.musicKeywords || "mood playlist")}/playlists`,
        title: `${scene?.label || "Mood"} playlist`,
        source: "spotify-search"
      };

      try {
        const playlistQuery = preferences.preferredMusicStyle || scene?.musicKeywords || "";
        const res = await fetch(`${API_BASE}/playlist?moodId=${encodeURIComponent(activeMood)}&q=${encodeURIComponent(playlistQuery)}`);
        if (!res.ok) throw new Error("playlist request failed");
        const data = await res.json();
        if (!cancelled) setPlaylist(data.playlist || fallback);
      } catch {
        if (!cancelled) setPlaylist(fallback);
      }
    }

    fetchPlaylist();
    return () => {
      cancelled = true;
    };
  }, [activeMood, scene, preferences.preferredMusicStyle]);

  useEffect(() => {
    async function fetchMoodTrend() {
      try {
        const res = await fetch(`${API_BASE}/mood-trend?moodId=${encodeURIComponent(activeMood)}`);
        if (!res.ok) throw new Error("trend request failed");
        const data = await res.json();
        if (Array.isArray(data.trend)) {
          setMoodTrend(data.trend);
        }
      } catch (_error) {
        // keep previous trend
      }
    }

    fetchMoodTrend();
  }, [activeMood]);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchSuggestions();
    }, 450);
    return () => clearTimeout(id);
  }, [activeMood, from, to, transport, avoid]);

  useEffect(() => {
    if (!topSuggestions.length) {
      setSelectedRouteId("");
      return;
    }

    setSelectedRouteId((current) => (
      topSuggestions.some((item) => item.id === current) ? current : topSuggestions[0].id
    ));
  }, [topSuggestions]);

  useEffect(() => {
    if (!activeRouteSteps.length) {
      setSelectedStepId("");
      return;
    }

    setSelectedStepId((current) => (
      activeRouteSteps.some((step) => step.id === current) ? current : activeRouteSteps[0].id
    ));
  }, [activeRouteSteps]);

  useEffect(() => {
    const map = mapApiRef.current;
    if (!map || !window.L || !scene) return;

    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];
    routeLayersRef.current = {};

    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }

    if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }

    if (activeStepLayerRef.current) {
      map.removeLayer(activeStepLayerRef.current);
      activeStepLayerRef.current = null;
    }

    const routesToDraw = topSuggestions.length > 0 ? topSuggestions : suggestions;
    if (!routesToDraw.length) return;

    routesToDraw.forEach((item, idx) => {
      const coords = Array.isArray(item.routeCoords) && item.routeCoords.length > 1 ? item.routeCoords : [[41.332, 19.807], [41.326, 19.817], [41.318, 19.826]];
      const isSelected = item.id === (selectedRouteId || routesToDraw[0].id);
      const routeColor = confidenceColor(item.confidence);
      const casing = window.L.polyline(coords, {
        color: isSelected ? "#ffffff" : "#d9e3ec",
        weight: isSelected ? 12 : 7,
        opacity: isSelected ? 0.98 : 0.5,
        dashArray: idx === 0 || isSelected ? "" : "6 8",
        interactive: false
      }).addTo(map);
      const line = window.L.polyline(coords, {
        color: isSelected ? routeColor : "#4a5d7a",
        weight: isSelected ? 6 : 3,
        opacity: isSelected ? 0.96 : 0.42,
        dashArray: idx === 0 || isSelected ? "" : "6 8"
      }).addTo(map);
      if (casing.bringToBack) casing.bringToBack();
      line.bindPopup(`${item.title} | ETA ${item.etaMinutes} min | confidence ${Math.round((item.confidence || 0.8) * 100)}%`);
      line.on("click", () => {
        setSelectedRouteId(item.id);
        trackEvent("map_route_selected", { routeId: item.id });
      });
      layersRef.current.push(casing, line);
      routeLayersRef.current[item.id] = line;

      if (isSelected) {
        const routeSteps = buildRouteSteps(item, from, to);
        const labelPoint = midpointCoord(coords);
        if (labelPoint) {
          const routeLabel = window.L.marker(labelPoint, {
            interactive: true,
            icon: window.L.divIcon({
              className: "route-label-marker",
              html: `<span class="route-label-chip selected">${item.title} · ${item.etaMinutes}m</span>`
            })
          }).addTo(map);
          routeLabel.on("click", () => focusRoute(item.id));
          layersRef.current.push(routeLabel);
        }

        routeSteps.forEach((step, stepIndex) => {
          const point = Array.isArray(step.segmentCoords) ? step.segmentCoords[0] : null;
          if (!point) return;

          const stepMarker = window.L.marker(point, {
            interactive: true,
            icon: window.L.divIcon({
              className: "route-step-marker",
              html: `<button class="route-step-badge selected" type="button">${stepIndex + 1}</button>`
            })
          }).addTo(map);

          stepMarker.bindTooltip(`${stepIndex + 1}. ${step.title}`, {
            direction: "top",
            offset: [0, -10],
            opacity: 0.92
          });
          stepMarker.on("click", () => {
            setSelectedRouteId(item.id);
            setSelectedStepId(step.id);
            const segment = window.L.polyline(step.segmentCoords);
            map.fitBounds(segment.getBounds(), { padding: [56, 56] });
          });
          layersRef.current.push(stepMarker);
        });
      }
    });

    const highlightedRoute = routesToDraw.find((item) => item.id === (selectedRouteId || routesToDraw[0].id)) || routesToDraw[0];
    const highlightedCoords = Array.isArray(highlightedRoute.routeCoords) ? highlightedRoute.routeCoords : [];

    if (highlightedCoords.length > 1) {
      const startCoords = highlightedCoords[0];
      const endCoords = highlightedCoords[highlightedCoords.length - 1];

      startMarkerRef.current = window.L.circleMarker(startCoords, {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: scene.color || "#56d5b8",
        fillOpacity: 0.95
      }).addTo(map).bindPopup(`Start: ${from}`);

      endMarkerRef.current = window.L.circleMarker(endCoords, {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: "#ff8b7b",
        fillOpacity: 0.95
      }).addTo(map).bindPopup(`Destination: ${to}`);

      layersRef.current.push(startMarkerRef.current, endMarkerRef.current);
      map.fitBounds(routeLayersRef.current[highlightedRoute.id].getBounds(), { padding: [44, 44] });
    }

    if (overlays.traffic) {
      [
        [[41.326, 19.814], 260, "#ff8b7b"],
        [[41.333, 19.822], 220, "#ffd166"]
      ].forEach(([center, radius, color]) => {
        const layer = window.L.circle(center, {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.14,
          weight: 1
        }).addTo(map);
        layer.bindTooltip("Traffic pressure");
        layersRef.current.push(layer);
      });
    }

    if (overlays.noise) {
      [
        [[41.323, 19.819], 240],
        [[41.329, 19.829], 190]
      ].forEach(([center, radius]) => {
        const layer = window.L.circle(center, {
          radius,
          color: "#b794f4",
          fillColor: "#b794f4",
          fillOpacity: 0.16,
          weight: 1
        }).addTo(map);
        layer.bindTooltip("Noise pressure");
        layersRef.current.push(layer);
      });
    }
  }, [mapReady, scene, suggestions, topSuggestions, selectedRouteId, from, to, overlays]);

  useEffect(() => {
    const map = mapApiRef.current;
    const activeStep = activeRouteSteps.find((step) => step.id === selectedStepId);
    if (!map || !window.L) return;

    if (activeStepLayerRef.current) {
      map.removeLayer(activeStepLayerRef.current);
      activeStepLayerRef.current = null;
    }

    if (!activeStep || !Array.isArray(activeStep.segmentCoords) || activeStep.segmentCoords.length < 2) return;

    activeStepLayerRef.current = window.L.polyline(activeStep.segmentCoords, {
      color: "#ffd166",
      weight: 9,
      opacity: 0.95,
      lineCap: "round"
    }).addTo(map);
  }, [activeRouteSteps, selectedStepId]);

  function focusRoute(routeId) {
    setMobileMapPanel("map");
    const map = mapApiRef.current;
    const layer = routeLayersRef.current[routeId];
    if (!map || !layer) return;
    setSelectedRouteId(routeId);
    map.fitBounds(layer.getBounds(), { padding: [44, 44] });
    layer.openPopup();
    trackEvent("route_selected", { routeId });
  }

  function fitAllRoutes() {
    setMobileMapPanel("map");
    const map = mapApiRef.current;
    const routeLayers = Object.values(routeLayersRef.current);
    if (!map || routeLayers.length === 0 || !window.L) return;
    const group = window.L.featureGroup(routeLayers);
    map.fitBounds(group.getBounds(), { padding: [44, 44] });
  }

  function focusRouteStep(stepId) {
    const map = mapApiRef.current;
    const step = activeRouteSteps.find((item) => item.id === stepId);
    if (!map || !step || !window.L) return;

    setSelectedStepId(stepId);
    const segment = window.L.polyline(step.segmentCoords);
    map.fitBounds(segment.getBounds(), { padding: [56, 56] });
  }

  function handleRouteSubmit(event) {
    event.preventDefault();

    if (!from.trim() || !to.trim()) {
      setFormError("Please enter both start and destination.");
      return;
    }

    setFormError("");
    fetchSuggestions();
  }

  function handleHomeRouteSubmit(event) {
    event.preventDefault();

    if (!from.trim() || !to.trim()) {
      setFormError("Please enter both start and destination.");
      localStorage.setItem("rm:pendingPage", "map");
      setPendingPage("map");
      window.location.hash = "login";
      return;
    }

    if (!authToken || !currentUser) {
      setFormError("");
      localStorage.setItem("rm:pendingPage", "map");
      setPendingPage("map");
      window.location.hash = "login";
      return;
    }

    setFormError("");
    setMobileMapPanel("routes");
    setMapVisible(true);
    window.location.hash = "map";
    setTimeout(fetchSuggestions, 0);
    trackEvent("home_planner_submitted", { moodId: activeMood, transport });
  }

  function handleMoodKeyDown(event, idx) {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    let next = idx;
    if (event.key === "ArrowRight") next = (idx + 1) % moods.length;
    if (event.key === "ArrowLeft") next = (idx - 1 + moods.length) % moods.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = moods.length - 1;

    setActiveMood(moods[next].id);
    const el = document.getElementById(`mood-tab-${moods[next].id}`);
    if (el) el.focus();
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setRouteError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFrom(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        const map = mapApiRef.current;
        if (!map || !window.L) return;
        map.setView([lat, lng], 14);
        if (currentLocationRef.current) map.removeLayer(currentLocationRef.current);
        currentLocationRef.current = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            className: "current-location-marker",
            html: '<span class="location-pulse"></span>'
          })
        }).addTo(map).bindPopup("You are here").openPopup();
        trackEvent("current_location_used");
      },
      () => {
        setRouteError("Could not access your location.");
      }
    );
  }

  function toggleAvoid(key) {
    setAvoid((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function applyQuestionnaire() {
    const nextMood =
      questionnaire.feeling === "stressed" ? "stressed" :
      questionnaire.feeling === "romantic" ? "romantic" :
      questionnaire.feeling === "energetic" ? "energetic" :
      questionnaire.feeling === "happy" ? "happy" :
      "calm";

    setActiveMood(nextMood);
    setAvoid({
      crowded: questionnaire.environment === "quiet",
      noisy: questionnaire.environment === "quiet",
      highStress: questionnaire.feeling === "stressed"
    });
    if (questionnaire.intent === "fast") setTransport("car");
    if (questionnaire.intent === "nature") setTransport("walking");
    if (questionnaire.intent === "music") setPreferences((prev) => ({ ...prev, preferredMusicStyle: scene?.musicKeywords || prev.preferredMusicStyle }));
    trackEvent("mood_questionnaire_applied", questionnaire);
  }

  async function savePreferences() {
    const next = {
      ...preferences,
      defaultTransport: transport,
      favoriteMoods: preferences.favoriteMoods.includes(activeMood)
        ? preferences.favoriteMoods
        : [...preferences.favoriteMoods, activeMood].slice(-5),
      avoidCrowded: avoid.crowded,
      avoidNoisy: avoid.noisy,
      avoidHighStress: avoid.highStress
    };

    setPreferences(next);
    setPreferencesStatus("Preferences saved on this device.");
    try {
      await fetch(`${API_BASE}/preferences/${encodeURIComponent(currentUserId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next)
      });
      setPreferencesStatus("Preferences saved.");
    } catch {
      setPreferencesStatus("Preferences saved locally.");
    }
  }

  async function submitRouteFeedback(event) {
    event.preventDefault();
    if (!activeRoute) return;

    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          moodId: activeMood,
          rating: Number(routeFeedback.rating),
          comment: routeFeedback.comment,
          routeTitle: activeRoute.title,
          moodMatch: routeFeedback.moodMatch,
          relaxing: routeFeedback.relaxing,
          tooCrowded: routeFeedback.tooCrowded
        })
      });
      if (!res.ok) throw new Error("feedback failed");
      setFeedbackStatus("Thanks. Your route feedback improved the positive routes database.");
      setRouteFeedback({ rating: 5, moodMatch: true, relaxing: true, tooCrowded: false, comment: "" });
      trackEvent("route_feedback_submitted", { routeId: activeRoute.id, rating: routeFeedback.rating });
    } catch {
      setFeedbackStatus("Could not send feedback right now.");
    }
  }

  function runCoach() {
    const text = coachPrompt.toLowerCase();
    const mood =
      text.includes("stress") || text.includes("quiet") ? "stressed" :
      text.includes("romantic") || text.includes("date") ? "romantic" :
      text.includes("energy") || text.includes("workout") ? "energetic" :
      text.includes("happy") || text.includes("positive") ? "happy" :
      "calm";
    const recommended = moods.find((item) => item.id === mood) || scene;
    setActiveMood(mood);
    setCoachSuggestion(`${recommended?.label || "Calm"} mode looks best. I would choose a ${text.includes("fast") ? "fastest" : "scenic"} route, avoid noisy zones, and pair it with ${recommended?.musicKeywords || "a mood playlist"}.`);
  }

  function saveTrip() {
    const entry = {
      id: Date.now(),
      from,
      to,
      moodId: activeMood,
      transport,
      routeTitle: activeRoute?.title || "Recommended route",
      createdAt: new Date().toISOString()
    };
    setSavedTrips((prev) => [entry, ...prev].slice(0, 8));
    trackEvent("route_saved", { moodId: activeMood });
  }

  function favoriteRoute(route) {
    if (!route) return;
    const entry = {
      id: route.id,
      title: route.title,
      from,
      to,
      moodId: activeMood,
      savedAt: new Date().toISOString()
    };
    setFavorites((prev) => [entry, ...prev.filter((item) => item.id !== route.id)].slice(0, 8));
    trackEvent("route_favorited", { routeId: route.id });
  }

  async function shareTrip() {
    const params = new URLSearchParams({ from, to, mood: activeMood, transport }).toString();
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore clipboard errors
    }
    trackEvent("route_shared", { moodId: activeMood });
  }

  function choosePlace(field, place) {
    if (field === "from") {
      setFrom(place);
      setFromSearch(place);
    } else {
      setTo(place);
      setToSearch(place);
    }
    setActivePlaceField("");
  }

  function handlePlaceFocus(field) {
    setActivePlaceField(field);
    if (field === "from") {
      setFromSearch("");
    } else {
      setToSearch("");
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");
    setAuthOk("");

    const payload = {
      email: authForm.email.trim(),
      password: authForm.password
    };
    if (authMode === "register") payload.name = authForm.name.trim();

    try {
      const res = await fetch(`${API_BASE}/auth/${authMode === "register" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed.");

      setAuthToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem("rm:authToken", data.token);
      localStorage.setItem("rm:user", JSON.stringify(data.user));
      setAuthOk(authMode === "register" ? "Account created. You are signed in." : "Signed in.");
      const nextPage = pendingPage || localStorage.getItem("rm:pendingPage") || "home";
      localStorage.removeItem("rm:pendingPage");
      setPendingPage("");
      window.location.hash = nextPage;
      trackEvent("auth_success", { mode: authMode });
    } catch (error) {
      setAuthError(error.message || "Could not sign in.");
    }
  }

  async function handleWaitlistSubmit(event) {
    event.preventDefault();
    setWaitlistStatus("");
    setWaitlistError("");

    if (!waitlistForm.name.trim() || !waitlistForm.email.trim() || !waitlistForm.message.trim()) {
      setWaitlistError("Please fill in your name, email, and message.");
      return;
    }

    setWaitlistBusy(true);
    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waitlistForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send your message.");

      if (data.sent) {
        setWaitlistStatus("Thanks. Your message was sent to the Route Mood inbox.");
      } else if (data.mailtoUrl) {
        window.location.href = data.mailtoUrl;
        setWaitlistStatus("Your email app is opening with the message ready to send.");
      } else {
        setWaitlistStatus("Thanks. Your message was received.");
      }
      setWaitlistForm({ name: "", email: "", message: "" });
      trackEvent("waitlist_feedback_submitted");
    } catch (error) {
      const subject = `Route Mood waitlist feedback from ${waitlistForm.name}`;
      const body = `Name: ${waitlistForm.name}\nEmail: ${waitlistForm.email}\n\n${waitlistForm.message}`;
      window.location.href = `mailto:hello@routemood.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setWaitlistStatus("Your email app is opening with the message ready to send.");
      setWaitlistError(error.message || "");
    } finally {
      setWaitlistBusy(false);
    }
  }

  async function handleLogout() {
    try {
      if (authToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
    } catch {
      // Logout should still clear local session if the network fails.
    }
    setAuthToken("");
    setCurrentUser(null);
    setPendingPage("");
    localStorage.removeItem("rm:authToken");
    localStorage.removeItem("rm:user");
    localStorage.removeItem("rm:pendingPage");
    if (PROTECTED_PAGES.has(activePage)) {
      window.location.hash = "home";
    }
    trackEvent("auth_logout");
  }

  return (
    <div className="site" style={themeVars} data-theme={uiTheme}>
      <SiteNav
        activePage={activePage}
        currentUser={currentUser}
        joinLabel={t.join}
        showMobileNav={showMobileNav}
        uiTheme={uiTheme}
        onToggleMobileNav={() => setShowMobileNav((v) => !v)}
        onToggleTheme={() => setUiTheme((value) => (value === "dark" ? "light" : "dark"))}
        onLogout={handleLogout}
      />

      <main className="page-shell">
      <div className={activePage === "home" ? "page active" : "page"} aria-hidden={activePage !== "home"}>
        <HomePage
          from={from}
          to={to}
          activeMood={activeMood}
          moods={moods}
          transport={transport}
          features={featuresAlb}
          trustStats={trustStats}
          onFromChange={setFrom}
          onToChange={setTo}
          onMoodChange={setActiveMood}
          onTransportChange={setTransport}
          onSubmit={handleHomeRouteSubmit}
          onDemo={() => {
            setFrom(DEFAULT_PAIR.from);
            setTo(DEFAULT_PAIR.to);
            setActiveMood(DEFAULT_PAIR.mood);
            setTransport(DEFAULT_PAIR.transport);
            setMobileMapPanel("routes");
            if (!authToken || !currentUser) {
              localStorage.setItem("rm:pendingPage", "map");
              setPendingPage("map");
            }
            trackEvent("hero_demo_clicked");
          }}
        />
      </div>

      <section
        id="map"
        className={activePage === "map" ? "interactive page active" : "interactive page"}
        ref={routeSectionRef}
        aria-hidden={activePage !== "map"}
        data-mobile-panel={mobileMapPanel}
      >
        <div className="page-title">
          <p className="kicker">Interactive Mood Map</p>
          <h2>Plan a route that fits the mood you want.</h2>
          <p>This demo is prefilled with a popular route so the first recommendation is ready as soon as live signals load.</p>
        </div>
        <div className="signal-bar" role="status">
          <span>{liveSignalText}</span>
          <strong>Transparent demo mode</strong>
        </div>

        <div className="map-mobile-tabs" aria-label="Map sections">
          {[
            ["routes", "Routes"],
            ["map", "Map"],
            ["directions", "Directions"],
            ["signals", "Signals"]
          ].map(([id, label]) => (
            <button
              key={id}
              className={mobileMapPanel === id ? "active" : ""}
              type="button"
              onClick={() => setMobileMapPanel(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tourStep < 4 && (
          <div className="guided-tip" role="status" aria-live="polite">
            <strong>{["Start with mood", "Compare evidence", "Use the map layers", "Save the route"][tourStep]}</strong>
            <span>{[
              "Pick the feeling you want the route to support.",
              "Cards explain distance, safety, noise, and confidence.",
              "Traffic and noise overlays show what changed the recommendation.",
              "Favorite or share a route to build weekly mood insights."
            ][tourStep]}</span>
            <button type="button" onClick={() => setTourStep(4)}>Done</button>
          </div>
        )}

        <section className="questionnaire" aria-label="Mood questionnaire">
          <div>
            <p className="kicker">Mood Questionnaire</p>
            <h3>Answer quickly and Route Mood will tune the route.</h3>
          </div>
          <label>
            How are you feeling?
            <select value={questionnaire.feeling} onChange={(event) => setQuestionnaire((prev) => ({ ...prev, feeling: event.target.value }))}>
              <option value="calm">Calm</option>
              <option value="stressed">Stressed</option>
              <option value="energetic">Energetic</option>
              <option value="romantic">Romantic</option>
              <option value="happy">Happy / Positive</option>
            </select>
          </label>
          <label>
            Quiet or social?
            <select value={questionnaire.environment} onChange={(event) => setQuestionnaire((prev) => ({ ...prev, environment: event.target.value }))}>
              <option value="quiet">Quiet</option>
              <option value="social">Social</option>
            </select>
          </label>
          <label>
            What matters most?
            <select value={questionnaire.intent} onChange={(event) => setQuestionnaire((prev) => ({ ...prev, intent: event.target.value }))}>
              <option value="nature">Nature</option>
              <option value="music">Music</option>
              <option value="food">Food</option>
              <option value="fast">Fast arrival</option>
            </select>
          </label>
          <button className="btn ghost" type="button" onClick={applyQuestionnaire}>Apply mood</button>
        </section>

        <div className="mood-switcher" role="tablist" aria-label="Mood selector">
          {moods.map((mood, idx) => (
            <button
              key={mood.id}
              id={`mood-tab-${mood.id}`}
              role="tab"
              aria-selected={activeMood === mood.id}
              aria-controls={`mood-panel-${mood.id}`}
              tabIndex={activeMood === mood.id ? 0 : -1}
              className={activeMood === mood.id ? "mood-chip active" : "mood-chip"}
              style={{ "--chip": mood.color || "#56d5b8" }}
              onClick={() => setActiveMood(mood.id)}
              onKeyDown={(event) => handleMoodKeyDown(event, idx)}
            >
              {mood.label}
            </button>
          ))}
        </div>

        <form className="query-row" onSubmit={handleRouteSubmit} noValidate>
          <label htmlFor="from-route" className="place-field">
            {t.from}
            <input
              id="from-route"
              ref={fromInputRef}
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setFromSearch(e.target.value);
                setActivePlaceField("from");
              }}
              onFocus={() => handlePlaceFocus("from")}
              placeholder="Choose a place in Tirana"
              aria-invalid={Boolean(formError && !from.trim())}
              autoComplete="off"
            />
          </label>
          <label htmlFor="to-route" className="place-field">
            {t.to}
            <input
              id="to-route"
              ref={toInputRef}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setToSearch(e.target.value);
                setActivePlaceField("to");
              }}
              onFocus={() => handlePlaceFocus("to")}
              placeholder="Choose a destination in Tirana"
              aria-invalid={Boolean(formError && !to.trim())}
              autoComplete="off"
            />
          </label>
          <label htmlFor="transport-route">
            {t.transport}
            <select id="transport-route" value={transport} onChange={(e) => setTransport(e.target.value)}>
              <option value="walking">Walking</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="transit">Transit</option>
            </select>
          </label>
          <button className="btn primary" type="submit" disabled={loadingRoutes || !from.trim() || !to.trim()}>
            {loadingRoutes ? t.loading : t.getRoutes}
          </button>
        </form>
        {activePlaceField && placeMenuPosition && (
          <div
            ref={placePickerRef}
            className="place-menu floating"
            style={{
              top: `${placeMenuPosition.top}px`,
              left: `${placeMenuPosition.left}px`,
              width: `${placeMenuPosition.width}px`
            }}
          >
            {(activePlaceField === "from" ? filteredFromGroups : filteredToGroups).map((group) => (
              <div key={group.label} className="place-group">
                <p>{group.label}</p>
                {group.places.map((place) => (
                  <button key={place} type="button" onMouseDown={() => choosePlace(activePlaceField, place)}>
                    {place}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
        {formError && <p className="form-error" role="alert">{formError}</p>}

        <div className="planner-tools primary-tools">
          <button className={pickMode === "start" ? "btn ghost active" : "btn ghost"} type="button" onClick={() => setPickMode("start")}>
            <Icon name="map" /> Pick Start
          </button>
          <button className={pickMode === "end" ? "btn ghost active" : "btn ghost"} type="button" onClick={() => setPickMode("end")}>
            <Icon name="map" /> Pick End
          </button>
          <button className="btn ghost" type="button" onClick={useMyLocation}>
            <Icon name="location" /> {t.useMyLocation}
          </button>
          <label className="tool-check"><input type="checkbox" checked={compareMode} onChange={() => setCompareMode((v) => !v)} /> {t.compare}</label>
          <details className="layers-drawer">
            <summary><Icon name="layers" /> Layers</summary>
            <div className="layers-panel">
              <div className="segmented" aria-label="Map style">
                <button className={mapStyle === "street" ? "active" : ""} type="button" onClick={() => setMapStyle("street")}>Street</button>
                <button className={mapStyle === "light" ? "active" : ""} type="button" onClick={() => setMapStyle("light")}>Light</button>
                <button className={mapStyle === "dark" ? "active" : ""} type="button" onClick={() => setMapStyle("dark")}>Dark</button>
              </div>
              <label className="tool-check"><input type="checkbox" checked={overlays.traffic} onChange={() => setOverlays((prev) => ({ ...prev, traffic: !prev.traffic }))} /> {t.trafficOverlay}</label>
              <label className="tool-check"><input type="checkbox" checked={overlays.noise} onChange={() => setOverlays((prev) => ({ ...prev, noise: !prev.noise }))} /> {t.noiseOverlay}</label>
              <div className="layer-group">
                <span>{t.avoidZones}</span>
                <label className="tool-check"><input type="checkbox" checked={avoid.crowded} onChange={() => toggleAvoid("crowded")} /> crowded</label>
                <label className="tool-check"><input type="checkbox" checked={avoid.noisy} onChange={() => toggleAvoid("noisy")} /> noisy</label>
                <label className="tool-check"><input type="checkbox" checked={avoid.highStress} onChange={() => toggleAvoid("highStress")} /> high stress</label>
              </div>
            </div>
          </details>
        </div>

        <div className="interactive-grid">
          <div className="map-shell">
            <div className="map-toolbar">
              <div>
                <strong>{activeRoute ? activeRoute.title : "Route preview"}</strong>
                <span>{activeRoute ? `ETA ${activeRoute.etaMinutes} min | Stress ${activeRoute.stressScore}/5` : "Select a route to focus it on the map."}</span>
              </div>
              <div className="map-toolbar-actions">
                <button className="btn ghost" type="button" onClick={() => activeRoute && focusRoute(activeRoute.id)} disabled={!activeRoute}>
                  Fit selected
                </button>
                <button className="btn ghost" type="button" onClick={fitAllRoutes} disabled={topSuggestions.length === 0}>
                  Show all
                </button>
              </div>
            </div>
            <div ref={mapRef} id="mood-map" />
            <div className="map-legend" aria-label="Map legend">
              <strong>Legend</strong>
              <span><i className="legend-dot high" /> High route confidence</span>
              <span><i className="legend-dot medium" /> Medium confidence</span>
              <span><i className="legend-dot low" /> Lower confidence</span>
              <span><i className="legend-dot traffic" /> Traffic pressure</span>
              <span><i className="legend-dot noise" /> Noise pressure</span>
              <span className="updated">Signals updated {lastUpdated}</span>
            </div>
          </div>

          <aside className="mood-info" id={`mood-panel-${activeMood}`} role="tabpanel" aria-labelledby={`mood-tab-${activeMood}`}>
            <div className="mood-summary">
              <h3>{scene?.label} Mode</h3>
              <p>Route style: {scene?.routeStyle || "Mood-aware route"}</p>
              <div className="spotify-card">
                {playlist?.imageUrl && <img src={playlist.imageUrl} alt="" />}
                <div>
                  <span>Spotify</span>
                  <strong>{playlist?.title || scene?.musicKeywords || "Mood playlist"}</strong>
                  <a
                    className="btn primary"
                    href={playlist?.url || `https://open.spotify.com/search/${encodeURIComponent(scene?.musicKeywords || "mood playlist")}/playlists`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open playlist
                  </a>
                </div>
              </div>
            </div>

            {activeRoute && (
              <div className="planner-tools mini route-action-bar">
                <button className="btn ghost" type="button" onClick={saveTrip}>{t.saveTrip}</button>
                <button className="btn ghost" type="button" onClick={() => favoriteRoute(activeRoute)}><Icon name="star" /> Favorite</button>
                <button className="btn ghost" type="button" onClick={shareTrip}><Icon name="share" /> {t.shareTrip}</button>
                <a className="btn primary" href={activeRoute.googleMapsUrl} target="_blank" rel="noreferrer"><Icon name="navigate" /> Navigate</a>
              </div>
            )}

            <div className="live-box">
              <h4>{t.liveSuggestions}</h4>
              {loadingRoutes && (
                <div className="live-skeletons" aria-hidden="true">
                  {[0, 1, 2].map((slot) => (
                    <article key={slot} className="live-item skeleton">
                      <div className="sk-line lg" />
                      <div className="sk-line md" />
                      <div className="sk-line sm" />
                    </article>
                  ))}
                </div>
              )}
              {!loadingRoutes && routeError && (
                <div className="live-state error" role="alert">
                  <p>{routeError}</p>
                  <button className="btn ghost" type="button" onClick={fetchSuggestions}>
                    {t.retry}
                  </button>
                </div>
              )}
              {!loadingRoutes && !routeError && topSuggestions.length === 0 && (
                <div className="live-state empty">
                  <p>{t.noSuggestions}</p>
                  <button className="btn ghost" type="button" onClick={fetchSuggestions}>
                    {t.refresh}
                  </button>
                </div>
              )}
              {!loadingRoutes && !routeError && topSuggestions.map((item) => (
                <article
                  key={item.id}
                  className={item.id === selectedRouteId ? "live-item selected" : "live-item"}
                >
                  <button className="route-select" type="button" onClick={() => focusRoute(item.id)}>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                    <div className="metric-row" aria-label={`${item.title} metrics`}>
                      <span className="metric-chip"><b>{item.etaMinutes}m</b> ETA</span>
                      <span className="metric-chip"><b>{estimateRouteDistance(item)}</b> Distance</span>
                      <span className="metric-chip"><b>{item.safetyScore ?? 82}</b> Safety</span>
                      <span className="metric-chip"><b>{item.noiseLevel ?? "Low"}</b> Noise</span>
                      <span className="metric-chip"><b>{Math.round((item.confidence || 0.8) * 100)}%</b> Confidence</span>
                    </div>
                  </button>
                  <ul className="route-reasons">
                    {routeReasons(item, scene?.label || "Mood").map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <div className="route-actions">
                    <button className="btn ghost" type="button" onClick={() => focusRoute(item.id)}>
                      Show on map
                    </button>
                    <a className="icon-link" href={item.googleMapsUrl} target="_blank" rel="noreferrer"><Icon name="navigate" /> Google Maps</a>
                  </div>
                </article>
              ))}
            </div>

            <div className="trend-box">
              <h4>{t.trend}</h4>
              <div className="trend-row">
                {moodTrend.map((point) => (
                  <div key={point.hour} className="trend-item">
                    <span>{point.hour}</span>
                    <strong>{point.score}</strong>
                  </div>
                ))}
              </div>
            </div>

            <SignalDisclosure lastUpdated={lastUpdated} />

            <div className="coach-box">
              <h4>AI Route Coach</h4>
              <textarea
                value={coachPrompt}
                onChange={(event) => setCoachPrompt(event.target.value)}
                placeholder="Example: I feel stressed and want a quiet route home."
                rows="3"
              />
              <button className="btn ghost" type="button" onClick={runCoach}>Suggest mood</button>
              {coachSuggestion && <p>{coachSuggestion}</p>}
            </div>

            <div className="directions-box">
              <h4>{t.directions}</h4>
              {!activeRoute && <p className="directions-empty">Select a route to see step-by-step guidance.</p>}
              {activeRoute && (
                <div className="directions-list">
                  {activeRouteSteps.map((step, index) => (
                    <article
                      key={step.id}
                      className={step.id === selectedStepId ? "direction-step selected" : "direction-step"}
                    >
                      <button className="direction-index" type="button" onClick={() => focusRouteStep(step.id)}>
                        <StepIcon icon={step.icon} />
                      </button>
                      <div>
                        <button className="direction-content" type="button" onClick={() => focusRouteStep(step.id)}>
                          <span className="direction-kicker">Step {index + 1}</span>
                          <strong>{step.title}</strong>
                          <p>{step.detail}</p>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {activeRoute && (
              <form className="route-feedback" onSubmit={submitRouteFeedback}>
                <div className="feedback-head">
                  <div>
                    <span className="feedback-kicker">Trip check-in</span>
                    <h4>Route Feedback</h4>
                  </div>
                  <p>Help Route Mood learn which streets actually fit your mood.</p>
                </div>

                <label className="feedback-field">
                  <span>Rating</span>
                  <select value={routeFeedback.rating} onChange={(event) => setRouteFeedback((prev) => ({ ...prev, rating: event.target.value }))}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Okay</option>
                    <option value="2">2 - Not good</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </label>

                <div className="feedback-toggles" aria-label="Route feedback options">
                  <label className="feedback-toggle">
                    <input type="checkbox" checked={routeFeedback.moodMatch} onChange={() => setRouteFeedback((prev) => ({ ...prev, moodMatch: !prev.moodMatch }))} />
                    <span>Matched my mood</span>
                  </label>
                  <label className="feedback-toggle">
                    <input type="checkbox" checked={routeFeedback.relaxing} onChange={() => setRouteFeedback((prev) => ({ ...prev, relaxing: !prev.relaxing }))} />
                    <span>Felt relaxing</span>
                  </label>
                  <label className="feedback-toggle">
                    <input type="checkbox" checked={routeFeedback.tooCrowded} onChange={() => setRouteFeedback((prev) => ({ ...prev, tooCrowded: !prev.tooCrowded }))} />
                    <span>Too crowded/noisy</span>
                  </label>
                </div>

                <label className="feedback-field">
                  <span>Feedback note</span>
                  <textarea
                    value={routeFeedback.comment}
                    onChange={(event) => setRouteFeedback((prev) => ({ ...prev, comment: event.target.value }))}
                    placeholder="What should Route Mood learn from this route?"
                    rows="3"
                  />
                </label>

                <div className="feedback-actions">
                  <button className="btn primary" type="submit">Send feedback</button>
                  {feedbackStatus && <p className="auth-ok">{feedbackStatus}</p>}
                </div>
              </form>
            )}

            {savedTrips.length > 0 && (
              <div className="saved-box">
                <h4>History and weekly insight</h4>
                <p className="insight">You were most calm on waterfront and park routes this week.</p>
                {savedTrips.slice(0, 3).map((trip) => (
                  <p key={trip.id}>{trip.routeTitle || "Recommended route"}: {trip.from} {"->"} {trip.to} ({trip.transport})</p>
                ))}
              </div>
            )}
            {favorites.length > 0 && (
              <div className="saved-box">
                <h4>Favorites</h4>
                {favorites.slice(0, 3).map((trip) => (
                  <p key={`${trip.id}-${trip.savedAt}`}>{trip.title}</p>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>

      <section id="trust" className={activePage === "trust" ? "tech page active" : "tech page"} aria-hidden={activePage !== "trust"}>
        <div className="page-title trust-hero">
          <div>
            <p className="kicker">Under The Hood</p>
            <h2>Trust the route before you take it.</h2>
            <p>See how recommendations are scored, what stays private, and which signals are live, estimated, or demo-only.</p>
          </div>
          <span className="trust-live-pill">Updated {lastUpdated}</span>
        </div>
        <div className="trust-summary">
          <article>
            <span className="trust-icon" aria-hidden="true">01</span>
            <h3>How mood scoring works</h3>
            <p>Each route blends selected mood, ETA, stress score, confidence, safety, traffic pressure, and noise signals. The top result is the best overall fit, not always the shortest path.</p>
          </article>
          <article>
            <span className="trust-icon" aria-hidden="true">02</span>
            <h3>Data privacy summary</h3>
            <p>Demo history, favorites, mood trends, and analytics are stored locally in this browser. Shared links include only route query fields.</p>
          </article>
          <article>
            <span className="trust-icon" aria-hidden="true">03</span>
            <h3>Live signal freshness</h3>
            <p>Traffic, noise, and confidence overlays show their latest refresh time in the map legend. Current demo signals last updated {lastUpdated}.</p>
          </article>
        </div>
        <div className="trust-pillars">
          {pillars.map((item) => (
            <article key={item.title} className="trust-pillar-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <SignalDisclosure lastUpdated={lastUpdated} />
      </section>

      <section id="insights" className={activePage === "insights" ? "tech page active" : "tech page"} aria-hidden={activePage !== "insights"}>
        <div className="page-title">
          <p className="kicker">Your Route Memory</p>
          <h2>History, favorites, and weekly mood insights.</h2>
          <p>Save routes from the map to turn one-off decisions into useful patterns.</p>
        </div>
        <div className="insight-dashboard">
          <article className="insight-card preferences-card">
            <h3>User preferences</h3>
            <label className="pref-field">
              Preferred transport
              <select value={transport} onChange={(event) => setTransport(event.target.value)}>
                <option value="walking">Walking</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="transit">Transit</option>
              </select>
            </label>
            <label className="pref-field">
              Preferred music style
              <input value={preferences.preferredMusicStyle} onChange={(event) => setPreferences((prev) => ({ ...prev, preferredMusicStyle: event.target.value }))} placeholder="lofi, pop, acoustic..." />
            </label>
            <label className="tool-check"><input type="checkbox" checked={avoid.crowded} onChange={() => toggleAvoid("crowded")} /> Avoid crowded places</label>
            <label className="tool-check"><input type="checkbox" checked={avoid.noisy} onChange={() => toggleAvoid("noisy")} /> Avoid noisy places</label>
            <label className="tool-check"><input type="checkbox" checked={avoid.highStress} onChange={() => toggleAvoid("highStress")} /> Avoid high-stress routes</label>
            <button className="btn primary" type="button" onClick={savePreferences}>Save preferences</button>
            {preferencesStatus && <p className="auth-ok">{preferencesStatus}</p>}
          </article>

          <article className="insight-card weekly-card">
            <div className="weekly-head">
              <div>
                <span className="insight-kicker">Weekly snapshot</span>
                <h3>{insightMetrics.topMood} routes are your strongest pattern.</h3>
              </div>
              <strong>{insightMetrics.totalSaved}</strong>
            </div>
            <p>You saved {insightMetrics.totalSaved} routes and favorited {insightMetrics.favoritesCount}. Your most used transport is {insightMetrics.topTransport}.</p>
            <div className="usage-rings" aria-label="Route usage summary">
              <div>
                <span>{insightMetrics.totalSaved}</span>
                <p>Saved</p>
              </div>
              <div>
                <span>{insightMetrics.favoritesCount}</span>
                <p>Favorites</p>
              </div>
              <div>
                <span>{insightMetrics.averageTrend}</span>
                <p>Mood score</p>
              </div>
            </div>
          </article>

          <article className="insight-card chart-card">
            <h3>Mood usage</h3>
            <div className="bar-list">
              {insightMetrics.moodBars.slice(0, 5).map((item) => (
                <div className="bar-row" key={item.id}>
                  <span>{item.label}</span>
                  <div className="bar-track"><i style={{ width: `${Math.max(12, (item.count / insightMetrics.maxMood) * 100)}%` }} /></div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="insight-card chart-card">
            <h3>Transport usage</h3>
            <div className="bar-list">
              {insightMetrics.transportBars.slice(0, 4).map((item) => (
                <div className="bar-row" key={item.id}>
                  <span>{item.label}</span>
                  <div className="bar-track"><i style={{ width: `${Math.max(12, (item.count / insightMetrics.maxTransport) * 100)}%` }} /></div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="insight-card list-card">
            <h3>Saved history</h3>
            {savedTrips.length === 0 && (
              <div className="empty-card">
                <p>No saved routes yet. Save one from the map page to start building trends.</p>
                <a className="btn ghost" href="#map">Open Map</a>
              </div>
            )}
            {savedTrips.slice(0, 5).map((trip) => (
              <p key={trip.id}><strong>{trip.routeTitle || "Recommended route"}</strong><span>{trip.from} {"->"} {trip.to}</span></p>
            ))}
          </article>
          <article className="insight-card list-card">
            <h3>Favorites</h3>
            {favorites.length === 0 && (
              <div className="empty-card">
                <p>No favorites yet. Favorite a route from the map page for quick access.</p>
                <a className="btn ghost" href="#map">Find Routes</a>
              </div>
            )}
            {favorites.slice(0, 5).map((trip) => (
              <p key={`${trip.id}-${trip.savedAt}`}><strong>{trip.title}</strong><span>{trip.from} {"->"} {trip.to}</span></p>
            ))}
          </article>
          <article className="insight-card trend-card">
            <h3>Mood trend</h3>
            <div className="trend-row">
              {moodTrend.map((point) => (
                <div key={point.hour} className="trend-item">
                  <i style={{ height: `${Math.max(18, Number(point.score || 0))}%` }} />
                  <span>{point.hour}</span>
                  <strong>{point.score}</strong>
                </div>
              ))}
            </div>
          </article>
          <article className="insight-card positive-card">
            <h3>Most positive routes in Tirana</h3>
            {(!adminStats?.topPositiveRoutes || adminStats.topPositiveRoutes.length === 0) && <p>Positive routes will appear after users rate trips 4 or 5 stars.</p>}
            {adminStats?.topPositiveRoutes?.map((route) => (
              <p key={`${route.routeTitle}-${route.moodId}`}><strong>{route.routeTitle}</strong><span>{route.avgRating}/5 from {route.count} ratings</span></p>
            ))}
          </article>
        </div>
      </section>

      <section id="admin" className={activePage === "admin" ? "tech page active" : "tech page"} aria-hidden={activePage !== "admin"}>
        <div className="page-title admin-hero">
          <div>
            <p className="kicker">Project Monitoring</p>
            <h2>Admin dashboard.</h2>
            <p>Track active users, route generation, satisfaction, mood demand, and feedback signals.</p>
          </div>
          <span className="admin-status-pill">{adminMetrics.statusText}</span>
        </div>
        {currentUser?.role !== "admin" ? (
          <div className="empty-card">
            <p>Admin access is available from the user dropdown after signing in with the admin account.</p>
            {!currentUser && <a className="btn primary" href="#login">Log In</a>}
          </div>
        ) : (
          <div className="admin-dashboard">
            <div className="admin-kpis">
              {adminMetrics.kpis.map((item) => (
                <article key={item.label} className="admin-kpi-card">
                  <div className="admin-kpi-top">
                    <span>{item.icon}</span>
                    <p>{item.label}</p>
                  </div>
                  <strong>{item.value}</strong>
                  <small>{item.hint}</small>
                  <div className="admin-progress" aria-hidden="true"><i style={{ width: `${Math.max(8, item.progress)}%` }} /></div>
                </article>
              ))}
            </div>

            <div className="admin-board">
              <article className="admin-panel mood-panel">
                <h3>Most selected moods</h3>
                {adminMetrics.moodBars.length === 0 && <p className="admin-empty">Mood demand appears after routes are generated.</p>}
                <div className="admin-bars">
                  {adminMetrics.moodBars.map((item) => (
                    <div className="admin-bar-row" key={item.id}>
                      <span>{item.label}</span>
                      <div><i style={{ width: `${Math.max(10, (item.count / adminMetrics.maxMoodCount) * 100)}%` }} /></div>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-panel positive-panel">
                <h3>Positive routes database</h3>
                {adminMetrics.positiveRoutes.length === 0 && <p className="admin-empty">Routes rated 4 or 5 stars will appear here.</p>}
                <div className="admin-route-list">
                  {adminMetrics.positiveRoutes.map((route, index) => (
                    <div className="admin-route-item" key={`${route.routeTitle}-${route.moodId}`}>
                      <span>#{index + 1}</span>
                      <div>
                        <strong>{route.routeTitle}</strong>
                        <p>{route.moodId} mood · {route.count} ratings</p>
                      </div>
                      <b>{route.avgRating}/5</b>
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-panel feedback-panel">
                <h3>Recent feedback</h3>
                {adminMetrics.recentFeedback.length === 0 && <p className="admin-empty">Recent route feedback will appear after users rate trips.</p>}
                <div className="admin-feedback-list">
                  {adminMetrics.recentFeedback.map((item, index) => (
                    <div className="admin-feedback-item" key={`${item.createdAt}-${index}`}>
                      <span>{item.rating}/5</span>
                      <div>
                        <strong>{item.routeTitle || `${item.moodId} route`}</strong>
                        <p>{item.comment || "No comment"}</p>
                      </div>
                      <time>{formatShortDate(item.createdAt)}</time>
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-panel ai-panel">
                <h3>Premium / AI readiness</h3>
                <p>The AI Route Coach is available as a rule-based preview and can later connect to an LLM for richer emotional route explanations.</p>
                <ul>
                  <li>Route coach preview active</li>
                  <li>Mood and feedback data available</li>
                  <li>LLM integration ready as a future upgrade</li>
                </ul>
              </article>
            </div>
          </div>
        )}
      </section>

      <section id="join" className={activePage === "join" ? "cta page active" : "cta page"} aria-hidden={activePage !== "join"}>
        <div className="page-title centered">
          <p className="kicker">Early Access</p>
          <h2>Help shape the future of mood-aware navigation.</h2>
          <p>Join early access or send feedback about what would make Route Mood more useful.</p>
        </div>
        <form className="waitlist-form" onSubmit={handleWaitlistSubmit}>
          <label htmlFor="waitlist-name">
            Name
            <input
              id="waitlist-name"
              value={waitlistForm.name}
              onChange={(event) => setWaitlistForm((prev) => ({ ...prev, name: event.target.value }))}
              autoComplete="name"
              required
            />
          </label>
          <label htmlFor="waitlist-email">
            Email
            <input
              id="waitlist-email"
              type="email"
              value={waitlistForm.email}
              onChange={(event) => setWaitlistForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
              required
            />
          </label>
          <label htmlFor="waitlist-message">
            Feedback
            <textarea
              id="waitlist-message"
              value={waitlistForm.message}
              onChange={(event) => setWaitlistForm((prev) => ({ ...prev, message: event.target.value }))}
              rows="6"
              maxLength="2000"
              required
            />
          </label>
          {waitlistError && <p className="form-error" role="alert">{waitlistError}</p>}
          {waitlistStatus && <p className="auth-ok" role="status">{waitlistStatus}</p>}
          <button className="btn primary" type="submit" disabled={waitlistBusy}>
            {waitlistBusy ? "Sending..." : "Send feedback"}
          </button>
        </form>
      </section>

      <section id="login" className={activePage === "login" && !authToken && !currentUser && !authChecking ? "auth-shell page active" : "auth-shell page"} aria-hidden={activePage !== "login" || Boolean(authToken || currentUser || authChecking)}>
        <div className="auth-card">
          <p className="kicker">{authMode === "login" ? "Welcome back" : "Create account"}</p>
          <h2>{authMode === "login" ? "Log in to Route Mood" : "Register for Route Mood"}</h2>
          {!currentUser && pendingPage && <p className="auth-gate-note">Log in to continue to {pendingPage}.</p>}
          <p className="privacy-note">Your route history, favorites, and demo analytics stay in this browser unless you choose to share a route link.</p>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <label htmlFor="auth-name">
                Name
                <input
                  id="auth-name"
                  value={authForm.name}
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, name: event.target.value }))}
                  autoComplete="name"
                  required
                />
              </label>
            )}
            <label htmlFor="auth-email">
              Email
              <input
                id="auth-email"
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                autoComplete="email"
                required
              />
            </label>
            <label htmlFor="auth-password">
              Password
              <input
                id="auth-password"
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>
            {authError && <p className="form-error" role="alert">{authError}</p>}
            {authOk && <p className="auth-ok" role="status">{authOk}</p>}
            <button className="btn primary" type="submit">
              {authMode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>
          <p className="auth-switch">
            {authMode === "login" ? "Need an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => {
              setAuthMode((mode) => (mode === "login" ? "register" : "login"));
              setAuthError("");
              setAuthOk("");
            }}>
              {authMode === "login" ? "Register" : "Log in"}
            </button>
          </p>
        </div>
      </section>
      </main>

      <footer className="footer" >
        <p>© 2026 Route Mood. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;


