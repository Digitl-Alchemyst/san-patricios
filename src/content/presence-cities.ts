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
  { name: "Sacramento", state: "CA", x: 42, y: 175 },
  { name: "Los Angeles", state: "CA", x: 80, y: 251 },
  { name: "Denver", state: "CO", x: 237, y: 156 },
  { name: "Minneapolis", state: "MN", x: 372, y: 64, labelSide: "left" },
  { name: "St. Paul", state: "MN", x: 388, y: 76 },
  { name: "Hot Springs", state: "AR", x: 379, y: 244 },
  { name: "Jackson", state: "MS", x: 413, y: 281 },
  { name: "New Orleans", state: "LA", x: 415, y: 320 },
  { name: "Jacksonville", state: "FL", x: 514, y: 314 },
  { name: "Philadelphia", state: "PA", x: 591, y: 152, labelSide: "left" },
];
