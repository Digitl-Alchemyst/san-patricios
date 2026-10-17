export type FocusArea =
  | "Mutual Aid"
  | "Direct Action Support"
  | "Media & Awareness"
  | "Digital Security"
  | "Community Defense";

export const FOCUS_AREAS: FocusArea[] = [
  "Mutual Aid",
  "Direct Action Support",
  "Media & Awareness",
  "Digital Security",
  "Community Defense",
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
