"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SpotsBadge() {
  const spots = useQuery(api.spots.get);

  if (spots === undefined) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-6 py-3 font-medium text-olive">
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
      <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-6 py-3 font-medium text-red-700">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </span>
        Sold Out
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-6 py-3 font-medium text-olive">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-olive"></span>
      </span>
      {spots} Spots Available
    </div>
  );
}
