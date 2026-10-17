"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { FocusArea } from "@/models/types/operation";

export function useOperationsList() {
  return useQuery(api.operations.list);
}

export function useOperation(id: Id<"operations">) {
  return useQuery(api.operations.get, { id });
}

export function useCreateOperation() {
  return useMutation(api.operations.create);
}

export function useJoinOperation() {
  return useMutation(api.operations.join);
}

export function useAddOperationComment() {
  return useMutation(api.operations.addComment);
}

export type { FocusArea };
