// Approximate relative positions within a continental-US bounding box
// (-125..-66 longitude, 24..49 latitude), projected onto a 700x420 viewBox.
// Decorative, not survey-accurate — good enough to show relative spread.
export type PresenceCity = {
  name: string;
  state: string;
  x: number;
  y: number;
  labelSide?: "left" | "right";
};

export const PRESENCE_CITIES: PresenceCity[] = [
  { name: "Los Angeles", state: "CA", x: 80, y: 251 },
  { name: "San Francisco", state: "CA", x: 31, y: 189 },
  { name: "Tucson", state: "AZ", x: 167, y: 282 },
  { name: "El Paso", state: "TX", x: 220, y: 290 },
  { name: "Albuquerque", state: "NM", x: 218, y: 234 },
  { name: "Denver", state: "CO", x: 237, y: 156 },
  { name: "San Antonio", state: "TX", x: 315, y: 329 },
  { name: "Chicago", state: "IL", x: 443, y: 120 },
  { name: "Boston", state: "MA", x: 640, y: 112, labelSide: "left" },
  { name: "Philadelphia", state: "PA", x: 591, y: 152, labelSide: "left" },
];
