"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "KRC2026Admin";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registrations = useQuery(api.registrations.list);
  const stats = useQuery(api.registrations.getStats);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const formatTshirts = (tshirtsJson: string) => {
    try {
      const tshirts = JSON.parse(tshirtsJson || "[]");
      return tshirts
        .map((t: { size: string; color: string }, i: number) => `${t.size} ${t.color}`)
        .join(", ");
    } catch {
      return tshirtsJson;
    }
  };

  const formatAddOns = (addOnsJson: string) => {
    try {
      const addOns = JSON.parse(addOnsJson || "{}");
      const items = [];
      if (addOns["dinner-adult"]) items.push(`Adult Dinner x${addOns["dinner-adult"]}`);
      if (addOns["dinner-child"]) items.push(`Child Dinner x${addOns["dinner-child"]}`);
      if (addOns["lunch"]) items.push(`Lunch x${addOns["lunch"]}`);
      if (addOns["tshirt"]) items.push(`Extra Shirt x${addOns["tshirt"]}`);
      return items.length > 0 ? items.join(", ") : "None";
    } catch {
      return addOnsJson;
    }
  };

  const exportCSV = () => {
    if (!registrations) return;

    const headers = [
      "Date",
      "First Name",
      "Family Name",
      "Email",
      "Phone",
      "State",
      "Type",
      "T-Shirts",
      "Dietary",
      "Allergies",
      "Add-Ons",
      "Amount",
    ];

    const rows = registrations.map((r) => [
      new Date(r.createdAt).toLocaleDateString(),
      r.firstName,
      r.familyName,
      r.email,
      r.phone,
      r.state,
      r.registrationType,
      formatTshirts(r.tshirts),
      r.dietaryPreference,
      r.allergies || "None",
      formatAddOns(r.addOns),
      r.amountPaid,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krc-registrations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-beige-light flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full">
          <h1 className="font-heading text-2xl text-royal text-center mb-6">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border-2 border-beige-dark px-4 py-3 text-royal focus:border-olive focus:outline-none"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-royal text-beige py-3 rounded-lg font-semibold hover:bg-royal-light"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl text-royal">Registrations</h1>
          <button
            onClick={exportCSV}
            className="bg-olive text-white px-6 py-2 rounded-lg font-semibold hover:bg-olive/90"
          >
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-royal/60 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold text-royal">{stats.totalRegistrations}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-royal/60 text-sm mb-2">Dietary</p>
              <div className="text-sm space-y-1">
                {Object.entries(stats.dietary).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}</span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-royal/60 text-sm mb-2">T-Shirt Sizes</p>
              <div className="text-sm space-y-1">
                {Object.entries(stats.tshirtSizes).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}</span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-royal/60 text-sm mb-2">T-Shirt Colors</p>
              <div className="text-sm space-y-1">
                {Object.entries(stats.tshirtColors).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}</span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add-on Totals */}
        {stats && Object.keys(stats.addOnTotals).length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-8">
            <p className="text-royal/60 text-sm mb-2">Add-On Totals</p>
            <div className="flex flex-wrap gap-4">
              {stats.addOnTotals["dinner-adult"] && (
                <div className="text-sm">
                  <span className="text-royal/70">Adult Dinners:</span>{" "}
                  <span className="font-semibold">{stats.addOnTotals["dinner-adult"]}</span>
                </div>
              )}
              {stats.addOnTotals["dinner-child"] && (
                <div className="text-sm">
                  <span className="text-royal/70">Child Dinners:</span>{" "}
                  <span className="font-semibold">{stats.addOnTotals["dinner-child"]}</span>
                </div>
              )}
              {stats.addOnTotals["lunch"] && (
                <div className="text-sm">
                  <span className="text-royal/70">Extra Lunches:</span>{" "}
                  <span className="font-semibold">{stats.addOnTotals["lunch"]}</span>
                </div>
              )}
              {stats.addOnTotals["tshirt"] && (
                <div className="text-sm">
                  <span className="text-royal/70">Extra T-Shirts:</span>{" "}
                  <span className="font-semibold">{stats.addOnTotals["tshirt"]}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registrations Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-royal text-beige">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left">T-Shirts</th>
                  <th className="px-4 py-3 text-left">Dietary</th>
                  <th className="px-4 py-3 text-left">Add-Ons</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-dark">
                {registrations === undefined ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-royal/60">
                      Loading...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-royal/60">
                      No registrations yet
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-beige-light/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        {reg.firstName} {reg.familyName}
                      </td>
                      <td className="px-4 py-3">{reg.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{reg.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{reg.state}</td>
                      <td className="px-4 py-3">{formatTshirts(reg.tshirts)}</td>
                      <td className="px-4 py-3 capitalize">{reg.dietaryPreference}</td>
                      <td className="px-4 py-3">{formatAddOns(reg.addOns)}</td>
                      <td className="px-4 py-3 font-semibold text-olive">{reg.amountPaid}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
