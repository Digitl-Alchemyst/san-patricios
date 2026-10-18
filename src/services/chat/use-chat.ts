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

export function useUpdateChannelSettings() {
  return useMutation(api.chat.updateChannelSettings);
}

export function useDeleteChatMessage() {
  return useMutation(api.chat.deleteMessage);
}

export function useTimeoutMember() {
  return useMutation(api.chat.timeoutMember);
}

export function useRemoveTimeout() {
  return useMutation(api.chat.removeTimeout);
}

export function useChannelTimeouts(channelId: Id<"chatChannels">) {
  return useQuery(api.chat.listTimeouts, { channelId });
}
