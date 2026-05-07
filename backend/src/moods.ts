export type Mood = {
  id: string;
  label: string;
  color: string;
  musicKeywords: string;
  routeStyle: string;
};

const moods: Mood[] = [
  {
    id: "calm",
    label: "Calm",
    color: "#6fb1fc",
    musicKeywords: "lofi chill instrumental",
    routeStyle: "quiet streets and parks"
  },
  {
    id: "happy",
    label: "Happy",
    color: "#ffd166",
    musicKeywords: "happy upbeat pop",
    routeStyle: "lively streets and landmarks"
  },
  {
    id: "focused",
    label: "Focused",
    color: "#8ecae6",
    musicKeywords: "deep focus ambient",
    routeStyle: "fast and predictable roads"
  },
  {
    id: "energetic",
    label: "Energetic",
    color: "#ef476f",
    musicKeywords: "workout energetic edm",
    routeStyle: "active and scenic city roads"
  },
  {
    id: "stressed",
    label: "Stressed",
    color: "#9b5de5",
    musicKeywords: "meditation anti stress",
    routeStyle: "low-traffic, relaxing roads"
  }
];

export default moods;
