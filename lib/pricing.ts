// Pricing configuration - just update these values to change prices

export type RegistrationType = "conference" | "vendor-full" | "vendor-half";

// Early access codes for members-only period (before public early bird)
const EARLY_ACCESS_CODES = ["PwP2026!", "MAXPOTENTIA26!"];

// Public registration opens Jan 18, 2026
// Before this date, an access code is required
const PUBLIC_REGISTRATION_DATE = new Date("2026-01-18T00:00:00");

export function isEarlyAccessPeriod(): boolean {
  return new Date() < PUBLIC_REGISTRATION_DATE;
}

export function validateAccessCode(code: string): boolean {
  return EARLY_ACCESS_CODES.includes(code);
}

interface PricingWindow {
  label: string;
  amount: number; // in cents (e.g., 15000 = $150.00)
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
      label: string;
      amount: number;
    };
    half: {
      label: string;
      amount: number;
    };
  };
}

// ============================================================
// UPDATE PRICES HERE - no Stripe Dashboard changes needed!
// ============================================================
// Timeline:
//   Launch:     ~Jan 4, 2026
//   Early Bird: Jan 18 - Feb 1, 2026
//   Regular:    Feb 1 - May 24, 2026
//   Late:       May 24 - July 9, 2026 (conference)
// ============================================================
export const PRICING: PricingConfig = {
  conference: {
    earlyBird: {
      label: "Early Bird",
      amount: 15000, // $150.00 - UPDATE WITH ACTUAL PRICE
      deadline: new Date("2026-02-01T00:00:00"), // Early bird ends Feb 1
    },
    regular: {
      label: "Regular",
      amount: 20000, // $200.00 - UPDATE WITH ACTUAL PRICE
      deadline: new Date("2026-05-24T00:00:00"), // Regular ends May 24
    },
    late: {
      label: "Late Registration",
      amount: 25000, // $250.00 - UPDATE WITH ACTUAL PRICE
      deadline: new Date("2026-07-09T00:00:00"), // Conference starts July 9
    },
  },
  vendor: {
    full: {
      label: "Full Table",
      amount: 5000, // $50.00
    },
    half: {
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
