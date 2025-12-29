"use client";

import { useEffect, useState } from "react";

export default function SpotsBadge() {
  const [spots, setSpots] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSpots() {
      try {
        const res = await fetch("/api/spots");
        const data = await res.json();
        setSpots(data.spots);
      } catch (error) {
        console.error("Failed to fetch spots:", error);
        setSpots(200); // Fallback
      }
    }
    fetchSpots();
  }, []);

  if (spots === null) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-4 py-2 text-sm font-medium text-olive">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-olive opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-olive"></span>
        </span>
        Loading...
      </div>
    );
  }

  if (spots <= 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </span>
        Sold Out
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-4 py-2 text-sm font-medium text-olive">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-olive"></span>
      </span>
      {spots} Spots Available
    </div>
  );
}
