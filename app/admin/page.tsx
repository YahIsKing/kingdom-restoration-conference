"use client";

import { useState, useEffect } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "KRC2026Admin";

interface Registration {
  id: string;
  created: number;
  firstName: string;
  familyName: string;
  email: string;
  phone: string;
  state: string;
  registrationType: string;
  tshirts: string;
  dietaryPreference: string;
  allergies: string;
  addOns: string;
  amountPaid: number;
  paymentStatus: string;
}

interface Stats {
  totalRegistrations: number;
  conferenceCount: number;
  vendorCount: number;
  dietary: Record<string, number>;
  tshirtSizes: Record<string, number>;
  tshirtColors: Record<string, number>;
  addOnTotals: Record<string, number>;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRegistrations(data.registrations);
      setStats(data.stats);
    } catch (err) {
      setError("Failed to load registrations");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTshirts = (tshirtsJson: string) => {
    try {
      const tshirts = JSON.parse(tshirtsJson || "[]");
      return tshirts.map((t: { size: string; color: string }) => `${t.size} ${t.color}`);
    } catch {
      return [];
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
      return items;
    } catch {
      return [];
    }
  };

  const exportCSV = () => {
    if (!registrations.length) return;

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
      "Status",
    ];

    const rows = registrations.map((r) => [
      new Date(r.created).toLocaleDateString(),
      r.firstName,
      r.familyName,
      r.email,
      r.phone,
      r.state,
      r.registrationType,
      formatTshirts(r.tshirts).join("; "),
      r.dietaryPreference,
      r.allergies || "None",
      formatAddOns(r.addOns).join("; ") || "None",
      formatPrice(r.amountPaid),
      r.paymentStatus,
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl text-royal">Registrations</h1>
            <p className="text-royal/60 text-sm mt-1">
              {stats?.totalRegistrations || 0} total
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-beige-dark text-royal px-4 py-2 rounded-lg font-medium hover:bg-beige-dark/80 text-sm"
            >
              {loading ? "..." : "Refresh"}
            </button>
            <button
              onClick={exportCSV}
              className="bg-olive text-white px-4 py-2 rounded-lg font-medium hover:bg-olive/90 text-sm"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Registration Counts */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-royal/60 text-xs uppercase tracking-wide">Registrations</p>
              <p className="text-2xl font-bold text-royal mt-1">{stats.conferenceCount}</p>
              {stats.vendorCount > 0 && (
                <p className="text-xs text-royal/60 mt-1">+ {stats.vendorCount} vendors</p>
              )}
            </div>

            {/* Dietary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-royal/60 text-xs uppercase tracking-wide mb-2">Dietary</p>
              <div className="space-y-1">
                {Object.entries(stats.dietary).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize text-royal/80">{key}</span>
                    <span className="font-semibold text-royal">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* T-Shirt Sizes */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-royal/60 text-xs uppercase tracking-wide mb-2">Shirt Sizes</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.tshirtSizes).map(([size, count]) => (
                  <span key={size} className="bg-beige-dark/50 px-2 py-1 rounded text-xs font-medium">
                    {size}: {count}
                  </span>
                ))}
              </div>
            </div>

            {/* T-Shirt Colors */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-royal/60 text-xs uppercase tracking-wide mb-2">Shirt Colors</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.tshirtColors).map(([color, count]) => (
                  <span key={color} className="bg-beige-dark/50 px-2 py-1 rounded text-xs font-medium capitalize">
                    {color}: {count}
                  </span>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            {Object.keys(stats.addOnTotals).length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm col-span-2">
                <p className="text-royal/60 text-xs uppercase tracking-wide mb-2">Add-Ons</p>
                <div className="flex flex-wrap gap-3">
                  {stats.addOnTotals["dinner-adult"] && (
                    <span className="text-sm">
                      <span className="text-royal/70">Adult Dinners:</span>{" "}
                      <span className="font-semibold">{stats.addOnTotals["dinner-adult"]}</span>
                    </span>
                  )}
                  {stats.addOnTotals["dinner-child"] && (
                    <span className="text-sm">
                      <span className="text-royal/70">Child Dinners:</span>{" "}
                      <span className="font-semibold">{stats.addOnTotals["dinner-child"]}</span>
                    </span>
                  )}
                  {stats.addOnTotals["lunch"] && (
                    <span className="text-sm">
                      <span className="text-royal/70">Lunches:</span>{" "}
                      <span className="font-semibold">{stats.addOnTotals["lunch"]}</span>
                    </span>
                  )}
                  {stats.addOnTotals["tshirt"] && (
                    <span className="text-sm">
                      <span className="text-royal/70">Extra Shirts:</span>{" "}
                      <span className="font-semibold">{stats.addOnTotals["tshirt"]}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Registration Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-royal/60">
              Loading...
            </div>
          ) : registrations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-royal/60">
              No registrations yet
            </div>
          ) : (
            registrations.map((reg) => {
              const isExpanded = expandedId === reg.id;
              const tshirts = formatTshirts(reg.tshirts);
              const addOns = formatAddOns(reg.addOns);

              return (
                <div
                  key={reg.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Card Header - Always Visible */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-royal truncate">
                            {reg.firstName} {reg.familyName}
                          </h3>
                          {reg.paymentStatus === "partial_refund" && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">
                              Partial Refund
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-royal/60 truncate">{reg.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-olive">{formatPrice(reg.amountPaid)}</p>
                        <p className="text-xs text-royal/50">
                          {new Date(reg.created).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Quick Info Row */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-beige-dark/50 px-2 py-0.5 rounded text-xs capitalize">
                        {reg.dietaryPreference || "No pref"}
                      </span>
                      {tshirts.length > 0 && (
                        <span className="bg-beige-dark/50 px-2 py-0.5 rounded text-xs">
                          {tshirts.length} shirt{tshirts.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {addOns.length > 0 && (
                        <span className="bg-olive/10 text-olive px-2 py-0.5 rounded text-xs">
                          +{addOns.length} add-on{addOns.length > 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="ml-auto text-royal/40 text-xs">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-beige-dark/30">
                      <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
                        <div>
                          <p className="text-royal/50 text-xs uppercase">Phone</p>
                          <p className="text-royal">{reg.phone || "—"}</p>
                        </div>
                        <div>
                          <p className="text-royal/50 text-xs uppercase">State</p>
                          <p className="text-royal">{reg.state || "—"}</p>
                        </div>
                        <div>
                          <p className="text-royal/50 text-xs uppercase">Type</p>
                          <p className="text-royal capitalize">{reg.registrationType}</p>
                        </div>
                        <div>
                          <p className="text-royal/50 text-xs uppercase">Allergies</p>
                          <p className="text-royal">{reg.allergies || "None"}</p>
                        </div>
                      </div>

                      {tshirts.length > 0 && (
                        <div className="mt-4">
                          <p className="text-royal/50 text-xs uppercase mb-1">T-Shirts</p>
                          <div className="flex flex-wrap gap-2">
                            {tshirts.map((t: string, i: number) => (
                              <span key={i} className="bg-beige-dark/50 px-2 py-1 rounded text-sm">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {addOns.length > 0 && (
                        <div className="mt-4">
                          <p className="text-royal/50 text-xs uppercase mb-1">Add-Ons</p>
                          <div className="flex flex-wrap gap-2">
                            {addOns.map((a: string, i: number) => (
                              <span key={i} className="bg-olive/10 text-olive px-2 py-1 rounded text-sm">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-beige-dark/30">
                        <a
                          href={`mailto:${reg.email}`}
                          className="flex-1 bg-beige-dark/50 text-royal text-center py-2 rounded-lg text-sm font-medium hover:bg-beige-dark"
                        >
                          Email
                        </a>
                        <a
                          href={`tel:${reg.phone}`}
                          className="flex-1 bg-beige-dark/50 text-royal text-center py-2 rounded-lg text-sm font-medium hover:bg-beige-dark"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
