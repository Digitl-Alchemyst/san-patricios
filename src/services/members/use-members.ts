"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useCurrentMember() {
  return useQuery(api.members.current);
}

export function useMembersList() {
  return useQuery(api.members.list);
}

export function useUpdateProfile() {
  return useMutation(api.members.updateProfile);
}
