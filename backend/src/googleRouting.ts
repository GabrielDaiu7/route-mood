type DirectionsResponse = {
  routes?: Array<{
    overview_polyline?: { points?: string };
    legs?: Array<{ duration?: { value?: number }; distance?: { value?: number } }>;
  }>;
};

function decodePolyline(encoded: string): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    coordinates.push([lat / 100000, lng / 100000]);
  }

  return coordinates;
}

export async function getGoogleRoute({ from, to, transport }: { from: string; to: string; transport: string }) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const modeByTransport: Record<string, string> = {
    walking: "walking",
    bike: "bicycling",
    car: "driving",
    transit: "transit"
  };

  const params = new URLSearchParams({
    origin: from,
    destination: to,
    mode: modeByTransport[transport] || "walking",
    key: apiKey
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);
  if (!response.ok) return null;

  const data = await response.json() as DirectionsResponse;
  const route = data.routes?.[0];
  const points = route?.overview_polyline?.points;
  if (!points) return null;

  const coords = decodePolyline(points);
  if (coords.length < 2) return null;

  const leg = route.legs?.[0];
  return {
    coords,
    etaMinutes: leg?.duration?.value ? Math.max(1, Math.round(leg.duration.value / 60)) : undefined,
    distanceKm: leg?.distance?.value ? Number((leg.distance.value / 1000).toFixed(1)) : undefined
  };
}
