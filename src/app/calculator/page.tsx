"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calculator, Zap, MapPin, TrendingUp, ChevronLeft, Home, Building2, Info, CheckCircle } from "lucide-react";
import { REGIONS_WITH_CALCULATIONS } from "@/data/czechRegions";
import { formatCZK } from "@/lib/utils";

interface ROIResult {
  monthlyIncomeCZK: number;
  annualIncomeCZK: number;
  pricePerKwhCZK: number;
  regionMultiplier: number;
  breakEvenMonths: number;
}

function CalculatorContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "business" ? "business" : "household";
  const [userType, setUserType] = useState<"household" | "business">(initialType);
  const [regionId, setRegionId] = useState("JHC");
  const [monthlySurplus, setMonthlySurplus] = useState(300);
  const [result, setResult] = useState<ROIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const region = REGIONS_WITH_CALCULATIONS.find((r) => r.id === regionId);

  async function handleCalculate() {
    setLoading(true);
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId, monthlySurplusKwh: monthlySurplus, userType }),
      });
      setResult(await res.json());
      setCalculated(true);
    } finally {
      setLoading(false);
    }
  }

  const PRESETS = userType === "household" ? [100, 200, 400, 600] : [1000, 5000, 20000, 100000];
  const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: 32, paddingBottom: 64, paddingLeft: 24, paddingRight: 24 }}>
      {/* breadcrumb */}
      <div style={{ maxWidth: 900, margin: "0 auto 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: "#64748b", textDecoration: "none" }}>
            <ChevronLeft style={{ width: 16, height: 16 }} /> Zpět na hlavní stránku
          </Link>
          <span style={{ color: "#e2e8f0" }}>/</span>
          <span style={{ fontSize: 14, color: "#94a3b8" }}>Kalkulačka zisku</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* heading */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
            <Calculator style={{ width: 14, height: 14 }} /> Kalkulačka zisku
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.1 }}>
            Kolik vydělají vaše<br /><span className="text-gradient-primary">přebytky energie?</span>
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
            Výkupní cena se liší podle lokality – v regionech s vysokou poptávkou dostanete za kWh více.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          {/* LEFT: form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* user type */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Info style={{ width: 18, height: 18, color: "#2563eb" }} /> Typ subjektu
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { v: "household" as const, label: "Domácnost", sub: "FVE, tepelné čerp.", Icon: Home },
                  { v: "business" as const, label: "Firma / Provoz", sub: "Výrobní přebytky", Icon: Building2 },
                ].map(({ v, label, sub, Icon }) => (
                  <button key={v} onClick={() => setUserType(v)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 16, borderRadius: 12, border: `2px solid ${userType === v ? "#2563eb" : "#e2e8f0"}`, background: userType === v ? "#eff6ff" : "#fff", cursor: "pointer" }}>
                    <Icon style={{ width: 26, height: 26, color: userType === v ? "#2563eb" : "#94a3b8" }} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: userType === v ? "#2563eb" : "#374151" }}>{label}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* region */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin style={{ width: 18, height: 18, color: "#2563eb" }} /> Kraj
              </div>
              <select value={regionId} onChange={e => setRegionId(e.target.value)}
                style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0f172a", outline: "none" }}>
                {REGIONS_WITH_CALCULATIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — skóre {r.plantFeasibility}/100</option>
                ))}
              </select>
              {region && (
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { v: `${region.annualSurplus?.toLocaleString("cs-CZ")} MWh`, l: "Přebytek/rok", c: "#2563eb", bg: "#eff6ff" },
                    { v: `${region.renewableCapacity} MW`, l: "OZE kapacita", c: "#10b981", bg: "#ecfdf5" },
                    { v: `${region.plantFeasibility}/100`, l: "Skóre lokality", c: "#7c3aed", bg: "#f5f3ff" },
                  ].map(({ v, l, c, bg }) => (
                    <div key={l} style={{ background: bg, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: c }}>{v}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* surplus slider */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Zap style={{ width: 18, height: 18, color: "#2563eb" }} /> Měsíční přebytek energie
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <input type="range"
                  min={userType === "household" ? 50 : 500}
                  max={userType === "household" ? 1000 : 200000}
                  step={userType === "household" ? 50 : 500}
                  value={monthlySurplus}
                  onChange={e => setMonthlySurplus(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#2563eb" }} />
                <div style={{ textAlign: "right", minWidth: 90 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#2563eb" }}>{monthlySurplus.toLocaleString("cs-CZ")}</span>
                  <span style={{ fontSize: 13, color: "#64748b" }}> kWh</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRESETS.map(v => (
                  <button key={v} onClick={() => setMonthlySurplus(v)}
                    style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: `1px solid ${monthlySurplus === v ? "#2563eb" : "#e2e8f0"}`, background: monthlySurplus === v ? "#eff6ff" : "#fff", color: monthlySurplus === v ? "#2563eb" : "#64748b" }}>
                    {v.toLocaleString("cs-CZ")} kWh
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCalculate} disabled={loading}
              style={{ padding: "16px", borderRadius: 12, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(37,99,235,0.2)" }}>
              {loading ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Calculator style={{ width: 18, height: 18 }} />}
              {loading ? "Počítám..." : "Vypočítat zisk"}
            </button>
          </div>

          {/* RIGHT: results */}
          <div>
            {!calculated ? (
              <div style={{ ...card, minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <TrendingUp style={{ width: 36, height: 36, color: "#2563eb" }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a", marginBottom: 8 }}>Čekám na výpočet</div>
                <p style={{ fontSize: 14, color: "#64748b", maxWidth: 260 }}>Vyberte lokalitu a zadejte přebytek energie. Výsledky se zobrazí zde.</p>
              </div>
            ) : result ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ ...card, border: "1px solid #bfdbfe" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <CheckCircle style={{ width: 22, height: 22, color: "#10b981" }} />
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Výsledky výpočtu</span>
                  </div>
                  <div style={{ background: "linear-gradient(135deg,#eff6ff,#f0f9ff)", borderRadius: 12, padding: 20, border: "1px solid #bfdbfe", marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Měsíční příjem</div>
                    <div className="text-gradient-primary" style={{ fontSize: 38, fontWeight: 900 }}>{formatCZK(result.monthlyIncomeCZK)}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { l: "Roční příjem", v: formatCZK(result.annualIncomeCZK), c: "#10b981", bg: "#ecfdf5" },
                      { l: "Cena za kWh", v: `${result.pricePerKwhCZK.toFixed(2)} Kč`, c: "#2563eb", bg: "#eff6ff" },
                      { l: "Regionální bonus", v: `×${result.regionMultiplier}`, c: "#7c3aed", bg: "#f5f3ff" },
                      { l: "Návratnost FVE", v: result.breakEvenMonths < 120 ? `${Math.round(result.breakEvenMonths / 12)} let` : `${result.breakEvenMonths} měs.`, c: "#f59e0b", bg: "#fffbeb" },
                    ].map(({ l, v, c, bg }) => (
                      <div key={l} style={{ background: bg, borderRadius: 10, padding: 14 }}>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={card}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#2563eb", marginBottom: 12 }}>Jak přijít o méně peněz</div>
                  {[
                    "Registrujte přebytek přes náš portál – dostanete přesné ocenění",
                    "Výkupní ceny v regionech s elektrárnami jsou o 15–40 % vyšší",
                    "Firmy dostávají bonus 15 % za objem nad 1 000 MWh/rok",
                  ].map(t => (
                    <div key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, fontSize: 13, color: "#64748b" }}>
                      <CheckCircle style={{ width: 15, height: 15, color: "#10b981", flexShrink: 0, marginTop: 1 }} />{t}
                    </div>
                  ))}
                </div>

                <Link href="/map" style={{ display: "block", padding: 14, borderRadius: 12, border: "1px solid #bfdbfe", color: "#2563eb", textAlign: "center", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
                  Zobrazit elektrárnu ve vaší lokalitě →
                </Link>
              </div>
            ) : (
              <div style={{ ...card, textAlign: "center" }}><p style={{ color: "#ef4444" }}>Chyba výpočtu. Zkuste to znovu.</p></div>
            )}
          </div>
        </div>

        {/* info panel */}
        <div style={{ ...card, marginTop: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#2563eb", marginBottom: 16 }}>Jak se stanovuje výkupní cena?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, fontSize: 14, color: "#64748b" }}>
            {[
              ["Regionální multiplikátor", "Kraje s vyšší poptávkou po ukládání energie (velká průmyslová spotřeba, málo OZE) mají vyšší výkupní cenu. Jihočeský kraj (Temelín) a Ústecký kraj jsou centry přebytků."],
              ["Tržní cena vodíku", "Zelený vodík se aktuálně obchoduje za ~4,50 EUR/kg. Elektrolýza spotřebuje ~50 kWh na kg H₂. Výkupní cena odráží tuto konverzní efektivitu minus marže."],
              ["Dotační podpora", "Elektrárny v síti H2Age čerpají dotace MPO (45 % CAPEX) a REPowerEU (30 % CAPEX). To umožňuje vyplácet vyšší výkupní ceny dodavatelům energie."],
            ].map(([title, body]) => (
              <div key={title}>
                <div style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>{title}</div>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Načítám...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
