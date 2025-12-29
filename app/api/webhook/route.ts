import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendConfirmationEmail } from "@/lib/email";
import { formatPrice } from "@/lib/pricing";
import { decrementSpots, saveRegistration } from "@/lib/spots";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_email || "";
    const customerName = session.metadata?.customerName || "Attendee";
    const registrationType = (session.metadata?.registrationType || "conference") as
      | "conference"
      | "vendor-full"
      | "vendor-half";
    const amountPaid = session.amount_total
      ? formatPrice(session.amount_total)
      : "N/A";

    // Extract additional metadata
    const firstName = session.metadata?.firstName || "";
    const familyName = session.metadata?.familyName || "";
    const phone = session.metadata?.phone || "";
    const state = session.metadata?.state || "";
    const tshirts = session.metadata?.tshirts || "[]";
    const dietaryPreference = session.metadata?.dietaryPreference || "";
    const allergies = session.metadata?.allergies || "";
    const addOns = session.metadata?.addOns || "{}";

    // Decrement available spots for conference registrations (not vendors)
    if (registrationType === "conference") {
      const remaining = await decrementSpots();
      console.log(`Spots remaining: ${remaining}`);
    }

    // Save registration to Convex
    try {
      await saveRegistration({
        firstName,
        familyName,
        email: customerEmail,
        phone,
        state,
        registrationType,
        tshirts,
        dietaryPreference,
        allergies,
        addOns,
        amountPaid,
        stripeSessionId: session.id,
      });
      console.log(`Registration saved to Convex for ${customerEmail}`);
    } catch (saveError) {
      console.error("Failed to save registration:", saveError);
      // Don't fail the webhook - the payment was successful
    }

    // Send confirmation email
    if (customerEmail) {
      try {
        await sendConfirmationEmail({
          to: customerEmail,
          name: customerName,
          registrationType: registrationType.startsWith("vendor") ? "vendor" : "conference",
          amount: amountPaid,
        });
        console.log(`Confirmation email sent to ${customerEmail}`);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the webhook - the payment was successful
      }
    }
  }

  return NextResponse.json({ received: true });
}
