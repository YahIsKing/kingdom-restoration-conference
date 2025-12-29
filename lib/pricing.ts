// Pricing configuration - update these values with your Stripe price IDs and dates

export type RegistrationType = "conference" | "vendor";

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
    standard: {
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
    standard: {
      priceId: process.env.STRIPE_PRICE_VENDOR || "price_vendor_xxx",
      label: "Vendor Table",
      amount: 10000, // $100.00 - update with actual price
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

export function getVendorPrice() {
  return PRICING.vendor.standard;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getPriceId(type: RegistrationType): string {
  if (type === "vendor") {
    return getVendorPrice().priceId;
  }
  return getCurrentConferencePrice().priceId;
}
