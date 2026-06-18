"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, MapPin, Zap, Factory, Info, TrendingUp, Leaf } from "lucide-react";
import { REGIONS_WITH_CALCULATIONS, type CzechRegion } from "@/data/czechRegions";
import { optimizePlantNetwork, type PlantRecommendation } from "@/lib/optimizer";
import { formatCZK, formatMWh } from "@/lib/utils";

// Dynamically import map (no SSR – Leaflet needs window)
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-[#0d1526]">
    <div className="text-slate-400 flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      Načítám mapu...
    </div>
  </div>
)});

const NETWORK = optimizePlantNetwork(45);

export default function MapPage() {
  const [selected, setSelected] = useState<CzechRegion | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getRecommendation = (regionId: string): PlantRecommendation | undefined =>
    NETWORK.recommendations.find((r) => r.regionId === regionId);

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1e] overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-slate-800/50 px-4 py-3 flex items-center justify-between card-glass">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" />
            HydroGrid CZ
          </Link>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-cyan-400">Mapa energetické sítě</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-400" /> Doporučená elektrárna
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400" /> Střední priorita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-500" /> Nízká rentabilita
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapComponent
            regions={REGIONS_WITH_CALCULATIONS}
            recommendations={NETWORK.recommendations}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-l border-slate-800 overflow-y-auto card-glass">
          {selected ? (
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selected.name}</h2>
                  <p className="text-sm text-slate-400">{selected.population.toLocaleString("cs-CZ")} obyvatel</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none"
                >×</button>
              </div>

              {/* Feasibility badge */}
              <div className={`px-4 py-3 rounded-xl border ${
                (selected.plantFeasibility ?? 0) >= 70
                  ? "border-green-500/30 bg-green-500/10"
                  : (selected.plantFeasibility ?? 0) >= 50
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-slate-600 bg-slate-800"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Skóre lokality</span>
                  <span className={`text-2xl font-black ${
                    (selected.plantFeasibility ?? 0) >= 70 ? "text-green-400" :
                    (selected.plantFeasibility ?? 0) >= 50 ? "text-amber-400" : "text-slate-400"
                  }`}>{selected.plantFeasibility}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (selected.plantFeasibility ?? 0) >= 70 ? "bg-green-400" :
                      (selected.plantFeasibility ?? 0) >= 50 ? "bg-amber-400" : "bg-slate-500"
                    }`}
                    style={{ width: `${selected.plantFeasibility}%` }}
                  />
                </div>
              </div>

              {/* Energy stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Výroba", value: `${selected.energyProduction.toLocaleString("cs-CZ")} GWh`, color: "text-cyan-400", icon: Zap },
                  { label: "Spotřeba", value: `${selected.energyConsumption.toLocaleString("cs-CZ")} GWh`, color: "text-red-400", icon: Factory },
                  { label: "OZE kapacita", value: `${selected.renewableCapacity} MW`, color: "text-green-400", icon: Leaf },
                  { label: "Přebytek/rok", value: formatMWh(selected.annualSurplus ?? 0), color: "text-violet-400", icon: TrendingUp },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-800 rounded-xl p-3">
                    <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                    <div className={`font-bold text-sm ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Plant recommendation */}
              {getRecommendation(selected.id) ? (
                <div className="border border-green-500/30 bg-green-500/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <Factory className="w-4 h-4" />
                    Doporučená elektrárna
                  </div>
                  {(() => {
                    const rec = getRecommendation(selected.id)!;
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Velikost</span>
                          <span className="font-semibold">
                            {rec.plantSize === "large" ? "Velká" : rec.plantSize === "medium" ? "Střední" : "Malá"}
                            {rec.quantity > 1 ? ` ×${rec.quantity}` : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Kapacita</span>
                          <span className="font-semibold text-cyan-400">{rec.totalCapacityMW} MW</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Investice</span>
                          <span className="font-semibold">{formatCZK(rec.capitalCostCZK)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Po dotacích</span>
                          <span className="font-semibold text-green-400">{formatCZK(rec.netCapitalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Roční výnos</span>
                          <span className="font-semibold text-green-400">{formatCZK(rec.annualRevenueCZK)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Návratnost</span>
                          <span className={`font-semibold ${rec.paybackYears < 10 ? "text-green-400" : rec.paybackYears < 15 ? "text-amber-400" : "text-red-400"}`}>
                            {rec.paybackYears} let
                          </span>
                        </div>
                        {rec.reasoning.length > 0 && (
                          <div className="pt-2 border-t border-slate-700 space-y-1.5">
                            <div className="text-xs text-slate-500 font-semibold">Zdůvodnění:</div>
                            {rec.reasoning.map((r, i) => (
                              <div key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                                <span className="text-green-400 mt-0.5">✓</span>
                                {r}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Info className="w-4 h-4" />
                    Tento kraj nesplňuje minimální kritéria pro elektrárnu HydroGrid.
                  </div>
                </div>
              )}

              <Link
                href={`/calculator?region=${selected.id}`}
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold text-sm text-center hover:opacity-90 transition-opacity"
              >
                Spočítat zisk v tomto kraji →
              </Link>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <h2 className="font-bold text-lg">Síť HydroGrid CZ</h2>
              <p className="text-sm text-slate-400">
                Klikněte na kraj v mapě pro detail elektrárny a energetická data.
              </p>

              <div className="space-y-2">
                <h3 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Přehled lokalit</h3>
                {NETWORK.recommendations.map((rec) => (
                  <button
                    key={rec.regionId}
                    onClick={() => {
                      const r = REGIONS_WITH_CALCULATIONS.find(r => r.id === rec.regionId);
                      if (r) setSelected(r);
                    }}
                    className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-left"
                  >
                    <div>
                      <div className="text-sm font-semibold">{rec.regionName}</div>
                      <div className="text-xs text-slate-500">{rec.totalCapacityMW} MW · {rec.paybackYears} let</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      rec.feasibilityScore >= 70 ? "bg-green-400" :
                      rec.feasibilityScore >= 50 ? "bg-amber-400" : "bg-slate-500"
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
