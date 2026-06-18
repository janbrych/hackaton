"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calculator, Zap, MapPin, TrendingUp, ChevronLeft,
  Home, Building2, Info, CheckCircle
} from "lucide-react";
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
      const data = await res.json();
      setResult(data);
      setCalculated(true);
    } finally {
      setLoading(false);
    }
  }

  const SURPLUS_PRESETS = userType === "household"
    ? [100, 200, 400, 600]
    : [1000, 5000, 20000, 100000];

  return (
    <div className="gradient-bg grid-lines min-h-screen pt-8 pb-16 px-4">
      {/* Nav */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" />
          Zpět na hlavní stránku
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-400 text-sm">Kalkulačka zisku</span>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm mb-6">
            <Calculator className="w-4 h-4" />
            Kalkulačka zisku
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Kolik vydělají vaše
            <br />
            <span className="text-gradient-primary">přebytky energie?</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Výkupní cena se liší podle lokality – v regionech s vysokou poptávkou dostanete za kWh více.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-5">
            {/* User type */}
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Typ subjektu
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUserType("household")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    userType === "household"
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <Home className="w-7 h-7" />
                  <span className="font-semibold text-sm">Domácnost</span>
                  <span className="text-xs opacity-70">FVE, tepelné čerp.</span>
                </button>
                <button
                  onClick={() => setUserType("business")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    userType === "business"
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <Building2 className="w-7 h-7" />
                  <span className="font-semibold text-sm">Firma / Provoz</span>
                  <span className="text-xs opacity-70">Výrobní přebytky</span>
                </button>
              </div>
            </div>

            {/* Region */}
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Kraj
              </h3>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {REGIONS_WITH_CALCULATIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — skóre {r.plantFeasibility}/100
                  </option>
                ))}
              </select>
              {region && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800 rounded-lg p-2">
                    <div className="text-cyan-400 font-bold text-sm">{region.annualSurplus?.toLocaleString("cs-CZ")} MWh</div>
                    <div className="text-xs text-slate-500">Přebytek/rok</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2">
                    <div className="text-green-400 font-bold text-sm">{region.renewableCapacity} MW</div>
                    <div className="text-xs text-slate-500">OZE kapacita</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2">
                    <div className="text-violet-400 font-bold text-sm">{region.plantFeasibility}/100</div>
                    <div className="text-xs text-slate-500">Skóre lokality</div>
                  </div>
                </div>
              )}
            </div>

            {/* Monthly surplus */}
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Měsíční přebytek energie
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="range"
                  min={userType === "household" ? 50 : 500}
                  max={userType === "household" ? 1000 : 200000}
                  step={userType === "household" ? 50 : 500}
                  value={monthlySurplus}
                  onChange={(e) => setMonthlySurplus(Number(e.target.value))}
                  className="flex-1 accent-cyan-500"
                />
                <div className="w-28 text-right">
                  <span className="text-xl font-bold text-cyan-400">
                    {monthlySurplus.toLocaleString("cs-CZ")}
                  </span>
                  <span className="text-slate-400 text-sm"> kWh</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {SURPLUS_PRESETS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setMonthlySurplus(v)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      monthlySurplus === v
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {v.toLocaleString("cs-CZ")} kWh
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold text-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
              {loading ? "Počítám..." : "Vypočítat zisk"}
            </button>
          </div>

          {/* Right: Results */}
          <div>
            {!calculated ? (
              <div className="card-glass rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 animate-pulse-slow">
                  <TrendingUp className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Čekám na výpočet</h3>
                <p className="text-slate-400 max-w-xs">
                  Vyberte lokalitu a zadejte přebytek energie. Výsledky se zobrazí zde.
                </p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="card-glass rounded-2xl p-6 glow-green">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="font-bold text-lg">Výsledky výpočtu</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-xl p-5 border border-cyan-500/20">
                      <div className="text-sm text-slate-400 mb-1">Měsíční příjem</div>
                      <div className="text-4xl font-black text-gradient-primary">
                        {formatCZK(result.monthlyIncomeCZK)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-1">Roční příjem</div>
                        <div className="text-xl font-bold text-green-400">
                          {formatCZK(result.annualIncomeCZK)}
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-1">Cena za kWh</div>
                        <div className="text-xl font-bold text-cyan-400">
                          {result.pricePerKwhCZK.toFixed(2)} Kč
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-1">Regionální bonus</div>
                        <div className="text-xl font-bold text-violet-400">
                          ×{result.regionMultiplier}
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-1">Návratnost FVE</div>
                        <div className="text-xl font-bold text-amber-400">
                          {result.breakEvenMonths < 120
                            ? `${Math.round(result.breakEvenMonths / 12)} let`
                            : `${result.breakEvenMonths} měs.`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-glass rounded-2xl p-5">
                  <h4 className="font-semibold mb-3 text-cyan-400">Jak přijít o méně peněz</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Registrujte přebytek přes náš portál – dostanete přesné ocenění
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Výkupní ceny v regionech s elektrárnami jsou o 15–40 % vyšší
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Firmy dostávají bonus 15 % za objem nad 1 000 MWh/rok
                    </li>
                  </ul>
                </div>

                <Link
                  href="/map"
                  className="block w-full py-3 rounded-xl border border-cyan-500/50 text-cyan-400 text-center font-semibold hover:bg-cyan-500/10 transition-all"
                >
                  Zobrazit elektrárnu ve vaší lokalitě →
                </Link>
              </div>
            ) : (
              <div className="card-glass rounded-2xl p-8 text-center">
                <p className="text-red-400">Chyba výpočtu. Zkuste to znovu.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="mt-8 card-glass rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 text-cyan-400">Jak se stanovuje výkupní cena?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400">
            <div>
              <div className="font-semibold text-slate-300 mb-2">Regionální multiplikátor</div>
              <p>Kraje s vyšší poptávkou po ukládání energie (velká průmyslová spotřeba, málo OZE) mají vyšší výkupní cenu. Jihočeský kraj (Temelín) a Ústecký kraj jsou centry přebytků.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-300 mb-2">Tržní cena vodíku</div>
              <p>Zelený vodík se aktuálně obchoduje za ~4,50 EUR/kg. Elektrolýza spotřebuje ~50 kWh na kg H₂. Výkupní cena odráží tuto konverzní efektivitu minus marže.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-300 mb-2">Dotační podpora</div>
              <p>Elektrárny v síti HydroGrid CZ čerpají dotace MPO (45 % CAPEX) a REPowerEU (30 % CAPEX). To umožňuje vyplácet vyšší výkupní ceny dodavatelům energie.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-bg flex items-center justify-center text-slate-400">Načítám...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
