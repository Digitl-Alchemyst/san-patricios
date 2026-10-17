import { PRESENCE_CITIES } from "@/content/presence-cities";

export function PresenceMap() {
  return (
    <div className="rounded-sm border border-border bg-surface p-6">
      <svg
        viewBox="0 0 700 420"
        className="h-auto w-full"
        role="img"
        aria-label="Map of continental US cities where the movement is active on the ground"
      >
        <defs>
          <pattern id="presence-grid" width="35" height="35" patternUnits="userSpaceOnUse">
            <path d="M 35 0 L 0 0 0 35" fill="none" className="stroke-border" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="700" height="420" fill="url(#presence-grid)" opacity="0.5" />
        <rect x="1" y="1" width="698" height="418" fill="none" className="stroke-border" />

        {PRESENCE_CITIES.map((city) => {
          const isLeft = city.labelSide === "left";
          return (
            <g key={`${city.name}-${city.state}`}>
              <circle cx={city.x} cy={city.y} r="9" className="fill-sp-green" opacity="0.25" />
              <circle cx={city.x} cy={city.y} r="4" className="fill-sp-green-glow" />
              <text
                x={city.x + (isLeft ? -10 : 10)}
                y={city.y + 4}
                textAnchor={isLeft ? "end" : "start"}
                fontSize="13"
                className="fill-bone font-mono"
              >
                {city.name}, {city.state}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
