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
  type RegistrationData,
  type TShirtSelection,
} from "@/lib/products";

const STEPS = ["Contact", "Registration", "Dietary"];

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
    tshirts: [{ size: "L", color: "royal" }],
    dietaryPreference: "poultry",
    allergies: "",
    accessCode: "",
  });

  const total = calculateTotal(conferencePrice.amount, formData.addOns);

  const updateAddOn = (id: string, delta: number) => {
    const current = formData.addOns[id] || 0;
    const addon = ADD_ONS.find((a) => a.id === id);
    const max = addon?.maxQuantity || 10;
    const newQty = Math.max(0, Math.min(max, current + delta));
    const newAddOns = { ...formData.addOns, [id]: newQty };

    // For t-shirts, update both addOns and tshirts array in one setState to avoid race condition
    if (id === "tshirt") {
      const newCount = 1 + newQty;
      const newTshirts: TShirtSelection[] = [];
      for (let i = 0; i < newCount; i++) {
        newTshirts.push(formData.tshirts[i] || { size: "L", color: "royal" });
      }
      setFormData({ ...formData, addOns: newAddOns, tshirts: newTshirts });
    } else {
      setFormData({ ...formData, addOns: newAddOns });
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
        return formData.tshirts.every((t) => t.size && t.color);
      case 3:
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

    if (earlyAccessRequired && !validateAccessCode(formData.accessCode || "")) {
      setError("Invalid access code.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, registrationType: "conference" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Step Indicator - Mobile Friendly */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {STEPS.map((name, idx) => (
          <div key={name} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step > idx + 1
                  ? "bg-olive text-white"
                  : step === idx + 1
                    ? "bg-olive text-white"
                    : "bg-beige-dark text-royal/50"
              }`}
            >
              {step > idx + 1 ? "✓" : idx + 1}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${step > idx + 1 ? "bg-olive" : "bg-beige-dark"}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-royal/60 mb-6">
        Step {step} of {STEPS.length}: {STEPS[step - 1]}
      </p>

      {/* Step 1: Contact */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-royal mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-lg border-2 border-beige-dark px-3 py-2.5 text-royal focus:border-olive focus:outline-none"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-royal mb-1">Family Name</label>
              <input
                type="text"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                className="w-full rounded-lg border-2 border-beige-dark px-3 py-2.5 text-royal focus:border-olive focus:outline-none"
                placeholder="Family name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-royal mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border-2 border-beige-dark px-3 py-2.5 text-royal focus:border-olive focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-royal mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border-2 border-beige-dark px-3 py-2.5 text-royal focus:border-olive focus:outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-royal mb-1">State</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full rounded-lg border-2 border-beige-dark px-3 py-2.5 text-royal focus:border-olive focus:outline-none"
            >
              <option value="">Select state...</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {earlyAccessRequired && (
            <div>
              <label className="block text-sm font-medium text-royal mb-1">
                Access Code <span className="text-olive">(Required)</span>
              </label>
              <input
                type="text"
                value={formData.accessCode}
                onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                className="w-full rounded-lg border-2 border-beige-dark px-3 py-2.5 text-royal focus:border-olive focus:outline-none"
                placeholder="Enter access code"
              />
              <p className="mt-1 text-xs text-royal/60">Members-only. Public opens Jan 18.</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Registration & Add-ons */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Base Registration */}
          <div className="rounded-xl border-2 border-olive bg-olive/5 p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-royal">Family Registration</h4>
                <p className="text-xs text-royal/70 mt-1">
                  Full family access + 1 dinner + 1 lunch + 1 t-shirt
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-olive">{formatPrice(conferencePrice.amount)}</p>
                <span className="text-xs text-olive">{conferencePrice.label}</span>
              </div>
            </div>

            {/* Included T-shirt */}
            <div className="mt-3 pt-3 border-t border-olive/20">
              <p className="text-xs font-medium text-royal mb-2">Your included t-shirt:</p>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {T_SHIRT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateTShirt(0, "size", size)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        formData.tshirts[0]?.size === size
                          ? "bg-olive text-white"
                          : "bg-beige-dark/50 text-royal hover:bg-beige-dark"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {T_SHIRT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateTShirt(0, "color", c.id)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        formData.tshirts[0]?.color === c.id
                          ? "bg-olive text-white"
                          : "bg-beige-dark/50 text-royal hover:bg-beige-dark"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <h4 className="font-semibold text-royal mb-2">Optional Add-ons</h4>
            <div className="space-y-3">
              {ADD_ONS.map((addon) => {
                const qty = formData.addOns[addon.id] || 0;
                return (
                  <div key={addon.id} className="rounded-lg border border-beige-dark p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-royal text-sm">{addon.name}</p>
                        <p className="text-xs text-royal/60">{addon.description}</p>
                        <p className="text-sm font-semibold text-olive mt-1">{formatPrice(addon.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateAddOn(addon.id, -1)}
                          className="w-8 h-8 rounded-full border border-beige-dark flex items-center justify-center hover:bg-beige-dark"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateAddOn(addon.id, 1)}
                          className="w-8 h-8 rounded-full border border-beige-dark flex items-center justify-center hover:bg-beige-dark"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Extra T-shirts */}
                    {addon.id === "tshirt" && qty > 0 && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-beige-dark">
                        {formData.tshirts.slice(1).map((tshirt, idx) => (
                          <div key={idx} className="space-y-2">
                            <p className="text-xs font-medium text-royal">T-shirt #{idx + 2}:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {T_SHIRT_SIZES.map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => updateTShirt(idx + 1, "size", size)}
                                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                    tshirt.size === size
                                      ? "bg-olive text-white"
                                      : "bg-beige-dark/50 text-royal hover:bg-beige-dark"
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {T_SHIRT_COLORS.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => updateTShirt(idx + 1, "color", c.id)}
                                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                    tshirt.color === c.id
                                      ? "bg-olive text-white"
                                      : "bg-beige-dark/50 text-royal hover:bg-beige-dark"
                                  }`}
                                >
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="rounded-lg bg-royal/5 p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-royal">Total</span>
              <span className="text-xl font-bold text-royal">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Dietary */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-royal mb-2">Protein Preference</label>
            <div className="grid grid-cols-3 gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer text-sm font-medium ${
                    formData.dietaryPreference === opt.id
                      ? "border-olive bg-olive/5 text-olive"
                      : "border-beige-dark text-royal hover:border-olive/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="dietary"
                    value={opt.id}
                    checked={formData.dietaryPreference === opt.id}
                    onChange={(e) =>
                      setFormData({ ...formData, dietaryPreference: e.target.value as typeof formData.dietaryPreference })
                    }
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-royal mb-1">Allergies / Restrictions</label>
            <textarea
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full rounded-lg border-2 border-beige-dark px-3 py-2.5 text-royal focus:border-olive focus:outline-none"
              rows={3}
              placeholder="List any allergies for catering..."
            />
          </div>

          <div className="rounded-lg bg-olive/10 p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-royal">Total Due</span>
              <span className="text-xl font-bold text-olive">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 rounded-lg border-2 border-royal/20 px-4 py-3 font-semibold text-royal hover:border-royal/40"
          >
            Back
          </button>
        )}
        {step < STEPS.length ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1 rounded-lg bg-royal px-4 py-3 font-semibold text-beige hover:bg-royal-light disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
            className="flex-1 rounded-lg bg-olive px-4 py-3 font-semibold text-white hover:bg-olive-light disabled:opacity-50"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        )}
      </div>
    </div>
  );
}
