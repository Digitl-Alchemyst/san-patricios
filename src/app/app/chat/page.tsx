"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatChannels } from "@/services/chat/use-chat";

export default function ChatIndexPage() {
  const router = useRouter();
  const channels = useChatChannels();

  useEffect(() => {
    if (channels && channels.length > 0) {
      router.replace(`/app/chat/${channels[0]._id}`);
    }
  }, [channels, router]);

  return <p className="text-sm text-smoke">Loading…</p>;
}
