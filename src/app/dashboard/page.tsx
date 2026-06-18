"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, CartesianGrid
} from "recharts";
import {
  Zap, ChevronLeft, TrendingUp, Factory, Leaf,
  DollarSign, Activity, BarChart3, ArrowUpRight, Atom, Sun, Wind, Droplets, Flame, Wifi, WifiOff
} from "lucide-react";
import { REGIONS_WITH_CALCULATIONS } from "@/data/czechRegions";
import { optimizePlantNetwork } from "@/lib/optimizer";
import { formatCZK, formatMWh, formatNumber } from "@/lib/utils";
import type { LiveGeneration } from "@/lib/energyApi";

const NETWORK = optimizePlantNetwork(45);

const HOURLY_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  surplus: Math.max(0, Math.sin((i - 6) * Math.PI / 12) * 850 + Math.random() * 200),
  storage: Math.max(0, Math.cos((i - 14) * Math.PI / 12) * 620 + 400 + Math.random() * 100),
  price: 1.2 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.2,
}));

const REGION_CHART = REGIONS_WITH_CALCULATIONS
  .sort((a, b) => (b.annualSurplus ?? 0) - (a.annualSurplus ?? 0))
  .slice(0, 8)
  .map((r) => ({
    name: r.name.replace(" kraj", "").replace("Kraj ", ""),
    surplus: Math.round((r.annualSurplus ?? 0) / 1000),
    oze: Math.round(r.renewableCapacity),
    feasibility: r.plantFeasibility ?? 0,
  }));

const RADAR_DATA = [
  { metric: "OZE kapacita", value: 80, full: 100 },
  { metric: "Přebytek", value: 92, full: 100 },
  { metric: "Dostupnost", value: 65, full: 100 },
  { metric: "Infrastruktura", value: 75, full: 100 },
  { metric: "Dotace", value: 88, full: 100 },
  { metric: "Návratnost", value: 70, full: 100 },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const GEN_SOURCES = [
  { key: "nuclear" as keyof LiveGeneration,  label: "Jaderná",  Icon: Atom,     color: "#7c3aed", barColor: "bg-violet-500", maxMW: 4500 },
  { key: "thermal" as keyof LiveGeneration,  label: "Tepelná",  Icon: Flame,    color: "#f97316", barColor: "bg-orange-400", maxMW: 4000 },
  { key: "solar"   as keyof LiveGeneration,  label: "Solární",  Icon: Sun,      color: "#f59e0b", barColor: "bg-amber-400",  maxMW: 2500 },
  { key: "wind"    as keyof LiveGeneration,  label: "Větrná",   Icon: Wind,     color: "#2563eb", barColor: "bg-blue-500",   maxMW: 800  },
  { key: "hydro"   as keyof LiveGeneration,  label: "Vodní",    Icon: Droplets, color: "#0ea5e9", barColor: "bg-sky-400",    maxMW: 600  },
];

const KPI = [
  { label: "Celková kapacita sítě",  value: () => `${NETWORK.totalCapacityMW} MW`,                    sub: () => `${NETWORK.recommendations.length} elektrárenských lokalit`, icon: Factory,    color: "#2563eb",  bg: "#eff6ff"  },
  { label: "Roční příjem sítě",      value: () => formatCZK(NETWORK.totalAnnualRevenueCZK),            sub: () => "Po odečtení OPEX",                                         icon: DollarSign, color: "#10b981",  bg: "#ecfdf5"  },
  { label: "Průměrná návratnost",    value: () => `${NETWORK.avgPaybackYears} let`,                    sub: () => "Po dotacích MPO + EU",                                     icon: TrendingUp, color: "#7c3aed",  bg: "#f5f3ff"  },
  { label: "Úspora CO₂",            value: () => `${formatNumber(NETWORK.annualCO2SavedTons)} t`,     sub: () => "Ročně vs. uhelné zálohy",                                  icon: Leaf,       color: "#f59e0b",  bg: "#fffbeb"  },
];

function LiveGenerationPanel({ data }: { data: LiveGeneration | null }) {
  const isPositive = data ? data.surplus >= 0 : true;
  const surplusAbs = data ? Math.abs(data.surplus) : 0;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: 20, height: 20, color: "#2563eb" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Živá data ČEPS</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Výroba elektřiny v České republice</div>
          </div>
        </div>
        {data ? (
          data.isLive ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#059669" }}>
              <Wifi style={{ width: 12, height: 12 }} /> ENTSO-E Live
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#d97706" }}>
              <WifiOff style={{ width: 12, height: 12 }} /> Simulace
            </span>
          )
        ) : (
          <span style={{ padding: "4px 12px", background: "#f1f5f9", borderRadius: 999, fontSize: 12, color: "#94a3b8" }}>Načítání…</span>
        )}
      </div>

      {data && (
        <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, border: `1px solid ${isPositive ? "#bbf7d0" : "#fecaca"}`, background: isPositive ? "#f0fdf4" : "#fef2f2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>Bilance sítě</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: isPositive ? "#059669" : "#dc2626" }}>
              {isPositive ? "+" : "−"}{surplusAbs.toLocaleString("cs-CZ")} MW
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>Výroba / Spotřeba</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{data.total.toLocaleString("cs-CZ")} MW / {data.consumption.toLocaleString("cs-CZ")} MW</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: isPositive ? "#059669" : "#dc2626" }}>{isPositive ? "Přebytek" : "Deficit"}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {GEN_SOURCES.map(({ key, label, Icon, color, barColor, maxMW }) => {
          const mw = data ? (data[key] as number) : 0;
          const pct = data ? Math.min(100, (mw / maxMW) * 100) : 0;
          const share = data ? Math.round((mw / data.total) * 100) : 0;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon style={{ width: 16, height: 16, color, flexShrink: 0 }} />
              <div style={{ width: 56, fontSize: 12, color: "#64748b", flexShrink: 0 }}>{label}</div>
              <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                <div className={barColor} style={{ width: data ? `${pct}%` : "0%", height: "100%", borderRadius: 999, transition: "width 0.7s" }} />
              </div>
              <div style={{ width: 80, textAlign: "right", fontSize: 12, fontWeight: 600, color: "#374151", flexShrink: 0 }}>{data ? `${mw.toLocaleString("cs-CZ")} MW` : "—"}</div>
              <div style={{ width: 28, textAlign: "right", fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>{data ? `${share}%` : ""}</div>
            </div>
          );
        })}
      </div>
      {data && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>
          Aktualizováno: {new Date(data.timestamp).toLocaleString("cs-CZ")} · obnovení za 60 s
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [activeRegion, setActiveRegion] = useState(REGIONS_WITH_CALCULATIONS[2]);
  const [liveTime, setLiveTime] = useState(new Date());
  const [liveGeneration, setLiveGeneration] = useState<LiveGeneration | null>(null);

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchGeneration = async () => {
      try {
        const res = await fetch("/api/energy-live?type=generation");
        if (res.ok) setLiveGeneration(await res.json());
      } catch { /* keep previous */ }
    };
    fetchGeneration();
    const interval = setInterval(fetchGeneration, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: "#64748b", textDecoration: "none" }}>
              <ChevronLeft style={{ width: 16, height: 16 }} /> H2Age
            </Link>
            <span style={{ color: "#e2e8f0" }}>/</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <BarChart3 style={{ width: 16, height: 16, color: "#2563eb" }} />
              <span style={{ fontWeight: 600, color: "#2563eb", fontSize: 14 }}>Síťový Dashboard</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#64748b" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} className="animate-pulse-slow" />
            <span>Živá data</span>
            <span style={{ color: "#e2e8f0" }}>|</span>
            <span style={{ fontWeight: 600, color: "#374151" }}>{liveTime.toLocaleTimeString("cs-CZ")}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 64px" }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {KPI.map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 22, height: 22, color }} />
              </div>
              <div>
                <div className="text-gradient-primary" style={{ fontSize: 22, fontWeight: 900 }}>{value()}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live panel */}
        <div style={{ marginBottom: 24 }}>
          <LiveGenerationPanel data={liveGeneration} />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Přebytek vs. ukládání (24h)</div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#94a3b8" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "inline-block", width: 12, height: 4, background: "#2563eb", borderRadius: 2 }} /> Přebytek</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "inline-block", width: 12, height: 4, background: "#10b981", borderRadius: 2 }} /> Uloženo</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={HOURLY_DATA}>
                <defs>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={3} />
                <YAxis stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 11 }} unit=" MW" />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="surplus" stroke="#2563eb" fill="url(#gS)" strokeWidth={2} name="Přebytek" />
                <Area type="monotone" dataKey="storage" stroke="#10b981" fill="url(#gT)" strokeWidth={2} name="Uloženo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Přebytek dle krajů (GWh/rok)</div>
              <Activity style={{ width: 18, height: 18, color: "#cbd5e1" }} />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={REGION_CHART} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="surplus" fill="#2563eb" opacity={0.85} radius={[4, 4, 0, 0]} name="Přebytek (GWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Doporučené lokality elektráren</div>
            <Link href="/map" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "#2563eb", textDecoration: "none" }}>
              Zobrazit na mapě <ArrowUpRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["Kraj","Velikost","Kapacita","Investice","Roční výnos","Návratnost","Skóre"].map((h, i) => (
                    <th key={h} style={{ padding: "0 16px 12px 0", textAlign: i >= 2 ? "right" : "left", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NETWORK.recommendations.slice(0, 10).map((rec) => (
                  <tr key={rec.regionId} onClick={() => { const r = REGIONS_WITH_CALCULATIONS.find(r => r.id === rec.regionId); if (r) setActiveRegion(r); }}
                    style={{ borderBottom: "1px solid #f8fafc", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px 12px 0", fontWeight: 600, color: "#0f172a" }}>{rec.regionName}</td>
                    <td style={{ padding: "12px 16px 12px 0" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                        background: rec.plantSize === "large" ? "#f5f3ff" : rec.plantSize === "medium" ? "#eff6ff" : "#f1f5f9",
                        color: rec.plantSize === "large" ? "#7c3aed" : rec.plantSize === "medium" ? "#2563eb" : "#64748b" }}>
                        {rec.plantSize === "large" ? "Velká" : rec.plantSize === "medium" ? "Střední" : "Malá"}{rec.quantity > 1 ? ` ×${rec.quantity}` : ""}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px 12px 0", textAlign: "right", color: "#2563eb", fontWeight: 600 }}>{rec.totalCapacityMW} MW</td>
                    <td style={{ padding: "12px 16px 12px 0", textAlign: "right", color: "#374151" }}>{formatCZK(rec.capitalCostCZK)}</td>
                    <td style={{ padding: "12px 16px 12px 0", textAlign: "right", color: "#10b981", fontWeight: 600 }}>{formatCZK(rec.annualRevenueCZK)}</td>
                    <td style={{ padding: "12px 16px 12px 0", textAlign: "right" }}>
                      <span style={{ fontWeight: 600, color: rec.paybackYears < 10 ? "#10b981" : rec.paybackYears < 15 ? "#f59e0b" : "#ef4444" }}>{rec.paybackYears} let</span>
                    </td>
                    <td style={{ padding: "12px 0", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <div style={{ width: 64, height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${rec.feasibilityScore}%`, height: "100%", background: "linear-gradient(90deg,#2563eb,#38bdf8)", borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{rec.feasibilityScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 16 }}>Profil regionu: {activeRegion.name}</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#6b7280", fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: "#9ca3af", fontSize: 9 }} domain={[0, 100]} />
                <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#2563eb", marginBottom: 16 }}>Celková bilance projektu</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Celková investice sítě", value: formatCZK(NETWORK.totalCapitalCostCZK), color: "#374151" },
                { label: "Pokrytý přebytek", value: formatMWh(NETWORK.totalSurplusCoveredMWh), color: "#2563eb" },
                { label: "Počet elektráren", value: `${NETWORK.recommendations.length} lokalit`, color: "#10b981" },
                { label: "Celková kapacita", value: `${NETWORK.totalCapacityMW} MW`, color: "#7c3aed" },
                { label: "Pokrytí krajů", value: `${NETWORK.coveragePercent} %`, color: "#f59e0b" },
                { label: "CO₂ úspora/rok", value: `${formatNumber(NETWORK.annualCO2SavedTons)} t`, color: "#ef4444" },
              ].map(item => (
                <div key={item.label} style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 16, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12 }}>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                <span style={{ color: "#2563eb", fontWeight: 600 }}>Datové zdroje:</span>{" "}
                ČEPS (přenosová soustava), ERÚ (regulace), OTE (trh s elektřinou), ČSÚ (demografie),
                MPO (průmyslová spotřeba), ČHMÚ (obnovitelné zdroje). Data aktualizována čtvrtletně.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
