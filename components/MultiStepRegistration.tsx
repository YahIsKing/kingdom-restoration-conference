"use client";

import { useState } from "react";
import {
  getCurrentConferencePrice,
  formatPrice,
  isEarlyAccessPeriod,
  validateAccessCode,
} from "@/lib/pricing";
import {
  US_STATES,
  ADD_ONS,
  T_SHIRT_SIZES,
  T_SHIRT_COLORS,
  DIETARY_OPTIONS,
  calculateTotal,
  getTShirtCount,
  type RegistrationData,
  type TShirtSelection,
} from "@/lib/products";
import PricingTimeline from "./PricingTimeline";

const STEPS = [
  { id: 1, name: "Contact" },
  { id: 2, name: "Add-ons" },
  { id: 3, name: "T-Shirts" },
  { id: 4, name: "Dietary" },
];

export default function MultiStepRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conferencePrice = getCurrentConferencePrice();
  const earlyAccessRequired = isEarlyAccessPeriod();

  const [formData, setFormData] = useState<RegistrationData>({
    firstName: "",
    familyName: "",
    email: "",
    phone: "",
    state: "",
    addOns: {},
    tshirts: [{ size: "L", color: "royal" }], // Default included t-shirt
    dietaryPreference: "poultry",
    allergies: "",
    accessCode: "",
  });

  const tshirtCount = getTShirtCount(formData.addOns);
  const total = calculateTotal(conferencePrice.amount, formData.addOns);

  // Update t-shirts array when quantity changes
  const updateTShirts = (count: number) => {
    const newTshirts: TShirtSelection[] = [];
    for (let i = 0; i < count; i++) {
      newTshirts.push(
        formData.tshirts[i] || { size: "L", color: "royal" }
      );
    }
    setFormData({ ...formData, tshirts: newTshirts });
  };

  const updateAddOn = (id: string, delta: number) => {
    const current = formData.addOns[id] || 0;
    const addon = ADD_ONS.find((a) => a.id === id);
    const max = addon?.maxQuantity || 10;
    const newQty = Math.max(0, Math.min(max, current + delta));

    const newAddOns = { ...formData.addOns, [id]: newQty };
    setFormData({ ...formData, addOns: newAddOns });

    // Update t-shirts array if t-shirt quantity changed
    if (id === "tshirt") {
      updateTShirts(1 + newQty);
    }
  };

  const updateTShirt = (index: number, field: "size" | "color", value: string) => {
    const newTshirts = [...formData.tshirts];
    newTshirts[index] = { ...newTshirts[index], [field]: value };
    setFormData({ ...formData, tshirts: newTshirts });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return (
          formData.firstName.trim() &&
          formData.familyName.trim() &&
          formData.email.trim() &&
          formData.phone.trim() &&
          formData.state &&
          (!earlyAccessRequired || formData.accessCode)
        );
      case 2:
        return true; // Add-ons are optional
      case 3:
        return formData.tshirts.every((t) => t.size && t.color);
      case 4:
        return formData.dietaryPreference;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (step < STEPS.length) {
      setStep(step + 1);
      setError("");
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Validate access code during early access period
    if (earlyAccessRequired && !validateAccessCode(formData.accessCode || "")) {
      setError("Invalid access code.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          registrationType: "conference",
        }),
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

  return (
    <div>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  step >= s.id
                    ? "bg-olive text-white"
                    : "bg-beige-dark text-royal/50"
                }`}
              >
                {step > s.id ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span
                className={`ml-2 text-sm hidden sm:inline ${
                  step >= s.id ? "text-royal font-medium" : "text-royal/50"
                }`}
              >
                {s.name}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    step > s.id ? "bg-olive" : "bg-beige-dark"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Contact Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-royal mb-4">Contact Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-royal mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 focus:border-olive focus:outline-none"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-royal mb-1">
                Family Name
              </label>
              <input
                type="text"
                value={formData.familyName}
                onChange={(e) =>
                  setFormData({ ...formData, familyName: e.target.value })
                }
                className="w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 focus:border-olive focus:outline-none"
                placeholder="Family name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-royal mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 focus:border-olive focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-royal mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 focus:border-olive focus:outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-royal mb-1">
              State of Residence
            </label>
            <select
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal focus:border-olive focus:outline-none"
            >
              <option value="">Select state...</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {earlyAccessRequired && (
            <div>
              <label className="block text-sm font-medium text-royal mb-1">
                Early Access Code <span className="text-olive">(Required)</span>
              </label>
              <input
                type="text"
                value={formData.accessCode}
                onChange={(e) =>
                  setFormData({ ...formData, accessCode: e.target.value })
                }
                className="w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 focus:border-olive focus:outline-none"
                placeholder="Enter your access code"
              />
              <p className="mt-1 text-xs text-royal/60">
                Members-only registration. Public opens January 18, 2026.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Products & Add-ons */}
      {step === 2 && (
        <div className="space-y-6">
          <PricingTimeline />

          {/* Base Registration */}
          <div className="rounded-xl border-2 border-olive bg-olive/5 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-royal">Family Registration</h4>
                <p className="text-sm text-royal/70 mt-1">
                  Includes access for your entire family to all sessions
                </p>
                <ul className="text-xs text-royal/60 mt-2 space-y-1">
                  <li>• 1 Dinner ticket (July 10th)</li>
                  <li>• 1 Boxed lunch (July 11th)</li>
                  <li>• 1 Conference t-shirt</li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-olive">
                  {formatPrice(conferencePrice.amount)}
                </p>
                <span className="text-xs text-olive">{conferencePrice.label}</span>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <h4 className="font-semibold text-royal mb-3">
              Optional Add-ons
              <span className="font-normal text-sm text-royal/60 ml-2">
                (can also purchase later)
              </span>
            </h4>
            <div className="space-y-3">
              {ADD_ONS.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between rounded-lg border border-beige-dark p-3"
                >
                  <div>
                    <p className="font-medium text-royal text-sm">{addon.name}</p>
                    <p className="text-xs text-royal/60">{addon.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-olive">
                      {formatPrice(addon.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateAddOn(addon.id, -1)}
                        className="w-8 h-8 rounded-full border border-beige-dark text-royal hover:bg-beige-dark transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-medium">
                        {formData.addOns[addon.id] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateAddOn(addon.id, 1)}
                        className="w-8 h-8 rounded-full border border-beige-dark text-royal hover:bg-beige-dark transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Running Total */}
          <div className="rounded-lg bg-royal/5 p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-royal">Total</span>
              <span className="text-2xl font-bold text-royal">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: T-Shirt Details */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-royal mb-4">
            T-Shirt Selection ({tshirtCount} {tshirtCount === 1 ? "shirt" : "shirts"})
          </h3>

          {formData.tshirts.map((tshirt, index) => (
            <div
              key={index}
              className="rounded-lg border border-beige-dark p-4"
            >
              <p className="text-sm font-medium text-royal mb-3">
                {index === 0 ? "Included T-Shirt" : `Extra T-Shirt #${index}`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-royal/60 mb-1">Size</label>
                  <select
                    value={tshirt.size}
                    onChange={(e) => updateTShirt(index, "size", e.target.value)}
                    className="w-full rounded-lg border border-beige-dark bg-white px-3 py-2 text-sm text-royal focus:border-olive focus:outline-none"
                  >
                    {T_SHIRT_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-royal/60 mb-1">Color</label>
                  <select
                    value={tshirt.color}
                    onChange={(e) => updateTShirt(index, "color", e.target.value)}
                    className="w-full rounded-lg border border-beige-dark bg-white px-3 py-2 text-sm text-royal focus:border-olive focus:outline-none"
                  >
                    {T_SHIRT_COLORS.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 4: Dietary Preferences */}
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-royal mb-4">
            Dietary Preferences
          </h3>

          <div>
            <label className="block text-sm font-medium text-royal mb-3">
              Protein Preference
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    formData.dietaryPreference === option.id
                      ? "border-olive bg-olive/5"
                      : "border-beige-dark hover:border-olive/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="dietary"
                    value={option.id}
                    checked={formData.dietaryPreference === option.id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dietaryPreference: e.target.value as typeof formData.dietaryPreference,
                      })
                    }
                    className="sr-only"
                  />
                  <span
                    className={`text-sm font-medium ${
                      formData.dietaryPreference === option.id
                        ? "text-olive"
                        : "text-royal"
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-royal mb-1">
              Allergies or Dietary Restrictions
            </label>
            <textarea
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
              className="w-full rounded-lg border-2 border-beige-dark bg-white px-4 py-3 text-royal placeholder-royal/40 focus:border-olive focus:outline-none"
              rows={3}
              placeholder="Please list any allergies or restrictions for catering..."
            />
          </div>

          {/* Final Total */}
          <div className="rounded-lg bg-olive/10 p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-royal">Total Due</span>
              <span className="text-2xl font-bold text-olive">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 rounded-lg border-2 border-royal/20 px-6 py-3 font-semibold text-royal hover:border-royal/40 transition-colors"
          >
            Back
          </button>
        )}
        {step < STEPS.length ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1 rounded-lg bg-royal px-6 py-3 font-semibold text-beige hover:bg-royal-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
            className="flex-1 rounded-lg bg-olive px-6 py-3 font-semibold text-white hover:bg-olive-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              "Proceed to Payment"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
