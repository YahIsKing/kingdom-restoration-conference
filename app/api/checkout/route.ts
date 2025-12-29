import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getPriceId, RegistrationType } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, registrationType } = body as {
      name: string;
      email: string;
      registrationType: RegistrationType;
    };

    if (!name || !email || !registrationType) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, registrationType" },
        { status: 400 }
      );
    }

    if (!["conference", "vendor"].includes(registrationType)) {
      return NextResponse.json(
        { error: "Invalid registration type" },
        { status: 400 }
      );
    }

    const priceId = getPriceId(registrationType);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
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
