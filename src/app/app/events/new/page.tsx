import { NewEventForm } from "@/components/secure/new-event-form";

export default function NewEventPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-sp-gold">
          Events
        </p>
        <h1 className="mt-2 text-2xl font-bold text-bone">New Event</h1>
        <p className="mt-2 text-sm text-smoke">
          Visible to every member the moment you create it.
        </p>
      </div>

      <NewEventForm />
    </div>
  );
}
