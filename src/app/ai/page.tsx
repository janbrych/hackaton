"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Bot, User, Zap, TrendingUp, MapPin, Factory, Sparkles } from "lucide-react";
import { optimizePlantNetwork } from "@/lib/optimizer";
import { formatCZK } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const NETWORK = optimizePlantNetwork(45);

const SUGGESTED_QUESTIONS = [
  "Které kraje mají největší potenciál pro vodíkové elektrárny?",
  "Jak se počítá rentabilita elektrárny v Jihočeském kraji?",
  "Jaký je rozdíl mezi PEM a alkalickými elektrolyzéry?",
  "Kdy se vyplatí stavět velkou elektrárnu vs. více malých?",
  "Jak ovlivňuje brownfield lokalita investiční náklady?",
  "Jaká je predikce pro rozvoj vodíkové energetiky v ČR do 2030?",
];

const SIDEBAR_STATS = [
  { icon: Factory,    label: "Lokalit",    value: `${NETWORK.recommendations.length}`,              color: "#2563eb", bg: "#eff6ff" },
  { icon: Zap,        label: "Kapacita",   value: `${NETWORK.totalCapacityMW} MW`,                 color: "#10b981", bg: "#ecfdf5" },
  { icon: TrendingUp, label: "Roční výnos",value: formatCZK(NETWORK.totalAnnualRevenueCZK),        color: "#7c3aed", bg: "#f5f3ff" },
  { icon: MapPin,     label: "Pokrytí",    value: `${NETWORK.coveragePercent} %`,                  color: "#d97706", bg: "#fffbeb" },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Dobrý den! Jsem AI analytik H2Age. Mám přístup k datům ze sítě ${NETWORK.recommendations.length} vodíkových elektráren s celkovou kapacitou **${NETWORK.totalCapacityMW} MW** a predikovaným ročním výnosem **${formatCZK(NETWORK.totalAnnualRevenueCZK)}**.

Mohu vám pomoci s:
- **Analýzou lokalit** – optimální rozmístění elektráren dle dat ČEPS/ERÚ
- **Ekonomickými propočty** – návratnost investic, výkupní ceny
- **Technologiemi** – srovnání elektrolyzérů, palivových článků
- **Prognózami** – vývoj cen vodíku a energie do 2030

Na co se chcete zeptat?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMessage: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, context: `Síť má ${NETWORK.recommendations.length} lokalit, ${NETWORK.totalCapacityMW} MW celkové kapacity.` }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer || data.error || "Omlouvám se, odpověď nebyla dostupná.", timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Omlouvám se, došlo k chybě při zpracování. Zkuste to prosím znovu.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function formatInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} style={{ color: "#2563eb", fontWeight: 600 }}>{part.slice(2, -2)}</strong>
        : part
    );
  }

  function renderMessage(content: string) {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{ fontWeight: 700, color: "#1e40af" }}>{line.slice(2, -2)}</p>;
      if (line.startsWith("- ")) return <li key={i} style={{ marginLeft: 16, color: "#374151" }}>{formatInline(line.slice(2))}</li>;
      if (line.startsWith("# ")) return <h3 key={i} style={{ fontSize: 16, fontWeight: 700, color: "#2563eb", marginTop: 8 }}>{line.slice(2)}</h3>;
      if (line === "") return <br key={i} />;
      return <p key={i} style={{ color: "#374151" }}>{formatInline(line)}</p>;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ flexShrink: 0, background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            <ChevronLeft style={{ width: 16, height: 16 }} />
            H2Age
          </Link>
          <span style={{ color: "#e2e8f0" }}>/</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles style={{ width: 16, height: 16, color: "#2563eb" }} />
            <span style={{ fontWeight: 600, color: "#2563eb", fontSize: 14 }}>AI Energetický Analytik</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
          <Bot style={{ width: 14, height: 14 }} />
          Powered by Claude (Anthropic)
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", maxWidth: 1200, margin: "0 auto", width: "100%", gap: 24, padding: 16, overflow: "hidden", minHeight: 0 }}>

        {/* Sidebar */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Stav sítě</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SIDEBAR_STATS.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon style={{ width: 16, height: 16, color: item.color }} />
                  </div>
                  <span style={{ color: "#64748b", fontSize: 13, flex: 1 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Navržené otázky</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} disabled={loading}
                  style={{ width: "100%", textAlign: "left", fontSize: 12, color: "#64748b", background: "transparent", border: "1px solid transparent", borderRadius: 8, padding: "6px 8px", cursor: loading ? "not-allowed" : "pointer", lineHeight: 1.5, opacity: loading ? 0.5 : 1, transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff"; (e.currentTarget as HTMLButtonElement).style.color = "#2563eb"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#bfdbfe"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#64748b"; (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; }}
                >{q}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 8, paddingBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: msg.role === "assistant" ? "#2563eb" : "#f1f5f9" }}>
                  {msg.role === "assistant"
                    ? <Bot style={{ width: 18, height: 18, color: "#fff" }} />
                    : <User style={{ width: 18, height: 18, color: "#64748b" }} />}
                </div>
                <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    background: msg.role === "assistant" ? "#fff" : "#2563eb",
                    border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                    borderRadius: msg.role === "assistant" ? "0 16px 16px 16px" : "16px 0 16px 16px",
                    padding: "12px 16px", fontSize: 14, lineHeight: 1.65, color: msg.role === "user" ? "#fff" : "#374151",
                    boxShadow: msg.role === "assistant" ? "0 1px 4px rgba(0,0,0,0.05)" : "none",
                  }}>
                    {msg.role === "user"
                      ? <p style={{ color: "#fff" }}>{msg.content}</p>
                      : <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{renderMessage(msg.content)}</div>
                    }
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, paddingLeft: 4 }}>
                    {msg.timestamp.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0 16px 16px 16px", padding: "14px 18px", display: "flex", alignItems: "center", gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#93c5fd", animation: "bounce 1.4s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile quick questions */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, flexShrink: 0 }}>
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button key={q} onClick={() => sendMessage(q)} disabled={loading}
                style={{ flexShrink: 0, fontSize: 12, padding: "6px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", cursor: "pointer", opacity: loading ? 0.5 : 1, whiteSpace: "nowrap" }}>
                {q.slice(0, 40)}…
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ flexShrink: 0, marginTop: 8 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, display: "flex", alignItems: "flex-end", gap: 10, padding: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Zeptejte se na energetická data, rozmístění elektráren, ekonomiku projektu..."
                rows={1} style={{ flex: 1, background: "transparent", color: "#0f172a", resize: "none", border: "none", outline: "none", fontSize: 14, lineHeight: 1.55, minHeight: 36, maxHeight: 128, fontFamily: "inherit" }} />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                style={{ width: 38, height: 38, borderRadius: 10, background: "#2563eb", border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: !input.trim() || loading ? "not-allowed" : "pointer", opacity: !input.trim() || loading ? 0.4 : 1, transition: "opacity 0.15s" }}>
                <Send style={{ width: 16, height: 16, color: "#fff" }} />
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>Enter pro odeslání · Shift+Enter pro nový řádek</p>
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
