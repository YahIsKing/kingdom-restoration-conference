import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "KRC2026Admin";

export async function GET(request: NextRequest) {
  // Simple password auth via header
  const authHeader = request.headers.get("x-admin-password");
  if (authHeader !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe();

    // Fetch all completed checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: "complete",
      expand: ["data.line_items"],
    });

    // Also check for refunded payments by getting payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });

    // Create a map of refunded/canceled payment intents
    const refundedPayments = new Set<string>();
    for (const pi of paymentIntents.data) {
      if (pi.status === "canceled" || (pi.amount_received > 0 && pi.amount_received < pi.amount)) {
        refundedPayments.add(pi.id);
      }
    }

    // Get full refund info
    const refunds = await stripe.refunds.list({ limit: 100 });
    const fullRefundedIntents = new Set<string>();
    for (const refund of refunds.data) {
      if (refund.status === "succeeded" && refund.payment_intent) {
        fullRefundedIntents.add(refund.payment_intent as string);
      }
    }

    // Transform sessions into registration data
    const registrations = sessions.data
      .filter((session) => {
        // Exclude fully refunded sessions
        if (session.payment_intent && fullRefundedIntents.has(session.payment_intent as string)) {
          return false;
        }
        return true;
      })
      .map((session) => {
        const metadata = session.metadata || {};
        const isPartialRefund = session.payment_intent && refundedPayments.has(session.payment_intent as string);

        return {
          id: session.id,
          created: session.created * 1000, // Convert to JS timestamp
          firstName: metadata.firstName || "",
          familyName: metadata.familyName || "",
          email: session.customer_email || "",
          phone: metadata.phone || "",
          state: metadata.state || "",
          registrationType: metadata.registrationType || "conference",
          tshirts: metadata.tshirts || "[]",
          dietaryPreference: metadata.dietaryPreference || "",
          allergies: metadata.allergies || "",
          addOns: metadata.addOns || "{}",
          amountPaid: session.amount_total || 0,
          paymentStatus: isPartialRefund ? "partial_refund" : "paid",
        };
      });

    // Calculate stats
    const stats = calculateStats(registrations);

    return NextResponse.json({ registrations, stats });
  } catch (error) {
    console.error("Failed to fetch registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

interface Registration {
  tshirts: string;
  dietaryPreference: string;
  addOns: string;
  registrationType: string;
}

function calculateStats(registrations: Registration[]) {
  const dietary: Record<string, number> = {};
  const tshirtSizes: Record<string, number> = {};
  const tshirtColors: Record<string, number> = {};
  const addOnTotals: Record<string, number> = {};
  let conferenceCount = 0;
  let vendorCount = 0;

  for (const reg of registrations) {
    // Count registration types
    if (reg.registrationType === "conference") {
      conferenceCount++;
    } else if (reg.registrationType.startsWith("vendor")) {
      vendorCount++;
    }

    // Dietary
    if (reg.dietaryPreference) {
      dietary[reg.dietaryPreference] = (dietary[reg.dietaryPreference] || 0) + 1;
    }

    // T-shirts
    try {
      const tshirts = JSON.parse(reg.tshirts || "[]");
      for (const t of tshirts) {
        if (t.size) tshirtSizes[t.size] = (tshirtSizes[t.size] || 0) + 1;
        if (t.color) tshirtColors[t.color] = (tshirtColors[t.color] || 0) + 1;
      }
    } catch {
      // ignore parse errors
    }

    // Add-ons
    try {
      const addOns = JSON.parse(reg.addOns || "{}");
      for (const [key, qty] of Object.entries(addOns)) {
        if (typeof qty === "number" && qty > 0) {
          addOnTotals[key] = (addOnTotals[key] || 0) + qty;
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  return {
    totalRegistrations: registrations.length,
    conferenceCount,
    vendorCount,
    dietary,
    tshirtSizes,
    tshirtColors,
    addOnTotals,
  };
}
