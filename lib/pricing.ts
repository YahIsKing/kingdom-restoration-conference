// Pricing configuration - update these values with your Stripe price IDs and dates

export type RegistrationType = "conference" | "vendor-full" | "vendor-half";

interface PricingWindow {
  priceId: string;
  label: string;
  amount: number; // in cents for display purposes
  deadline: Date;
}

interface PricingConfig {
  conference: {
    earlyBird: PricingWindow;
    regular: PricingWindow;
    late: PricingWindow;
  };
  vendor: {
    full: {
      priceId: string;
      label: string;
      amount: number;
    };
    half: {
      priceId: string;
      label: string;
      amount: number;
    };
  };
}

// TODO: Update with actual Stripe price IDs and amounts
export const PRICING: PricingConfig = {
  conference: {
    earlyBird: {
      priceId: process.env.STRIPE_PRICE_EARLY_BIRD || "price_earlybird_xxx",
      label: "Early Bird",
      amount: 15000, // $150.00 - update with actual price
      deadline: new Date("2026-03-01T00:00:00"),
    },
    regular: {
      priceId: process.env.STRIPE_PRICE_REGULAR || "price_regular_xxx",
      label: "Regular",
      amount: 20000, // $200.00 - update with actual price
      deadline: new Date("2026-06-01T00:00:00"),
    },
    late: {
      priceId: process.env.STRIPE_PRICE_LATE || "price_late_xxx",
      label: "Late Registration",
      amount: 25000, // $250.00 - update with actual price
      deadline: new Date("2026-07-09T00:00:00"),
    },
  },
  vendor: {
    full: {
      priceId: process.env.STRIPE_PRICE_VENDOR_FULL || "price_vendor_full_xxx",
      label: "Full Table",
      amount: 5000, // $50.00
    },
    half: {
      priceId: process.env.STRIPE_PRICE_VENDOR_HALF || "price_vendor_half_xxx",
      label: "Half Table",
      amount: 2500, // $25.00
    },
  },
};

export function getCurrentConferencePrice(): PricingWindow {
  const now = new Date();

  if (now < PRICING.conference.earlyBird.deadline) {
    return PRICING.conference.earlyBird;
  }

  if (now < PRICING.conference.regular.deadline) {
    return PRICING.conference.regular;
  }

  return PRICING.conference.late;
}

export function getVendorFullPrice() {
  return PRICING.vendor.full;
}

export function getVendorHalfPrice() {
  return PRICING.vendor.half;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getPriceId(type: RegistrationType): string {
  if (type === "vendor-full") {
    return getVendorFullPrice().priceId;
  }
  if (type === "vendor-half") {
    return getVendorHalfPrice().priceId;
  }
  return getCurrentConferencePrice().priceId;
}
