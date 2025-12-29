import { kv } from "@vercel/kv";

const SPOTS_KEY = "spots_remaining";
const TOTAL_SPOTS = 200;

export async function getSpotsRemaining(): Promise<number> {
  try {
    const spots = await kv.get<number>(SPOTS_KEY);
    // If not set yet, initialize to total spots
    if (spots === null) {
      await kv.set(SPOTS_KEY, TOTAL_SPOTS);
      return TOTAL_SPOTS;
    }
    return spots;
  } catch (error) {
    console.error("Error getting spots:", error);
    // Fallback if KV is not configured
    return TOTAL_SPOTS;
  }
}

export async function decrementSpots(): Promise<number> {
  try {
    const newCount = await kv.decr(SPOTS_KEY);
    return Math.max(0, newCount);
  } catch (error) {
    console.error("Error decrementing spots:", error);
    return -1;
  }
}

// Admin function to reset or set spots (useful for testing)
export async function setSpots(count: number): Promise<void> {
  await kv.set(SPOTS_KEY, count);
}
