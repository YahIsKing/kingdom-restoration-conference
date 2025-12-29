import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  RegistrationType,
  getCurrentConferencePrice,
  getVendorFullPrice,
  getVendorHalfPrice,
  isEarlyAccessPeriod,
  validateAccessCode,
} from "@/lib/pricing";

function getPriceData(registrationType: RegistrationType) {
  if (registrationType === "vendor-full") {
    const price = getVendorFullPrice();
    return {
      name: "Vendor Table – Full",
      description: "Full table in vendor area - KRC 2026",
      amount: price.amount,
    };
  }
  if (registrationType === "vendor-half") {
    const price = getVendorHalfPrice();
    return {
      name: "Vendor Table – Half",
      description: "Half table in vendor area - KRC 2026",
      amount: price.amount,
    };
  }
  const price = getCurrentConferencePrice();
  return {
    name: `Kingdom Restoration Conference 2026 (${price.label})`,
    description: "July 9-12, 2026 - Hilton Knoxville Airport",
    amount: price.amount,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, registrationType, accessCode } = body as {
      name: string;
      email: string;
      registrationType: RegistrationType;
      accessCode?: string;
    };

    if (!name || !email || !registrationType) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, registrationType" },
        { status: 400 }
      );
    }

    if (!["conference", "vendor-full", "vendor-half"].includes(registrationType)) {
      return NextResponse.json(
        { error: "Invalid registration type" },
        { status: 400 }
      );
    }

    // Validate access code during early access period
    if (isEarlyAccessPeriod() && !validateAccessCode(accessCode || "")) {
      return NextResponse.json(
        { error: "Invalid access code. Registration is currently limited to members only." },
        { status: 403 }
      );
    }

    const priceData = getPriceData(registrationType);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: priceData.name,
              description: priceData.description,
            },
            unit_amount: priceData.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      metadata: {
        customerName: name,
        registrationType,
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      allow_promotion_codes: true, // Enables member discount codes
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
