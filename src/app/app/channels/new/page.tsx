import { NewChannelForm } from "@/components/secure/new-channel-form";

export default function NewChannelPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-sp-gold">
          Group Chat
        </p>
        <h1 className="mt-2 text-2xl font-bold text-bone">New Channel</h1>
        <p className="mt-2 text-sm text-smoke">
          Visible to every member in the channel list the moment you create it.
        </p>
      </div>

      <NewChannelForm />
    </div>
  );
}
