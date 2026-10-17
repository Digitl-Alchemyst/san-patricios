"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function useChatChannels() {
  return useQuery(api.chat.listChannels);
}

export function useChatMessages(channelId: Id<"chatChannels">) {
  return useQuery(api.chat.listMessages, { channelId });
}

export function useRecentChatMessages() {
  return useQuery(api.chat.recentMessages);
}

export function useSendChatMessage() {
  return useMutation(api.chat.sendMessage);
}

export function useCreateChatChannel() {
  return useMutation(api.chat.createChannel);
}
