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
        body: JSON.stringify({
          question: text,
          context: `Síť má ${NETWORK.recommendations.length} lokalit, ${NETWORK.totalCapacityMW} MW celkové kapacity.`,
        }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || data.error || "Omlouvám se, odpověď nebyla dostupná.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Omlouvám se, došlo k chybě při zpracování. Zkuste to prosím znovu.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function renderMessage(content: string) {
    return content
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-bold text-blue-700">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith("- ")) {
          return <li key={i} className="ml-4 text-gray-700">{formatInline(line.slice(2))}</li>;
        }
        if (line.startsWith("# ")) {
          return <h3 key={i} className="text-lg font-bold text-blue-600 mt-2">{line.slice(2)}</h3>;
        }
        if (line === "") return <br key={i} />;
        return <p key={i} className="text-gray-700">{formatInline(line)}</p>;
      });
  }

  function formatInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-blue-700 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            H2Age
          </Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-600">AI Energetický Analytik</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Bot className="w-4 h-4" />
          Powered by Claude (Anthropic)
        </div>
      </div>

      <div className="flex-1 flex max-w-6xl mx-auto w-full gap-6 p-4 overflow-hidden">
        {/* Sidebar – stats */}
        <div className="hidden lg:flex flex-col w-72 flex-shrink-0 space-y-4">
          <div className="card-glass rounded-2xl p-5">
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Stav sítě</h3>
            <div className="space-y-3">
              {[
                { icon: Factory, label: "Lokalit", value: `${NETWORK.recommendations.length}`, color: "text-blue-600" },
                { icon: Zap, label: "Kapacita", value: `${NETWORK.totalCapacityMW} MW`, color: "text-emerald-600" },
                { icon: TrendingUp, label: "Roční výnos", value: formatCZK(NETWORK.totalAnnualRevenueCZK), color: "text-violet-600" },
                { icon: MapPin, label: "Pokrytí", value: `${NETWORK.coveragePercent} %`, color: "text-amber-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                  <span className="text-gray-500 text-sm flex-1">{item.label}</span>
                  <span className={`font-semibold text-sm ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-4">Navržené otázky</h3>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="w-full text-left text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all border border-transparent hover:border-blue-100 leading-relaxed disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  msg.role === "assistant"
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot className="w-5 h-5 text-white" />
                    : <User className="w-5 h-5 text-gray-500" />
                  }
                </div>
                <div className={`max-w-2xl ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "card-glass rounded-tl-sm"
                      : "bg-blue-600 text-white rounded-tr-sm"
                  }`}>
                    {msg.role === "user" ? (
                      <p className="text-white">{msg.content}</p>
                    ) : (
                      <div className="space-y-1">
                        {renderMessage(msg.content)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="card-glass rounded-2xl rounded-tl-sm px-5 py-4">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions mobile */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 flex-shrink-0">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="flex-shrink-0 text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all disabled:opacity-50"
              >
                {q.slice(0, 40)}...
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 mt-2">
            <div className="card-glass rounded-2xl border border-gray-200 focus-within:border-blue-400 transition-colors flex items-end gap-3 p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Zeptejte se na energetická data, rozmístění elektráren, ekonomiku projektu..."
                rows={1}
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 resize-none focus:outline-none text-sm min-h-[36px] max-h-32"
                style={{ height: "auto" }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Enter pro odeslání · Shift+Enter pro nový řádek
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
