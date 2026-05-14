"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSpotifyPlaylist = findSpotifyPlaylist;
let cachedToken = null;
function spotifySearchUrl(query) {
    return `https://open.spotify.com/search/${encodeURIComponent(query)}/playlists`;
}
async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret)
        return "";
    if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
        return cachedToken.accessToken;
    }
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ grant_type: "client_credentials" })
    });
    if (!response.ok)
        return "";
    const data = await response.json();
    if (!data.access_token)
        return "";
    cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (Number(data.expires_in || 3600) * 1000)
    };
    return cachedToken.accessToken;
}
async function findSpotifyPlaylist(query) {
    const safeQuery = query.trim() || "mood playlist";
    const fallback = {
        provider: "spotify",
        url: spotifySearchUrl(safeQuery),
        title: `Spotify playlists for ${safeQuery}`,
        source: "spotify-search"
    };
    const token = await getSpotifyToken();
    if (!token)
        return fallback;
    const params = new URLSearchParams({
        q: safeQuery,
        type: "playlist",
        limit: "1",
        market: "US"
    });
    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok)
        return fallback;
    const data = await response.json();
    const playlist = data.playlists?.items?.find((item) => item?.external_urls?.spotify);
    if (!playlist?.external_urls?.spotify)
        return fallback;
    return {
        provider: "spotify",
        url: playlist.external_urls.spotify,
        title: playlist.name || fallback.title,
        imageUrl: playlist.images?.[0]?.url,
        source: "spotify-api"
    };
}
