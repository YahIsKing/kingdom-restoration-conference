import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getSpotsRemaining(): Promise<number> {
  return await convex.query(api.spots.get);
}

export async function decrementSpots(): Promise<number> {
  return await convex.mutation(api.spots.decrement);
}

export async function setSpots(count: number): Promise<number> {
  return await convex.mutation(api.spots.set, { value: count });
}
