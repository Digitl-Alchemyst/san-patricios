import { NewOperationForm } from "@/components/secure/new-operation-form";

export default function NewOperationPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-arm-gold">
          Operations
        </p>
        <h1 className="mt-2 text-2xl font-bold text-bone">New Operation</h1>
        <p className="mt-2 text-sm text-smoke">
          Visible to every member the moment you create it.
        </p>
      </div>

      <NewOperationForm />
    </div>
  );
}
