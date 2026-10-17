import { EditProfileForm } from "@/components/secure/edit-profile-form";

export default function ProfilePage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-sp-gold">
          Profile
        </p>
        <h1 className="mt-2 text-2xl font-bold text-bone">Edit Your Profile</h1>
        <p className="mt-2 text-sm text-smoke">
          Visible to other members in the directory and alongside your chat
          messages.
        </p>
      </div>

      <EditProfileForm />
    </div>
  );
}
