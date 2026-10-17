export type ChatChannel = {
  id: string;
  name: string;
  topic: string;
};

export type ChatMessage = {
  id: string;
  channelId: string;
  author: string;
  body: string;
  postedAt: string;
};
