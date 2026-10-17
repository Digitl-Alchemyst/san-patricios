import Image from "next/image";

export function MemberAvatar({
  handle,
  avatarUrl,
  size = 32,
}: {
  handle: string;
  avatarUrl?: string;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={handle}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-sp-green-dim text-sp-green"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      <span className="font-mono font-semibold uppercase">
        {handle.trim().charAt(0) || "?"}
      </span>
    </div>
  );
}
