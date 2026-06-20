"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Zap, MapPin, Calculator, TrendingUp, Leaf, Users,
  ChevronRight, Activity, AlertTriangle, ArrowRight, Building2, Flame
} from "lucide-react";

const MiniMapUstecky = dynamic(() => import("@/components/MiniMapUstecky"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
      Načítám mapu…
    </div>
  ),
});

const STATS = [
  { label: "Obyvatel Ústeckého kraje", value: "820 tis.", sub: "v přechodu na čistou energii" },
  { label: "EU fondů pro kraj (JTF)", value: "950 mil. €", sub: "Fond spravedlivé transformace" },
  { label: "Domácností v en. chudobě", value: "18,5 %", sub: "priorita transformace" },
  { label: "Brownfieldů s OZE potenciálem", value: "2 355 ha", sub: "7 klíčových lokalit" },
];

const FEATURES = [
  { icon: MapPin,        title: "Mapa příležitostí",                  href: "/map",        color: "text-blue-600",   bg: "bg-blue-50",
    desc: "Interaktivní mapa ukazuje, kde v 7 okresech kraje má smysl investovat do OZE – podle solárního svitu, brownfieldů a infrastruktury." },
  { icon: Calculator,    title: "Kalkulačka energetického společenství", href: "/calculator", color: "text-emerald-600", bg: "bg-emerald-50",
    desc: "Spočítejte realistickou návratnost FVE pro vaši obec, školu nebo skupinu domácností. S dotacemi JTF/NZÚ/OPŽP i bez nich." },
  { icon: Activity,      title: "Dashboard transformace",              href: "/dashboard",  color: "text-violet-600", bg: "bg-violet-50",
    desc: "Přehled energetického mixu kraje v reálném čase: výroba, spotřeba, OZE kapacity a klíčové brownfieldy v každém okrese." },
  { icon: AlertTriangle, title: "Kdo vydělá, kdo prohraje?",          href: "/dashboard",  color: "text-amber-600",  bg: "bg-amber-50",
    desc: "Vizualizace energetické chudoby a sociálních dopadů transformace. Kdo z přechodu na OZE profituje a kdo zůstává pozadu." },
  { icon: Flame,         title: "Brownfieldy a vodík",                 href: "/map",        color: "text-rose-600",   bg: "bg-rose-50",
    desc: "Analýza 7 klíčových brownfieldů (Centrum Most, Triangle, Prunéřov…) pro vodíkovou elektrolýzu a velké FVE parky." },
  { icon: TrendingUp,    title: "AI poradce",                          href: "/ai",         color: "text-sky-600",    bg: "bg-sky-50",
    desc: "Zeptejte se AI na cokoliv: jak založit energetické společenství, jaké dotace jsou dostupné, kde v kraji stavět FVE." },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Users,      color: "text-blue-600",   bg: "#eff6ff",
    title: "Zvolte svůj profil",
    desc: "Jste obec, energetické společenství, domácnost nebo firma? Každý má jiné potřeby a jiné dotační možnosti – pomůžeme vám vyznat se." },
  { step: "02", icon: Calculator, color: "text-emerald-600", bg: "#ecfdf5",
    title: "Získejte realistický výpočet",
    desc: "Kalkulačka pracuje s reálnými daty Ústeckého kraje – sluneční svit po okresech, ceny elektřiny, instalační náklady, dotace JTF a NZÚ." },
  { step: "03", icon: TrendingUp, color: "text-violet-600",  bg: "#f5f3ff",
    title: "Rozhodněte se lépe",
    desc: "AI zodpoví vaše otázky a ukáže konkrétní kroky: kde podat žádost o dotaci, jak najít partnery, co jsou brownfieldy a jak na ně." },
];

const MAP_POINTS = [
  { label: "7 klíčových lokalit",    sub: "brownfieldy s OZE potenciálem" },
  { label: "2 355 ha",               sub: "plocha pro obnovitelné zdroje" },
  { label: "950 mil. € (JTF)",       sub: "EU fondy k dispozici" },
  { label: "265 MW plánovaný výkon", sub: "vodík + solár v brownfieldech" },
];

export default function HomePage() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", letterSpacing: "-0.02em" }}>EnergieÚK</span>
              <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>Ústecký kraj</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {[["Mapa", "/map"], ["Dashboard", "/dashboard"], ["Kalkulačka", "/calculator"], ["AI poradce", "/ai"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: 14, fontWeight: 500, color: "#64748b", textDecoration: "none" }}>{label}</Link>
            ))}
          </div>
          <Link href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: "#2563eb", fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
            Spočítat potenciál <ChevronRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 148, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 80, left: "15%", width: 500, height: 500, background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: "15%", width: 380, height: 380, background: "radial-gradient(circle, rgba(217,119,6,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 500, marginBottom: 28 }}>
            <Leaf style={{ width: 13, height: 13 }} />
            Energetická transformace Ústeckého kraje
          </div>

          <h1 style={{ fontSize: "clamp(40px, 5.5vw, 76px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: 22 }}>
            Uhelný kraj se mění.<br />
            <span className="text-gradient-primary">Data vám ukážou jak.</span>
          </h1>

          <p style={{ fontSize: "clamp(16px, 1.6vw, 19px)", color: "#64748b", maxWidth: 680, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Ústecký kraj uzavírá doly, přibývají solární panely a vznikají energetická společenství.
            AI průvodce pomáhá obcím, komunitám i domácnostem rozhodovat se lépe – s reálnými čísly.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginBottom: 72 }}>
            <Link href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 17, textDecoration: "none", boxShadow: "0 4px 24px rgba(37,99,235,0.25)" }}>
              <Calculator style={{ width: 18, height: 18 }} />
              Spočítat potenciál
            </Link>
            <Link href="/map" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 17, textDecoration: "none" }}>
              <MapPin style={{ width: 18, height: 18 }} />
              Prozkoumat mapu
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div className="text-gradient-primary" style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTEXT BANNER */}
      <section style={{ padding: "0 24px 72px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 20, padding: "36px 40px", display: "flex", gap: 28, alignItems: "flex-start" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Building2 style={{ width: 28, height: 28, color: "#d97706" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#92400e", marginBottom: 10 }}>Co se děje v Ústeckém kraji?</h2>
              <p style={{ fontSize: 15, color: "#78350f", lineHeight: 1.75, marginBottom: 10 }}>
                Uzavírají se uhelné doly, rekultivuje se krajina, na střechách škol přibývají fotovoltaické panely.
                Vznikají první energetická společenství. V areálu Doly Centrum u Mostu funguje vodíková laboratoř,
                průmyslová zóna Triangle plánuje elektrolýzu. Kraj má vodíkovou strategii do roku 2050.
              </p>
              <p style={{ fontSize: 15, color: "#78350f", lineHeight: 1.75 }}>
                Ale přechod neprobíhá rovnoměrně.{" "}
                <strong style={{ color: "#b45309" }}>18,5 % domácností je v energetické chudobě</strong> —
                plná elektřina, no peníze na zaplacení. Kdo z transformace profituje a kdo zůstává pozadu?
                Na tyto otázky odpovídá EnergieÚK.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section style={{ padding: "24px 24px 96px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 52, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 600, marginBottom: 20, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                <MapPin style={{ width: 12, height: 12 }} />
                Klíčové lokality
              </div>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 900, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Brownfieldy a OZE<br />v Ústeckém kraji
              </h2>
              <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.75, marginBottom: 28 }}>
                7 klíčových brownfieldů a průmyslových zón s největším potenciálem pro solární parky,
                větrné elektrárny a vodíkovou elektrolýzu. Data z evidence ERÚ a krajského úřadu.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {MAP_POINTS.map(pt => (
                  <div key={pt.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{pt.label}</span>
                      <span style={{ color: "#94a3b8", fontSize: 13, marginLeft: 8 }}>{pt.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 32 }}>
                <Link href="/map" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                  Otevřít interaktivní mapu <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", height: 420, position: "relative" }}>
              <MiniMapUstecky />
              <div style={{ position: "absolute", top: 14, left: 14, zIndex: 1000, background: "rgba(255,255,255,0.95)", border: "1px solid #e2e8f0", borderRadius: 10, padding: "7px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px #22c55e" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>5 aktivních lokalit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 900, color: "#0f172a", marginBottom: 12, letterSpacing: "-0.02em" }}>Jak to funguje</h2>
            <p style={{ fontSize: 18, color: "#64748b", maxWidth: 460, margin: "0 auto" }}>Tři kroky k lepšímu rozhodování o energii</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "relative" }}>
                <span style={{ position: "absolute", top: 16, right: 20, fontSize: 52, fontWeight: 900, color: "#f1f5f9", lineHeight: 1, userSelect: "none" }}>{item.step}</span>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <item.icon style={{ width: 26, height: 26 }} className={item.color} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "96px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 900, color: "#0f172a", marginBottom: 12, letterSpacing: "-0.02em" }}>Nástroje EnergieÚK</h2>
            <p style={{ fontSize: 18, color: "#64748b" }}>Vše pro inteligentní rozhodování o energii v Ústeckém kraji</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {FEATURES.map(f => (
              <Link key={f.title} href={f.href} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", textDecoration: "none", display: "block" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }} className={f.bg}>
                  <f.icon style={{ width: 22, height: 22 }} className={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 28, padding: "72px 48px", textAlign: "center", boxShadow: "0 0 0 1px rgba(37,99,235,0.08), 0 8px 40px rgba(37,99,235,0.07)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Users style={{ width: 28, height: 28, color: "#fff" }} />
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 900, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.02em" }}>Pro koho je EnergieÚK?</h2>
            <p style={{ fontSize: 18, color: "#64748b", maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.65 }}>
              Pro každého, kdo chce pochopit nebo ovlivnit energetickou transformaci Ústeckého kraje.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
              <Link href="/calculator?typ=spolecenstvi" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 4px 20px rgba(37,99,235,0.25)" }}>
                Pro energetická společenství <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link href="/calculator?typ=obec" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
                Pro obce a školy <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap style={{ width: 16, height: 16, color: "#fff" }} />
            </div>
            <div>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>EnergieÚK</span>
              <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>AI průvodce energetickou transformací</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 13, color: "#94a3b8" }}>
            <span>Data: ČEPS · ERÚ · ČSÚ · Kraj Ústecký</span>
            {[["Mapa", "/map"], ["Dashboard", "/dashboard"], ["AI", "/ai"]].map(([l, h]) => (
              <Link key={h} href={h} style={{ color: "#94a3b8", textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>© 2025 EnergieÚK</div>
        </div>
      </footer>

    </div>
  );
}
