import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const USER_ID = "website-demo";

const trustStats = [
  { value: "100%", label: "Anonymous by default" },
  { value: "24h", label: "Mood expiry window" },
  { value: "AES-256", label: "Encrypted at rest" },
  { value: "K>=5", label: "Visibility threshold" }
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
  { id: "happy", label: "Happy", color: "#ffd166", musicKeywords: "happy upbeat pop", routeStyle: "Rruge te gjalla me energji" },
  { id: "focused", label: "Focused", color: "#60a5fa", musicKeywords: "deep focus ambient", routeStyle: "Rruge te drejta dhe te shpejta" },
  { id: "energetic", label: "Energetic", color: "#ef476f", musicKeywords: "energetic edm workout", routeStyle: "Skenike dhe dinamike" }
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
    trend: "Mood trend (next 3h)"
  },
};

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

function App() {
  const mapRef = useRef(null);
  const mapApiRef = useRef(null);
  const layersRef = useRef([]);
  const routeLayersRef = useRef({});
  const activeStepLayerRef = useRef(null);
  const routeSectionRef = useRef(null);
  const placePickerRef = useRef(null);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const pickModeRef = useRef("");

  const [moods, setMoods] = useState(fallbackMoods);
  const [activeMood, setActiveMood] = useState(localStorage.getItem("rm:mood") || "calm");
  const [from, setFrom] = useState(localStorage.getItem("rm:from") || "Skanderbeg Square, Tirana");
  const [to, setTo] = useState(localStorage.getItem("rm:to") || "Blloku, Tirana");
  const [transport, setTransport] = useState(localStorage.getItem("rm:transport") || "walking");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [formError, setFormError] = useState("");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [activePlaceField, setActivePlaceField] = useState("");
  const [placeMenuPosition, setPlaceMenuPosition] = useState(null);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [pickMode, setPickMode] = useState("");
  const [compareMode, setCompareMode] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedStepId, setSelectedStepId] = useState("");
  const [avoid, setAvoid] = useState({ crowded: false, noisy: false, highStress: false });
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
    pickModeRef.current = pickMode;
  }, [pickMode]);

  useEffect(() => {
    localStorage.setItem("rm:savedTrips", JSON.stringify(savedTrips));
  }, [savedTrips]);

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
    if (!window.L || !mapRef.current || mapApiRef.current || !mapVisible) return;
    const map = window.L.map(mapRef.current, { zoomControl: false }).setView([41.3275, 19.8187], 13);
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20
    }).addTo(map);

    map.on("click", (event) => {
      const activePickMode = pickModeRef.current;
      if (!activePickMode) return;
      const { lat, lng } = event.latlng;
      const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      if (activePickMode === "start") {
        setFrom(label);
        if (startMarkerRef.current) map.removeLayer(startMarkerRef.current);
        startMarkerRef.current = window.L.marker([lat, lng]).addTo(map).bindPopup("Start").openPopup();
      }
      if (activePickMode === "end") {
        setTo(label);
        if (endMarkerRef.current) map.removeLayer(endMarkerRef.current);
        endMarkerRef.current = window.L.marker([lat, lng]).addTo(map).bindPopup("Destination").openPopup();
      }
      setPickMode("");
    });

    mapApiRef.current = map;
  }, [mapVisible]);

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
    } catch (_error) {
      setSuggestions([]);
      setRouteError("Could not load live suggestions right now.");
    } finally {
      setLoadingRoutes(false);
    }
  }

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
      const line = window.L.polyline(coords, {
        color: isSelected ? scene.color || "#56d5b8" : "#8aa8ff",
        weight: isSelected ? 7 : 4,
        opacity: isSelected ? 0.98 : 0.12,
        dashArray: idx === 0 || isSelected ? "" : "6 8"
      }).addTo(map);
      line.bindPopup(`${item.title} | ETA ${item.etaMinutes} min | confidence ${Math.round((item.confidence || 0.8) * 100)}%`);
      line.on("click", () => setSelectedRouteId(item.id));
      layersRef.current.push(line);
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
  }, [scene, suggestions, topSuggestions, selectedRouteId, from, to]);

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
    const map = mapApiRef.current;
    const layer = routeLayersRef.current[routeId];
    if (!map || !layer) return;
    setSelectedRouteId(routeId);
    map.fitBounds(layer.getBounds(), { padding: [44, 44] });
    layer.openPopup();
  }

  function fitAllRoutes() {
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
        if (startMarkerRef.current) map.removeLayer(startMarkerRef.current);
        startMarkerRef.current = window.L.marker([lat, lng]).addTo(map).bindPopup("You are here").openPopup();
      },
      () => {
        setRouteError("Could not access your location.");
      }
    );
  }

  function toggleAvoid(key) {
    setAvoid((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function saveTrip() {
    const entry = {
      id: Date.now(),
      from,
      to,
      moodId: activeMood,
      transport,
      createdAt: new Date().toISOString()
    };
    setSavedTrips((prev) => [entry, ...prev].slice(0, 6));
  }

  async function shareTrip() {
    const params = new URLSearchParams({ from, to, mood: activeMood, transport }).toString();
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore clipboard errors
    }
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

  return (
    <div className="site">
      <header className="nav">
        <div className="brand">Route Mood</div>
        <button className="nav-toggle" type="button" onClick={() => setShowMobileNav((v) => !v)} aria-expanded={showMobileNav}>
          Menu
        </button>
        <nav className={showMobileNav ? "open" : ""}>
          <a href="#story">{t.story}</a>
          <a href="#interactive">{t.interactiveMap}</a>
          <a href="#tech">{t.technology}</a>
        </nav>
        <div className="nav-actions">
          <a className="nav-cta" href="#cta">{t.join}</a>
        </div>
      </header>

      <section className="hero">
        <p className="city">Now Live in Urban Beta</p>
        <h1>Emotional Navigation For Modern Cities</h1>
        <p>
          Route Mood is a mood-intelligence website experience that helps people understand how places feel before they choose how to move.
        </p>
        <div className="hero-actions">
          <a className="btn primary" href="#interactive">Try Mood Map</a>
          <a className="btn ghost" href="#tech">Explore Platform</a>
        </div>
      </section>

      <section className="feature-rail" aria-label="Features">
        {featuresAlb.map((item) => (
          <div key={item} className="rail-item">
            <span className="rail-bar" aria-hidden="true" />
            <p>{item}</p>
          </div>
        ))}
      </section>

      <section id="interactive" className="interactive" ref={routeSectionRef}>
        <div className="interactive-head">
          <p className="kicker">Interactive Mood Map</p>
          <h2>Change mood and see how the route changes.</h2>
          <p>Select a mood to explore emotional zones, route style, and live suggestions.</p>
        </div>

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

        <div className="planner-tools">
          <button className={pickMode === "start" ? "btn ghost active" : "btn ghost"} type="button" onClick={() => setPickMode("start")}>Pick Start</button>
          <button className={pickMode === "end" ? "btn ghost active" : "btn ghost"} type="button" onClick={() => setPickMode("end")}>Pick End</button>
          <button className="btn ghost" type="button" onClick={useMyLocation}>{t.useMyLocation}</button>
          <label className="tool-check"><input type="checkbox" checked={compareMode} onChange={() => setCompareMode((v) => !v)} /> {t.compare}</label>
        </div>

        <div className="planner-tools">
          <span>{t.avoidZones}:</span>
          <label className="tool-check"><input type="checkbox" checked={avoid.crowded} onChange={() => toggleAvoid("crowded")} /> crowded</label>
          <label className="tool-check"><input type="checkbox" checked={avoid.noisy} onChange={() => toggleAvoid("noisy")} /> noisy</label>
          <label className="tool-check"><input type="checkbox" checked={avoid.highStress} onChange={() => toggleAvoid("highStress")} /> high stress</label>
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
          </div>

          <aside className="mood-info" id={`mood-panel-${activeMood}`} role="tabpanel" aria-labelledby={`mood-tab-${activeMood}`}>
            <h3>{scene?.label} Mode</h3>
            <p>Route style: {scene?.routeStyle || "Mood-aware route"}</p>
            <p>Music suggestion: {scene?.musicKeywords || "mood playlist"}</p>
            <a
              className="btn primary"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(scene?.musicKeywords || "mood playlist")}`}
              target="_blank"
              rel="noreferrer"
            >
              Open playlist
            </a>

            <div className="planner-tools mini">
              <button className="btn ghost" type="button" onClick={saveTrip}>{t.saveTrip}</button>
              <button className="btn ghost" type="button" onClick={shareTrip}>{t.shareTrip}</button>
            </div>

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
                    <span>ETA {item.etaMinutes} min | Stress {item.stressScore}/5 | Confidence {Math.round((item.confidence || 0.8) * 100)}%</span>
                  </button>
                  <div className="route-actions">
                    <button className="btn ghost" type="button" onClick={() => focusRoute(item.id)}>
                      Show on map
                    </button>
                    <a href={item.googleMapsUrl} target="_blank" rel="noreferrer">Open external map</a>
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

            {savedTrips.length > 0 && (
              <div className="saved-box">
                <h4>Saved trips</h4>
                {savedTrips.slice(0, 3).map((trip) => (
                  <p key={trip.id}>{trip.from} {"->"} {trip.to} ({trip.transport})</p>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>

      <section id="story" className="story">
        <div>
          <p className="kicker">Why Route Mood</p>
          <h2>The city is not just roads. It is emotion in motion.</h2>
        </div>
        <p>
          Traditional navigation optimizes distance. Route Mood optimizes experience. We built this website to showcase a new navigation layer where people can choose routes that support focus, calm, confidence, or energy, depending on what the day demands.
        </p>
      </section>

      <section className="stats" aria-label="Trust metrics">
        {trustStats.map((item) => (
          <article key={item.label}>
            <h3>{item.value}</h3>
            <p>{item.label}</p>
          </article>
        ))}
      </section>

      <section id="tech" className="tech">
        <p className="kicker">Under The Hood</p>
        <h2>Engineered for trust, built for scale.</h2>
        <div className="grid">
          {pillars.map((item) => (
            <article key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="cta" className="cta">
        <h2>Help shape the future of mood-aware navigation.</h2>
        <p>Join early access to test new city zones, route styles, and emotional signal layers.</p>
        <a className="btn primary" href="mailto:hello@routemood.com">hello@routemood.com</a>
      </section>

      <footer className="footer">
        <p>Route Mood</p>
        <p>Privacy-first emotional intelligence for mobility.</p>
        <p>© 2026 Route Mood. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
