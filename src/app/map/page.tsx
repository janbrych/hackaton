"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, MapPin, Zap, Factory, Info, TrendingUp, Leaf, ArrowRight } from "lucide-react";
import { REGIONS_WITH_CALCULATIONS, type CzechRegion } from "@/data/czechRegions";
import { optimizePlantNetwork, type PlantRecommendation } from "@/lib/optimizer";
import { formatCZK, formatMWh } from "@/lib/utils";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#94a3b8", gap: 12, fontSize: 14 }}>
      <div style={{ width: 18, height: 18, border: "2px solid #bfdbfe", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Načítám mapu...
    </div>
  ),
});

const NETWORK = optimizePlantNetwork(45);

export default function MapPage() {
  const [selected, setSelected] = useState<CzechRegion | null>(null);

  const getRecommendation = (regionId: string): PlantRecommendation | undefined =>
    NETWORK.recommendations.find((r) => r.regionId === regionId);

  const feasibility = selected?.plantFeasibility ?? 0;
  const feasColor = feasibility >= 70 ? "#22c55e" : feasibility >= 50 ? "#f59e0b" : "#94a3b8";
  const feasBg = feasibility >= 70 ? "#f0fdf4" : feasibility >= 50 ? "#fffbeb" : "#f8fafc";
  const feasBorder = feasibility >= 70 ? "#bbf7d0" : feasibility >= 50 ? "#fde68a" : "#e2e8f0";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>

      {/* Top bar */}
      <div style={{ flexShrink: 0, background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            <ChevronLeft style={{ width: 16, height: 16 }} /> H2Age
          </Link>
          <span style={{ color: "#e2e8f0" }}>/</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin style={{ width: 16, height: 16, color: "#2563eb" }} />
            <span style={{ fontWeight: 700, color: "#2563eb", fontSize: 14 }}>Mapa energetické sítě</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 12, color: "#94a3b8" }}>
          {[["#22c55e", "Doporučená elektrárna"], ["#f59e0b", "Střední priorita"], ["#94a3b8", "Nízká rentabilita"]].map(([color, label]) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Map + sidebar */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <MapComponent
            regions={REGIONS_WITH_CALCULATIONS}
            recommendations={NETWORK.recommendations}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
        </div>

        {/* Sidebar */}
        <div style={{ width: 320, flexShrink: 0, borderLeft: "1px solid #e2e8f0", overflowY: "auto", background: "#fff" }}>
          {selected ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{selected.name}</h2>
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>{selected.population.toLocaleString("cs-CZ")} obyvatel</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#64748b", fontSize: 16, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>

              {/* Feasibility */}
              <div style={{ padding: "14px 16px", borderRadius: 14, border: `1px solid ${feasBorder}`, background: feasBg }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Skóre lokality</span>
                  <span style={{ fontSize: 26, fontWeight: 900, color: feasColor }}>{feasibility}/100</span>
                </div>
                <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: feasColor, borderRadius: 999, width: `${feasibility}%`, transition: "width 0.5s" }} />
                </div>
              </div>

              {/* Energy stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Výroba",      value: `${selected.energyProduction.toLocaleString("cs-CZ")} GWh`, color: "#2563eb",  Icon: Zap },
                  { label: "Spotřeba",    value: `${selected.energyConsumption.toLocaleString("cs-CZ")} GWh`, color: "#ef4444",  Icon: Factory },
                  { label: "OZE kapacita",value: `${selected.renewableCapacity} MW`,                          color: "#22c55e",  Icon: Leaf },
                  { label: "Přebytek/rok",value: formatMWh(selected.annualSurplus ?? 0),                      color: "#7c3aed",  Icon: TrendingUp },
                ].map((item) => (
                  <div key={item.label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <item.Icon style={{ width: 12, height: 12, color: item.color }} />
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Plant recommendation */}
              {getRecommendation(selected.id) ? (() => {
                const rec = getRecommendation(selected.id)!;
                return (
                  <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
                      <Factory style={{ width: 16, height: 16 }} /> Doporučená elektrárna
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { label: "Velikost",   value: `${rec.plantSize === "large" ? "Velká" : rec.plantSize === "medium" ? "Střední" : "Malá"}${rec.quantity > 1 ? ` ×${rec.quantity}` : ""}`, color: "#0f172a" },
                        { label: "Kapacita",   value: `${rec.totalCapacityMW} MW`,      color: "#2563eb" },
                        { label: "Investice",  value: formatCZK(rec.capitalCostCZK),    color: "#0f172a" },
                        { label: "Po dotacích",value: formatCZK(rec.netCapitalCost),    color: "#16a34a" },
                        { label: "Roční výnos",value: formatCZK(rec.annualRevenueCZK), color: "#16a34a" },
                        { label: "Návratnost", value: `${rec.paybackYears} let`,        color: rec.paybackYears < 10 ? "#16a34a" : rec.paybackYears < 15 ? "#d97706" : "#ef4444" },
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: "#64748b" }}>{row.label}</span>
                          <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    {rec.reasoning.length > 0 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #bbf7d0" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Zdůvodnění</div>
                        {rec.reasoning.map((r, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                            <span style={{ color: "#22c55e", flexShrink: 0, marginTop: 1 }}>✓</span>{r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div style={{ border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Info style={{ width: 16, height: 16, color: "#94a3b8", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#64748b" }}>Tento kraj nesplňuje minimální kritéria pro elektrárnu H2Age.</span>
                </div>
              )}

              <Link href={`/calculator?region=${selected.id}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", borderRadius: 12, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(37,99,235,0.2)" }}>
                Spočítat zisk v tomto kraji <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          ) : (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Síť H2Age</h2>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>Klikněte na kraj v mapě pro detail elektrárny a energetická data.</p>
              </div>

              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Lokalit",    value: `${NETWORK.recommendations.length}`, color: "#2563eb" },
                  { label: "Kapacita",   value: `${NETWORK.totalCapacityMW} MW`,     color: "#10b981" },
                  { label: "Pokrytí",    value: `${NETWORK.coveragePercent} %`,       color: "#7c3aed" },
                  { label: "Roční výnos",value: formatCZK(NETWORK.totalAnnualRevenueCZK), color: "#d97706" },
                ].map(item => (
                  <div key={item.label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Přehled lokalit</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {NETWORK.recommendations.map((rec) => (
                    <button key={rec.regionId}
                      onClick={() => { const r = REGIONS_WITH_CALCULATIONS.find(r => r.id === rec.regionId); if (r) setSelected(r); }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#bfdbfe"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{rec.regionName}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{rec.totalCapacityMW} MW · {rec.paybackYears} let návratnost</div>
                      </div>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: rec.feasibilityScore >= 70 ? "#22c55e" : rec.feasibilityScore >= 50 ? "#f59e0b" : "#94a3b8", flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
