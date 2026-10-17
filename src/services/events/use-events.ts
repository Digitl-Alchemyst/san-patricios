"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function useEventsList() {
  return useQuery(api.events.list);
}

export function useCreateEvent() {
  return useMutation(api.events.create);
}

export function useToggleEventRsvp() {
  return useMutation(api.events.toggleRsvp);
}

export function useSetEventStatus() {
  return useMutation(api.events.setStatus);
}

export type { Id };
