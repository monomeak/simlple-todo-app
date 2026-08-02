"use client";

import type { FireworkBurst } from "../../lib/dashboard/dashboard-types";

export default function FireworksLayer({ bursts }: { bursts: FireworkBurst[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="firework-burst"
          style={
            {
              left: `${burst.x}%`,
              top: `${burst.y}%`,
              "--firework-hue": burst.hue,
            } as React.CSSProperties
          }
        >
          <span className="firework-core" />
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={`${burst.id}-${index}`}
              className="firework-particle"
              style={
                {
                  "--particle-rotate": `${index * 30}deg`,
                  animationDelay: `${(index % 4) * 25}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
