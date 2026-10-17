export type EventType = "Training" | "Mutual Aid" | "Direct Action" | "Patrol" | "Other";

export const EVENT_TYPES: EventType[] = [
  "Training",
  "Mutual Aid",
  "Direct Action",
  "Patrol",
  "Other",
];

export type EventStatus = "scheduled" | "cancelled" | "completed";
