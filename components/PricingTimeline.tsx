"use client";

import { getCurrentConferencePrice, formatPrice, PRICING } from "@/lib/pricing";

export default function PricingTimeline() {
  const currentPrice = getCurrentConferencePrice();
  const now = new Date();

  const tiers = [
    {
      label: "Early Bird",
      price: PRICING.conference.earlyBird.amount,
      deadline: PRICING.conference.earlyBird.deadline,
      isCurrent: currentPrice.label === "Early Bird",
      isPast: now >= PRICING.conference.earlyBird.deadline,
    },
    {
      label: "Regular",
      price: PRICING.conference.regular.amount,
      deadline: PRICING.conference.regular.deadline,
      isCurrent: currentPrice.label === "Regular",
      isPast: now >= PRICING.conference.regular.deadline,
    },
    {
      label: "Late",
      price: PRICING.conference.late.amount,
      deadline: PRICING.conference.late.deadline,
      isCurrent: currentPrice.label === "Late Registration",
      isPast: now >= PRICING.conference.late.deadline,
    },
  ];

  const formatDeadline = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDaysRemaining = (deadline: Date) => {
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const currentTier = tiers.find((t) => t.isCurrent);
  const daysLeft = currentTier ? getDaysRemaining(currentTier.deadline) : 0;

  return (
    <div>
      {/* Urgency Banner */}
      {currentTier && daysLeft > 0 && daysLeft <= 14 && (
        <div className="mb-4 rounded-lg bg-olive/10 border border-olive/20 px-3 py-2 text-center">
          <p className="text-olive font-medium text-sm">
            {daysLeft === 1 ? "Last day" : `${daysLeft} days left`} for {currentTier.label} pricing!
          </p>
        </div>
      )}

      {/* Current Price - Mobile Prominent */}
      <div className="text-center mb-6">
        <p className="text-xs text-royal/60 uppercase tracking-wide">Current Price</p>
        <p className="text-3xl sm:text-4xl font-bold text-royal">{formatPrice(currentPrice.amount)}</p>
        <p className="text-olive font-medium text-sm">{currentPrice.label}</p>
      </div>

      {/* Pricing Tiers - Stacked on Mobile */}
      <div className="space-y-2">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className={`flex items-center justify-between rounded-lg p-3 ${
              tier.isCurrent
                ? "bg-olive/10 border-2 border-olive"
                : tier.isPast
                  ? "bg-beige-dark/30 opacity-60"
                  : "bg-beige-light border border-beige-dark"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  tier.isCurrent
                    ? "bg-olive text-white"
                    : tier.isPast
                      ? "bg-royal/30 text-white"
                      : "bg-beige-dark text-royal/60"
                }`}
              >
                {tier.isPast ? "✓" : tier.isCurrent ? "●" : "○"}
              </div>
              <div>
                <p className={`font-medium text-sm ${tier.isPast ? "line-through text-royal/50" : "text-royal"}`}>
                  {tier.label}
                </p>
                <p className="text-xs text-royal/50">
                  {tier.isPast ? "Ended" : `Until ${formatDeadline(tier.deadline)}`}
                </p>
              </div>
            </div>
            <p className={`font-bold ${tier.isCurrent ? "text-olive" : tier.isPast ? "text-royal/40" : "text-royal/70"}`}>
              {formatPrice(tier.price)}
            </p>
          </div>
        ))}
      </div>

      {/* Savings Message */}
      {!tiers[2].isCurrent && (
        <p className="text-center text-xs text-royal/60 mt-4">
          Register now and save{" "}
          <span className="font-semibold text-olive">
            {formatPrice(PRICING.conference.late.amount - currentPrice.amount)}
          </span>{" "}
          vs late registration
        </p>
      )}
    </div>
  );
}
