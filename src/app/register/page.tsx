'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap, User, Building2, MapPin, Sun, Wind, Cpu,
  ChevronRight, ChevronLeft, Check, Sparkles, TrendingUp,
  Mail, BadgeCheck, ArrowRight,
} from 'lucide-react'
import { CZECH_REGIONS } from '@/data/czechRegions'
import { saveRegistration, getRegistration, type RegisteredUser } from '@/lib/registration'

type UserType = 'household' | 'business'
type InstallationType = 'solar' | 'wind' | 'other'

interface FormData {
  type: UserType
  name: string
  email: string
  regionId: string
  installationType: InstallationType
  installedCapacityKw: number
  monthlySurplusKwh: number
}

const STEPS = [
  { label: 'Kdo jste?', short: '01' },
  { label: 'Vaše lokalita', short: '02' },
  { label: 'Přebytky', short: '03' },
  { label: 'Výsledek', short: '04' },
]

const INSTALL_TYPES: { value: InstallationType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'solar', label: 'Solární panely', icon: Sun, color: 'text-amber-400' },
  { value: 'wind', label: 'Větrná turbína', icon: Wind, color: 'text-sky-400' },
  { value: 'other', label: 'Jiný zdroj', icon: Cpu, color: 'text-violet-400' },
]

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [existingUser, setExistingUser] = useState<RegisteredUser | null>(null)
  const [result, setResult] = useState<{ userId: string; welcomeMessage: string; estimatedAnnualIncome: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    type: 'household',
    name: '',
    email: '',
    regionId: 'STC',
    installationType: 'solar',
    installedCapacityKw: 10,
    monthlySurplusKwh: 300,
  })

  useEffect(() => {
    const user = getRegistration()
    if (user) setExistingUser(user)
  }, [])

  const surplusMin = form.type === 'business' ? 500 : 50
  const surplusMax = form.type === 'business' ? 200000 : 2000

  function goTo(nextStep: number) {
    setDirection(nextStep > step ? 'forward' : 'back')
    setAnimating(true)
    setTimeout(() => {
      setStep(nextStep)
      setAnimating(false)
    }, 220)
  }

  async function submitRegistration() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chyba při registraci')

      const saved = saveRegistration({
        name: form.name,
        email: form.email,
        regionId: form.regionId,
        type: form.type,
        monthlySurplusKwh: form.monthlySurplusKwh,
        installationType: form.installationType,
        installedCapacityKw: form.installedCapacityKw,
      })

      setResult({
        userId: saved.id,
        welcomeMessage: data.welcomeMessage,
        estimatedAnnualIncome: data.estimatedAnnualIncome,
      })
      goTo(3)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const selectedRegion = CZECH_REGIONS.find(r => r.id === form.regionId)

  if (existingUser) {
    return (
      <div className="gradient-bg grid-lines min-h-screen flex items-center justify-center px-4">
        <NavBar />
        <div className="max-w-lg w-full mt-16">
          <div className="card-glass rounded-3xl p-10 text-center glow-border">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
              <BadgeCheck className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black mb-3">Již jste registrováni</h1>
            <p className="text-slate-400 mb-2">
              Vítejte zpět, <span className="text-cyan-400 font-semibold">{existingUser.name}</span>!
            </p>
            <p className="text-slate-500 text-sm mb-8">
              ID: <span className="font-mono text-slate-400">{existingUser.id}</span>
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold hover:opacity-90 transition-opacity"
              >
                Přejít na Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setExistingUser(null)}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
              >
                Zaregistrovat jiný účet
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const translateClass = animating
    ? direction === 'forward'
      ? '-translate-x-8 opacity-0'
      : 'translate-x-8 opacity-0'
    : 'translate-x-0 opacity-100'

  return (
    <div className="gradient-bg grid-lines min-h-screen">
      <NavBar />

      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.short} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < step
                      ? 'bg-gradient-to-br from-cyan-500 to-green-500 text-black'
                      : i === step
                      ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                      : 'bg-slate-800 text-slate-600 border border-slate-700'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : s.short}
                </div>
                <span className={`hidden sm:block text-xs transition-colors ${i === step ? 'text-cyan-400 font-semibold' : 'text-slate-600'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block flex-1 h-px mx-3 transition-colors ${i < step ? 'bg-cyan-500/60' : 'bg-slate-800'}`} style={{ width: '2rem' }} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500"
              style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step card */}
        <div
          className={`card-glass rounded-3xl p-8 transition-all duration-200 ${translateClass}`}
          style={{ transitionTimingFunction: 'ease-out' }}
        >
          {/* STEP 0 — Kdo jste? */}
          {step === 0 && (
            <div>
              <h2 className="text-3xl font-black mb-2">Kdo jste?</h2>
              <p className="text-slate-400 mb-8">Vyberte typ účtu a vyplňte základní údaje.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: 'household' as UserType, label: 'Domácnost', icon: User, desc: 'Rodinný dům, byt' },
                  { value: 'business' as UserType, label: 'Firma', icon: Building2, desc: 'Podnik, provozovna' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm(f => ({
                        ...f,
                        type: opt.value,
                        monthlySurplusKwh: opt.value === 'business' ? 5000 : 300,
                      }))
                    }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      form.type === opt.value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <opt.icon className={`w-7 h-7 mb-3 ${form.type === opt.value ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div className="font-bold text-lg">{opt.label}</div>
                    <div className="text-sm text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Jméno / Název firmy</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={form.type === 'business' ? 'Název vaší firmy' : 'Vaše jméno'}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="vas@email.cz"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => goTo(1)}
                disabled={!form.name.trim() || !form.email.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Pokračovat <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 1 — Vaše lokalita */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-black mb-2">Vaše lokalita</h2>
              <p className="text-slate-400 mb-8">Vyberte kraj a typ vaší instalace.</p>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" /> Kraj</span>
                  </label>
                  <select
                    value={form.regionId}
                    onChange={e => setForm(f => ({ ...f, regionId: e.target.value }))}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {CZECH_REGIONS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {selectedRegion && (
                    <p className="text-xs text-slate-500 mt-2">
                      Solární potenciál: {selectedRegion.solarPotential} kWh/kWp/rok · Cena el.: {selectedRegion.avgElectricityPrice} Kč/kWh
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Typ instalace</label>
                  <div className="grid grid-cols-3 gap-3">
                    {INSTALL_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setForm(f => ({ ...f, installationType: t.value }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          form.installationType === t.value
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <t.icon className={`w-6 h-6 mx-auto mb-2 ${form.installationType === t.value ? t.color : 'text-slate-500'}`} />
                        <div className="text-xs font-semibold leading-tight">{t.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Instalovaný výkon (kW)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={form.type === 'business' ? 10000 : 100}
                    value={form.installedCapacityKw}
                    onChange={e => setForm(f => ({ ...f, installedCapacityKw: Number(e.target.value) }))}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {form.type === 'household' ? 'Typická domácnost: 5–20 kW' : 'Typická firma: 50–500 kW'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => goTo(0)}
                  className="flex items-center gap-2 px-5 py-4 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => goTo(2)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold text-lg hover:opacity-90 transition-opacity"
                >
                  Pokračovat <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Přebytky */}
          {step === 2 && (
            <div>
              <h2 className="text-3xl font-black mb-2">Přebytky energie</h2>
              <p className="text-slate-400 mb-8">Kolik kWh měsíčně dokážete dodat do sítě?</p>

              <div className="mb-10">
                <div className="flex items-end justify-between mb-4">
                  <label className="text-sm font-semibold text-slate-300">Měsíční přebytek</label>
                  <div className="text-right">
                    <span className="text-3xl font-black text-gradient-primary">
                      {form.monthlySurplusKwh.toLocaleString('cs-CZ')}
                    </span>
                    <span className="text-slate-400 text-sm ml-1">kWh/měs</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={surplusMin}
                  max={surplusMax}
                  step={form.type === 'business' ? 100 : 10}
                  value={form.monthlySurplusKwh}
                  onChange={e => setForm(f => ({ ...f, monthlySurplusKwh: Number(e.target.value) }))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>{surplusMin.toLocaleString('cs-CZ')} kWh</span>
                  <span>{surplusMax.toLocaleString('cs-CZ')} kWh</span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {(form.type === 'household'
                    ? [100, 300, 600]
                    : [1000, 5000, 20000]
                  ).map(preset => (
                    <button
                      key={preset}
                      onClick={() => setForm(f => ({ ...f, monthlySurplusKwh: preset }))}
                      className={`py-2 rounded-lg text-sm font-semibold transition-all border ${
                        form.monthlySurplusKwh === preset
                          ? 'border-cyan-500 bg-cyan-500/15 text-cyan-400'
                          : 'border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {preset.toLocaleString('cs-CZ')} kWh
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => goTo(1)}
                  className="flex items-center gap-2 px-5 py-4 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={submitRegistration}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Zpracování...
                    </>
                  ) : (
                    <>
                      Dokončit registraci <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Výsledek */}
          {step === 3 && result && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-cyan-400" />
              </div>

              <h2 className="text-3xl font-black mb-3">Vítejte v síti HydroGrid!</h2>
              <p className="text-slate-400 mb-6 leading-relaxed">{result.welcomeMessage}</p>

              <div className="card-glass rounded-2xl p-5 mb-6 text-left">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vaše unikátní ID</div>
                <div className="font-mono text-sm text-cyan-400 break-all">{result.userId}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="card-glass rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Roční příjem</span>
                  </div>
                  <div className="text-2xl font-black text-gradient-primary">
                    {formatCZK(result.estimatedAnnualIncome)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">odhad při {form.monthlySurplusKwh.toLocaleString('cs-CZ')} kWh/měs</div>
                </div>
                <div className="card-glass rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 text-cyan-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Lokalita</span>
                  </div>
                  <div className="text-lg font-bold">{selectedRegion?.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {form.type === 'household' ? 'Domácnost' : 'Firma'} · {form.installedCapacityKw} kW
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold text-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Přejít na Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 card-glass border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient-primary">HydroGrid CZ</span>
        </Link>
        <div className="text-sm text-slate-400">Registrace</div>
      </div>
    </nav>
  )
}
