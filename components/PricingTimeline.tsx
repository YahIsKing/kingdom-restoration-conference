"use client";

import {
  getCurrentConferencePrice,
  formatPrice,
  PRICING,
} from "@/lib/pricing";

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
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const currentTier = tiers.find((t) => t.isCurrent);
  const daysLeft = currentTier ? getDaysRemaining(currentTier.deadline) : 0;

  return (
    <div className="mb-8">
      {/* Urgency Banner */}
      {currentTier && daysLeft > 0 && daysLeft <= 14 && (
        <div className="mb-4 rounded-lg bg-olive/10 border border-olive/20 px-4 py-3 text-center">
          <p className="text-olive font-medium">
            {daysLeft === 1
              ? "Last day for"
              : `Only ${daysLeft} days left for`}{" "}
            {currentTier.label} pricing!
          </p>
        </div>
      )}

      {/* Current Price Highlight */}
      <div className="text-center mb-6">
        <p className="text-sm text-royal/60 uppercase tracking-wide">
          Current Price
        </p>
        <p className="text-4xl font-bold text-royal mt-1">
          {formatPrice(currentPrice.amount)}
        </p>
        <p className="text-olive font-medium">{currentPrice.label}</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-beige-dark rounded-full">
          <div
            className="h-full bg-olive rounded-full transition-all"
            style={{
              width: tiers[0].isCurrent
                ? "16%"
                : tiers[1].isCurrent
                  ? "50%"
                  : "83%",
            }}
          />
        </div>

        {/* Tier Markers */}
        <div className="relative flex justify-between">
          {tiers.map((tier, index) => (
            <div
              key={tier.label}
              className={`flex flex-col items-center ${
                index === 0
                  ? "items-start"
                  : index === tiers.length - 1
                    ? "items-end"
                    : ""
              }`}
            >
              {/* Marker Dot */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  tier.isCurrent
                    ? "bg-olive text-white ring-4 ring-olive/20"
                    : tier.isPast
                      ? "bg-royal/20 text-royal/40"
                      : "bg-beige-dark text-royal/60"
                }`}
              >
                {tier.isPast ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>

              {/* Tier Info */}
              <div
                className={`mt-3 text-center ${
                  index === 0
                    ? "text-left -ml-1"
                    : index === tiers.length - 1
                      ? "text-right -mr-1"
                      : ""
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    tier.isCurrent
                      ? "text-olive"
                      : tier.isPast
                        ? "text-royal/40 line-through"
                        : "text-royal/70"
                  }`}
                >
                  {formatPrice(tier.price)}
                </p>
                <p
                  className={`text-xs ${
                    tier.isCurrent
                      ? "text-olive font-medium"
                      : "text-royal/50"
                  }`}
                >
                  {tier.label}
                </p>
                <p className="text-xs text-royal/40 mt-0.5">
                  {tier.isPast ? "Ended" : `Until ${formatDeadline(tier.deadline)}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Message */}
      {!tiers[2].isCurrent && (
        <p className="text-center text-sm text-royal/60 mt-6">
          Register now and save{" "}
          <span className="font-semibold text-olive">
            {formatPrice(PRICING.conference.late.amount - currentPrice.amount)}
          </span>{" "}
          compared to late registration
        </p>
      )}
    </div>
  );
}
