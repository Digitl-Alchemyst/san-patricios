"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useCurrentMember() {
  return useQuery(api.members.current);
}

export function useMembersList() {
  return useQuery(api.members.list);
}
