export type FocusArea =
  | "Mutual Aid"
  | "Community Defense"
  | "Cultural Education"
  | "Anti-Racism & Solidarity"
  | "Decolonization"
  | "Direct Action Support";

export const FOCUS_AREAS: FocusArea[] = [
  "Mutual Aid",
  "Community Defense",
  "Cultural Education",
  "Anti-Racism & Solidarity",
  "Decolonization",
  "Direct Action Support",
];

export type OperationStatus = "Planning" | "Active" | "Completed" | "Archived";

export type CommsMessage = {
  id: string;
  author: string;
  body: string;
  postedAt: string;
};

export type Operation = {
  id: string;
  codename: string;
  objective: string;
  focusArea: FocusArea;
  status: OperationStatus;
  targetDate: string;
  resources: string[];
  participants: string[];
  comms: CommsMessage[];
};
