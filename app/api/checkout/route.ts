import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  getCurrentConferencePrice,
  getVendorFullPrice,
  getVendorHalfPrice,
  isEarlyAccessPeriod,
  validateAccessCode,
} from "@/lib/pricing";
import { ADD_ONS, type RegistrationData } from "@/lib/products";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is the new multi-step registration or legacy
    const isMultiStep = body.firstName !== undefined;

    if (isMultiStep) {
      return handleMultiStepCheckout(body as RegistrationData);
    } else {
      return handleLegacyCheckout(body);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

async function handleMultiStepCheckout(data: RegistrationData) {
  const {
    firstName,
    familyName,
    email,
    phone,
    state,
    addOns,
    tshirts,
    dietaryPreference,
    allergies,
    accessCode,
  } = data;

  // Validate required fields
  if (!firstName || !familyName || !email || !phone || !state) {
    return NextResponse.json(
      { error: "Missing required fields" },
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

  const conferencePrice = getCurrentConferencePrice();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Base registration
  lineItems.push({
    price_data: {
      currency: "usd",
      product_data: {
        name: `Kingdom Restoration Conference 2026 (${conferencePrice.label})`,
        description: "Family registration - includes 1 dinner, 1 lunch, 1 t-shirt",
      },
      unit_amount: conferencePrice.amount,
    },
    quantity: 1,
  });

  // Add-ons
  for (const addon of ADD_ONS) {
    const qty = addOns[addon.id] || 0;
    if (qty > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: addon.name,
            description: addon.description,
          },
          unit_amount: addon.price,
        },
        quantity: qty,
      });
    }
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    customer_email: email,
    metadata: {
      customerName: `${firstName} ${familyName}`,
      firstName,
      familyName,
      phone,
      state,
      registrationType: "conference",
      tshirts: JSON.stringify(tshirts),
      dietaryPreference,
      allergies: allergies || "",
      addOns: JSON.stringify(addOns),
    },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/?canceled=true`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}

// Legacy checkout for vendor registrations
async function handleLegacyCheckout(body: {
  name: string;
  email: string;
  registrationType: string;
  accessCode?: string;
}) {
  const { name, email, registrationType, accessCode } = body;

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

  let priceData;
  if (registrationType === "vendor-full") {
    const price = getVendorFullPrice();
    priceData = {
      name: "Vendor Table – Full",
      description: "Full table in vendor area - KRC 2026",
      amount: price.amount,
    };
  } else if (registrationType === "vendor-half") {
    const price = getVendorHalfPrice();
    priceData = {
      name: "Vendor Table – Half",
      description: "Half table in vendor area - KRC 2026",
      amount: price.amount,
    };
  } else {
    const price = getCurrentConferencePrice();
    priceData = {
      name: `Kingdom Restoration Conference 2026 (${price.label})`,
      description: "July 9-12, 2026 - Hilton Knoxville Airport",
      amount: price.amount,
    };
  }

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
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
