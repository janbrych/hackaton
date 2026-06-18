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
import { optimizePlantNetwork, type NetworkOptimization } from "@/lib/optimizer";
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

const TOP_REGION = REGIONS_WITH_CALCULATIONS[0];
const RADAR_DATA = [
  { metric: "OZE kapacita", value: 80, full: 100 },
  { metric: "Přebytek", value: 92, full: 100 },
  { metric: "Dostupnost", value: 65, full: 100 },
  { metric: "Infrastruktura", value: 75, full: 100 },
  { metric: "Dotace", value: 88, full: 100 },
  { metric: "Návratnost", value: 70, full: 100 },
];

function StatCard({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string;
}) {
  return (
    <div className="card-glass rounded-2xl p-5 flex gap-4 items-start">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-black text-gradient-primary">{value}</div>
        <div className="text-sm font-semibold text-gray-700">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const GEN_SOURCES: {
  key: keyof LiveGeneration;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  barColor: string;
  maxMW: number;
}[] = [
  { key: 'nuclear',  label: 'Jaderná',   icon: Atom,     color: 'text-violet-600', barColor: 'bg-violet-500',  maxMW: 4500 },
  { key: 'thermal',  label: 'Tepelná',   icon: Flame,    color: 'text-orange-500', barColor: 'bg-orange-400',  maxMW: 4000 },
  { key: 'solar',    label: 'Solární',   icon: Sun,      color: 'text-amber-500',  barColor: 'bg-amber-400',   maxMW: 2500 },
  { key: 'wind',     label: 'Větrná',    icon: Wind,     color: 'text-blue-600',   barColor: 'bg-blue-500',    maxMW: 800  },
  { key: 'hydro',    label: 'Vodní',     icon: Droplets, color: 'text-sky-600',    barColor: 'bg-sky-400',     maxMW: 600  },
];

function LiveGenerationPanel({ data }: { data: LiveGeneration | null }) {
  const isPositive = data ? data.surplus >= 0 : true;
  const surplusAbs = data ? Math.abs(data.surplus) : 0;

  return (
    <div className="card-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight text-gray-900">Živá data ČEPS</h3>
            <p className="text-xs text-gray-400">Výroba elektřiny v České republice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data ? (
            data.isLive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-600">
                <Wifi className="w-3 h-3" />
                ENTSO-E Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-600">
                <WifiOff className="w-3 h-3" />
                Simulace
              </span>
            )
          ) : (
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-400 animate-pulse">
              Načítání…
            </span>
          )}
        </div>
      </div>

      {data && (
        <div className={`mb-5 p-4 rounded-xl border flex items-center justify-between ${
          isPositive ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`}>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Bilance sítě</div>
            <div className={`text-2xl font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : '−'}{surplusAbs.toLocaleString('cs-CZ')} MW
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-0.5">Výroba / Spotřeba</div>
            <div className="text-sm font-semibold text-gray-700">
              {data.total.toLocaleString('cs-CZ')} MW / {data.consumption.toLocaleString('cs-CZ')} MW
            </div>
            <div className={`text-xs font-semibold mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? 'Přebytek' : 'Deficit'}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {GEN_SOURCES.map(({ key, label, icon: Icon, color, barColor, maxMW }) => {
          const mw = data ? (data[key] as number) : 0;
          const pct = data ? Math.min(100, (mw / maxMW) * 100) : 0;
          const share = data ? Math.round((mw / data.total) * 100) : 0;

          return (
            <div key={key} className="flex items-center gap-3">
              <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
              <div className="w-16 text-xs text-gray-500 flex-shrink-0">{label}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-700`}
                  style={{ width: data ? `${pct}%` : '0%' }}
                />
              </div>
              <div className="w-20 text-right text-xs font-semibold text-gray-700 flex-shrink-0">
                {data ? `${mw.toLocaleString('cs-CZ')} MW` : '—'}
              </div>
              <div className="w-8 text-right text-xs text-gray-400 flex-shrink-0">
                {data ? `${share}%` : ''}
              </div>
            </div>
          );
        })}
      </div>

      {data && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
          Aktualizováno: {new Date(data.timestamp).toLocaleString('cs-CZ')}
          {' · '}obnovení za 60 s
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
        const res = await fetch('/api/energy-live?type=generation');
        if (res.ok) {
          const data: LiveGeneration = await res.json();
          setLiveGeneration(data);
        }
      } catch {
        // keep previous data on error
      }
    };

    fetchGeneration();
    const interval = setInterval(fetchGeneration, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gradient-bg min-h-screen pb-16 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors text-sm font-medium">
              <ChevronLeft className="w-4 h-4" />
              H2Age
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-600">Síťový Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
            <span>Živá data</span>
            <span className="text-gray-300">|</span>
            <span className="font-medium text-gray-700">{liveTime.toLocaleTimeString("cs-CZ")}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Celková kapacita sítě"
            value={`${NETWORK.totalCapacityMW} MW`}
            sub={`${NETWORK.recommendations.length} elektrárenských lokalit`}
            icon={Factory}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Roční příjem sítě"
            value={formatCZK(NETWORK.totalAnnualRevenueCZK)}
            sub="Po odečtení OPEX"
            icon={DollarSign}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            label="Průměrná návratnost"
            value={`${NETWORK.avgPaybackYears} let`}
            sub="Po dotacích MPO + EU"
            icon={TrendingUp}
            color="text-violet-600"
            bg="bg-violet-50"
          />
          <StatCard
            label="Úspora CO₂"
            value={`${formatNumber(NETWORK.annualCO2SavedTons)} t`}
            sub="Ročně vs. uhelné zálohy"
            icon={Leaf}
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {/* Live CEPS generation panel */}
        <LiveGenerationPanel data={liveGeneration} />

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-900">Přebytek vs. ukládání (24h)</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-blue-500 rounded inline-block" /> Přebytek</span>
                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500 rounded inline-block" /> Uloženo</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={HOURLY_DATA}>
                <defs>
                  <linearGradient id="gradSurplus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradStorage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={3} />
                <YAxis stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 11 }} unit=" MW" />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="surplus" stroke="#2563eb" fill="url(#gradSurplus)" strokeWidth={2} name="Přebytek" />
                <Area type="monotone" dataKey="storage" stroke="#10b981" fill="url(#gradStorage)" strokeWidth={2} name="Uloženo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-900">Přebytek dle krajů (GWh/rok)</h3>
              <Activity className="w-5 h-5 text-gray-300" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={REGION_CHART} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Bar dataKey="surplus" fill="#2563eb" opacity={0.85} radius={[4, 4, 0, 0]} name="Přebytek (GWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plant recommendations table */}
        <div className="card-glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg text-gray-900">Doporučené lokality elektráren</h3>
            <Link href="/map" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              Zobrazit na mapě <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 pr-4">Kraj</th>
                  <th className="text-left pb-3 pr-4">Velikost</th>
                  <th className="text-right pb-3 pr-4">Kapacita</th>
                  <th className="text-right pb-3 pr-4">Investice</th>
                  <th className="text-right pb-3 pr-4">Roční výnos</th>
                  <th className="text-right pb-3 pr-4">Návratnost</th>
                  <th className="text-right pb-3">Skóre</th>
                </tr>
              </thead>
              <tbody>
                {NETWORK.recommendations.slice(0, 10).map((rec) => (
                  <tr
                    key={rec.regionId}
                    onClick={() => {
                      const r = REGIONS_WITH_CALCULATIONS.find(r => r.id === rec.regionId);
                      if (r) setActiveRegion(r);
                    }}
                    className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium text-gray-900">{rec.regionName}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        rec.plantSize === "large" ? "bg-violet-100 text-violet-700" :
                        rec.plantSize === "medium" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {rec.plantSize === "large" ? "Velká" : rec.plantSize === "medium" ? "Střední" : "Malá"}
                        {rec.quantity > 1 ? ` ×${rec.quantity}` : ""}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-blue-600 font-semibold">{rec.totalCapacityMW} MW</td>
                    <td className="py-3 pr-4 text-right text-gray-600">{formatCZK(rec.capitalCostCZK)}</td>
                    <td className="py-3 pr-4 text-right text-emerald-600 font-semibold">{formatCZK(rec.annualRevenueCZK)}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`font-semibold ${rec.paybackYears < 10 ? "text-emerald-600" : rec.paybackYears < 15 ? "text-amber-600" : "text-red-500"}`}>
                        {rec.paybackYears} let
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                            style={{ width: `${rec.feasibilityScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{rec.feasibilityScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom row: radar + summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Profil regionu: {activeRegion.name}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#6b7280", fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: "#9ca3af", fontSize: 9 }} domain={[0, 100]} />
                <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="md:col-span-2 card-glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 text-blue-600">Celková bilance projektu</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Celková investice sítě", value: formatCZK(NETWORK.totalCapitalCostCZK), color: "text-gray-700" },
                { label: "Pokrytý přebytek", value: formatMWh(NETWORK.totalSurplusCoveredMWh), color: "text-blue-600" },
                { label: "Počet elektráren", value: `${NETWORK.recommendations.length} lokalit`, color: "text-emerald-600" },
                { label: "Celková kapacita", value: `${NETWORK.totalCapacityMW} MW`, color: "text-violet-600" },
                { label: "Pokrytí krajů", value: `${NETWORK.coveragePercent} %`, color: "text-amber-600" },
                { label: "CO₂ úspora/rok", value: `${formatNumber(NETWORK.annualCO2SavedTons)} t`, color: "text-rose-600" },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-gray-500">
                <span className="text-blue-600 font-semibold">Datové zdroje:</span>{" "}
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
