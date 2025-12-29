"use client";

import { useState } from "react";
import {
  getCurrentConferencePrice,
  getVendorFullPrice,
  getVendorHalfPrice,
  formatPrice,
  isEarlyAccessPeriod,
  validateAccessCode,
  RegistrationType,
} from "@/lib/pricing";

export default function RegistrationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationType, setRegistrationType] =
    useState<RegistrationType>("conference");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const earlyAccessRequired = isEarlyAccessPeriod();

  const conferencePrice = getCurrentConferencePrice();
  const vendorFullPrice = getVendorFullPrice();
  const vendorHalfPrice = getVendorHalfPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate access code during early access period
    if (earlyAccessRequired && !validateAccessCode(accessCode)) {
      setError("Invalid access code. Registration is currently limited to members only.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, registrationType, accessCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const CheckIcon = () => (
    <div className="absolute right-4 top-4 text-olive">
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Registration Type Selection */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-royal">
          Registration Type
        </label>
        <div className="space-y-3">
          {/* Conference Registration */}
          <label
            className={`relative flex cursor-pointer rounded-xl border-2 p-5 transition-all ${
              registrationType === "conference"
                ? "border-olive bg-olive/5"
                : "border-beige-dark hover:border-olive/50"
            }`}
          >
            <input
              type="radio"
              name="registrationType"
              value="conference"
              checked={registrationType === "conference"}
              onChange={(e) =>
                setRegistrationType(e.target.value as RegistrationType)
              }
              className="sr-only"
            />
            <div className="flex-1">
              <span className="block text-lg font-semibold text-royal">
                Conference Registration
              </span>
              <span className="mt-1 block text-sm text-royal/70">
                Full access to all sessions
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-olive">
                  {formatPrice(conferencePrice.amount)}
                </span>
                <span className="rounded-full bg-olive/10 px-2 py-0.5 text-xs font-medium text-olive">
                  {conferencePrice.label}
                </span>
              </div>
            </div>
            {registrationType === "conference" && <CheckIcon />}
          </label>

          {/* Vendor Full Table */}
          <label
            className={`relative flex cursor-pointer rounded-xl border-2 p-5 transition-all ${
              registrationType === "vendor-full"
                ? "border-olive bg-olive/5"
                : "border-beige-dark hover:border-olive/50"
            }`}
          >
            <input
              type="radio"
              name="registrationType"
              value="vendor-full"
              checked={registrationType === "vendor-full"}
              onChange={(e) =>
                setRegistrationType(e.target.value as RegistrationType)
              }
              className="sr-only"
            />
            <div className="flex-1">
              <span className="block text-lg font-semibold text-royal">
                Vendor Table – Full
              </span>
              <span className="mt-1 block text-sm text-royal/70">
                Full table in vendor area
              </span>
              <div className="mt-3">
                <span className="text-2xl font-bold text-olive">
                  {formatPrice(vendorFullPrice.amount)}
                </span>
              </div>
            </div>
            {registrationType === "vendor-full" && <CheckIcon />}
          </label>

          {/* Vendor Half Table */}
          <label
            className={`relative flex cursor-pointer rounded-xl border-2 p-5 transition-all ${
              registrationType === "vendor-half"
                ? "border-olive bg-olive/5"
                : "border-beige-dark hover:border-olive/50"
            }`}
          >
            <input
              type="radio"
              name="registrationType"
              value="vendor-half"
              checked={registrationType === "vendor-half"}
              onChange={(e) =>
                setRegistrationType(e.target.value as RegistrationType)
              }
              className="sr-only"
            />
            <div className="flex-1">
              <span className="block text-lg font-semibold text-royal">
                Vendor Table – Half
              </span>
              <span className="mt-1 block text-sm text-royal/70">
                Half table in vendor area
              </span>
              <div className="mt-3">
                <span className="text-2xl font-bold text-olive">
                  {formatPrice(vendorHalfPrice.amount)}
                </span>
              </div>
            </div>
            {registrationType === "vendor-half" && <CheckIcon />}
          </label>
        </div>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-royal">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 block w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 transition-colors focus:border-olive focus:outline-none"
          placeholder="Enter your full name"
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-royal">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 block w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 transition-colors focus:border-olive focus:outline-none"
          placeholder="your@email.com"
        />
      </div>

      {/* Early Access Code Field - only shown during members-only period */}
      {earlyAccessRequired && (
        <div>
          <label htmlFor="accessCode" className="block text-sm font-medium text-royal">
            Early Access Code <span className="text-olive">(Required)</span>
          </label>
          <input
            type="text"
            id="accessCode"
            required
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="mt-2 block w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 transition-colors focus:border-olive focus:outline-none"
            placeholder="Enter your access code"
          />
          <p className="mt-2 text-sm text-royal/70">
            Registration is currently open to members only. Public registration opens January 18, 2026.
          </p>
        </div>
      )}

      {/* Member Discount Note - only shown during public registration */}
      {!earlyAccessRequired && (
        <p className="text-sm text-royal/70">
          Have a member discount code? You can enter it on the next page during
          checkout.
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-royal px-6 py-4 text-lg font-semibold text-beige transition-all hover:bg-royal-light focus:outline-none focus:ring-4 focus:ring-royal/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          "Continue to Payment"
        )}
      </button>
    </form>
  );
}
