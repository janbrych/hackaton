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
  { icon: MapPin,     title: "Inteligentní rozmístění",  desc: "AI algoritmus vypočítá optimální umístění továren podle dat ČEPS, ERÚ a hustoty obyvatelstva.", color: "text-blue-600",   bg: "bg-blue-50"   },
  { icon: Zap,        title: "Sběrná energetická síť",   desc: "Sbíráme přebytky z domácností, firem i elektráren. Každý kilowatt se zhodnotí.",              color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Calculator, title: "Výpočet zisku online",     desc: "Zadejte lokalitu a odhadované přebytky – okamžitě uvidíte korunový zisk na kWh.",             color: "text-violet-600", bg: "bg-violet-50"  },
  { icon: Activity,   title: "AI predikce a plánování",  desc: "Strojové učení předpovídá budoucí přebytky a navrhuje expanzi sítě s návratností.",            color: "text-amber-600",  bg: "bg-amber-50"   },
  { icon: Factory,    title: "Brownfield prioritizace",  desc: "Elektrárny stavíme přednostně v areálech bývalých dolů a průmyslových zón.",                   color: "text-rose-600",   bg: "bg-rose-50"    },
  { icon: TrendingUp, title: "Transparentní výnosy",     desc: "Jasný výpočet sdílení zisku. Domácnosti i firmy vidí svůj podíl v reálném čase.",              color: "text-sky-600",    bg: "bg-sky-50"     },
];

const STEPS = [
  { step: "01", icon: Zap,     title: "Sbíráme přebytky",   color: "text-blue-600",   bg: "bg-blue-50",
    desc: "Kupujeme levnou energii od domácností, solárních parků, větrných elektráren a průmyslových podniků při přebytku v síti." },
  { step: "02", icon: Factory, title: "Ukládáme jako vodík", color: "text-emerald-600", bg: "bg-emerald-50",
    desc: "PEM elektrolyzéry přemění elektřinu na zelený vodík. Továrny stojí strategicky – minimální ztráty přenosu." },
  { step: "03", icon: Globe,   title: "Vracíme elektřinu",   color: "text-violet-600", bg: "bg-violet-50",
    desc: "Při nedostatku palivové články převedou vodík zpět na elektřinu. Stabilizujeme síť a vydělávame na cenovém rozdílu." },
];

export default function HomePage() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", letterSpacing: "-0.02em" }}>H2Age</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden-mobile">
            {[["Mapa sítě", "/map"], ["Dashboard", "/dashboard"], ["Kalkulačka", "/calculator"], ["AI Analýza", "/ai"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: 14, fontWeight: 500, color: "#64748b", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#2563eb")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
              >{label}</Link>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/register" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #bfdbfe", fontSize: 14, fontWeight: 600, color: "#2563eb", textDecoration: "none", background: "transparent" }}>
              Registrovat se
            </Link>
            <Link href="/calculator" style={{ padding: "8px 16px", borderRadius: 8, background: "#2563eb", fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              Spočítat zisk <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: 80, left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: "20%", width: 320, height: 320, background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
          {/* badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 500, marginBottom: 32 }}>
            <Leaf style={{ width: 14, height: 14 }} />
            Zelená energetika pro Českou republiku
          </div>

          {/* headline */}
          <h1 style={{ fontSize: "clamp(42px, 6vw, 80px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: 24 }}>
            Přebytky energie
            <br />
            <span className="text-gradient-primary">přeměňte na zisk</span>
          </h1>

          {/* subtext */}
          <p style={{ fontSize: "clamp(16px, 1.8vw, 20px)", color: "#64748b", maxWidth: 680, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Budujeme síť vodíkových elektráren po celé ČR. Nakupujeme vaše přebytky z obnovitelných zdrojů,
            ukládáme je jako zelený vodík a vracíme jako levnou elektřinu, když ji síť potřebuje.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginBottom: 72 }}>
            <Link href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 17, textDecoration: "none", boxShadow: "0 4px 24px rgba(37,99,235,0.25)" }}>
              <Calculator style={{ width: 18, height: 18 }} />
              Spočítat váš zisk
            </Link>
            <Link href="/map" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 17, textDecoration: "none" }}>
              <MapPin style={{ width: 18, height: 18 }} />
              Zobrazit mapu sítě
            </Link>
          </div>

          {/* stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div className="text-gradient-primary" style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "#0f172a", marginBottom: 12, letterSpacing: "-0.02em" }}>Jak to funguje</h2>
            <p style={{ fontSize: 18, color: "#64748b", maxWidth: 480, margin: "0 auto" }}>Třístupňový cyklus – přebytek → vodík → elektřina</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {STEPS.map(item => (
              <div key={item.step} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "relative" }}>
                <span style={{ position: "absolute", top: 16, right: 20, fontSize: 52, fontWeight: 900, color: "#f1f5f9", lineHeight: 1, userSelect: "none" }}>{item.step}</span>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: item.bg.replace("bg-", "").includes("blue") ? "#eff6ff" : item.bg.replace("bg-", "").includes("emerald") ? "#ecfdf5" : "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <item.icon style={{ width: 26, height: 26 }} className={item.color} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "96px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "#0f172a", marginBottom: 12, letterSpacing: "-0.02em" }}>Proč H2Age</h2>
            <p style={{ fontSize: 18, color: "#64748b" }}>Nejefektivnější systém ukládání energie v ČR</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }} className={f.bg}>
                  <f.icon style={{ width: 22, height: 22 }} className={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 28, padding: "72px 48px", textAlign: "center", boxShadow: "0 0 0 1px rgba(37,99,235,0.08), 0 8px 40px rgba(37,99,235,0.07)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
            <Shield style={{ width: 44, height: 44, color: "#2563eb", margin: "0 auto 24px" }} />
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 900, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.02em" }}>Jste domácnost nebo firma?</h2>
            <p style={{ fontSize: 18, color: "#64748b", maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.65 }}>
              Zjistěte, kolik Kč vám přinese každá kilowatthodina přebytku z vaší lokality. Výpočet trvá 30 sekund.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
              <Link href="/calculator?type=household" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 4px 20px rgba(37,99,235,0.25)" }}>
                Pro domácnosti <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link href="/calculator?type=business" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
                Pro firmy <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap style={{ width: 16, height: 16, color: "#fff" }} />
            </div>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>H2Age</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 13, color: "#94a3b8" }}>
            <span>Data: ČEPS · ERÚ · OTE · ČSÚ</span>
            {[["Mapa", "/map"], ["Dashboard", "/dashboard"], ["AI", "/ai"]].map(([l, h]) => (
              <Link key={h} href={h} style={{ color: "#94a3b8", textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>© 2025 H2Age s.r.o.</div>
        </div>
      </footer>

    </div>
  );
}
