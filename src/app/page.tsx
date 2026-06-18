"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Zap, MapPin, Calculator, TrendingUp, Leaf, Factory,
  ChevronRight, Activity, Globe, Shield, ArrowRight
} from "lucide-react";

const STATS = [
  { label: "Přebytek OZE v ČR/rok", value: "4,2 TWh", sub: "dle ČEPS 2024" },
  { label: "Ztráty bez úložiště", value: "38 %", sub: "nevyužitá energie" },
  { label: "Potenciální úspora", value: "12 mld. Kč", sub: "ročně pro ČR" },
  { label: "Snížení CO₂", value: "1,8 Mt", sub: "ročně" },
];

const FEATURES = [
  {
    icon: MapPin,
    title: "Inteligentní rozmístění",
    desc: "AI algoritmus vypočítá optimální umístění továren podle dat ČEPS, ERÚ a hustoty obyvatelstva.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Zap,
    title: "Sběrná energetická síť",
    desc: "Sbíráme přebytky z domácností, firem i elektráren. Každý kilowatt se zhodnotí.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Calculator,
    title: "Výpočet zisku online",
    desc: "Zadejte lokalitu a odhadované přebytky – okamžitě uvidíte korunový zisk na kWh.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Activity,
    title: "AI predikce a plánování",
    desc: "Strojové učení předpovídá budoucí přebytky a navrhuje expanzi sítě s návratností.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Factory,
    title: "Brownfield prioritizace",
    desc: "Elektrárny stavíme přednostně v areálech bývalých dolů a průmyslových zón.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: TrendingUp,
    title: "Transparentní výnosy",
    desc: "Jasný výpočet sdílení zisku. Domácnosti i firmy vidí svůj podíl v reálném čase.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="gradient-bg grid-lines min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 card-glass border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient-primary">HydroGrid CZ</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/map" className="hover:text-cyan-400 transition-colors">Mapa sítě</Link>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
            <Link href="/calculator" className="hover:text-cyan-400 transition-colors">Kalkulačka</Link>
            <Link href="/ai" className="hover:text-cyan-400 transition-colors">AI Analýza</Link>
          </div>
          <Link
            href="/calculator"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
          >
            Spočítat zisk <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm mb-8">
            <Leaf className="w-4 h-4" />
            Zelená energetika pro Českou republiku
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Přebytky energie
            <br />
            <span className="text-gradient-primary">přeměňte na zisk</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Budujeme síť vodíkových elektráren po celé ČR. Nakupujeme vaše přebytky z
            obnovitelných zdrojů, ukládáme je jako zelený vodík a vracíme jako levnou elektřinu,
            když ji síť potřebuje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/calculator"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold text-lg hover:opacity-90 transition-all hover:scale-105"
            >
              <Calculator className="w-5 h-5" />
              Spočítat váš zisk
            </Link>
            <Link
              href="/map"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold text-lg hover:border-cyan-500 hover:text-cyan-400 transition-all"
            >
              <MapPin className="w-5 h-5" />
              Zobrazit mapu sítě
            </Link>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="card-glass rounded-2xl p-5">
                <div className="text-2xl font-black text-gradient-primary mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-slate-300 mb-1">{s.label}</div>
                <div className="text-xs text-slate-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">Jak to funguje</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Třístupňový cyklus – přebytek → vodík → elektřina
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Sbíráme přebytky",
                desc: "Kupujeme levnou energii od domácností, solárních parků, větrných elektráren a průmyslových podniků při přebytku v síti.",
                color: "text-cyan-400",
              },
              {
                step: "02",
                icon: Factory,
                title: "Ukládáme jako vodík",
                desc: "PEM elektrolyzéry přemění elektřinu na zelený vodík. Továrny stojí strategicky – minimální ztráty přenosu.",
                color: "text-green-400",
              },
              {
                step: "03",
                icon: Globe,
                title: "Vracíme elektřinu",
                desc: "Při nedostatku palivové články převedou vodík zpět na elektřinu. Stabilizujeme síť a vydělávame na cenovém rozdílu.",
                color: "text-violet-400",
              },
            ].map((item) => (
              <div key={item.step} className="card-glass rounded-2xl p-8 relative hover:glow-border transition-all">
                <div className="text-5xl font-black text-slate-800 absolute top-4 right-6">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">Proč HydroGrid CZ</h2>
            <p className="text-slate-400 text-lg">Nejefektivnější systém ukládání energie v ČR</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-glass rounded-2xl p-6 hover:glow-border transition-all group">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass rounded-3xl p-12 text-center glow-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-green-500/5 pointer-events-none" />
            <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-4">Jste domácnost nebo firma?</h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Zjistěte, kolik Kč vám přinese každá kilowatthodina přebytku z vaší lokality.
              Výpočet trvá 30 sekund.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/calculator?type=household"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold text-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Pro domácnosti <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/calculator?type=business"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold text-lg hover:border-cyan-500 hover:text-cyan-400 transition-all"
              >
                Pro firmy <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gradient-primary">HydroGrid CZ</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>Data: ČEPS · ERÚ · OTE · ČSÚ</span>
            <span>·</span>
            <Link href="/map" className="hover:text-slate-300 transition-colors">Mapa</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link href="/ai" className="hover:text-slate-300 transition-colors">AI</Link>
          </div>
          <div className="text-sm text-slate-600">© 2025 HydroGrid CZ s.r.o.</div>
        </div>
      </footer>
    </div>
  );
}
