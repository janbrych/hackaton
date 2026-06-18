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
  { value: 'solar', label: 'Solární panely', icon: Sun, color: 'text-amber-500' },
  { value: 'wind', label: 'Větrná turbína', icon: Wind, color: 'text-sky-600' },
  { value: 'other', label: 'Jiný zdroj', icon: Cpu, color: 'text-violet-600' },
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
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <BadgeCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-black mb-3 text-gray-900">Již jste registrováni</h1>
            <p className="text-gray-500 mb-2">
              Vítejte zpět, <span className="text-blue-600 font-semibold">{existingUser.name}</span>!
            </p>
            <p className="text-gray-400 text-sm mb-8">
              ID: <span className="font-mono text-gray-600">{existingUser.id}</span>
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
              >
                Přejít na Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setExistingUser(null)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
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
    <div className="gradient-bg grid-lines min-h-screen bg-gray-50">
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
                      ? 'bg-blue-600 text-white'
                      : i === step
                      ? 'bg-blue-50 border-2 border-blue-600 text-blue-600'
                      : 'bg-white border border-gray-200 text-gray-400'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : s.short}
                </div>
                <span className={`hidden sm:block text-xs transition-colors ${i === step ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block flex-1 h-px mx-3 transition-colors ${i < step ? 'bg-blue-400' : 'bg-gray-200'}`} style={{ width: '2rem' }} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
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
              <h2 className="text-3xl font-black mb-2 text-gray-900">Kdo jste?</h2>
              <p className="text-gray-500 mb-8">Vyberte typ účtu a vyplňte základní údaje.</p>

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
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <opt.icon className={`w-7 h-7 mb-3 ${form.type === opt.value ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className={`font-bold text-lg ${form.type === opt.value ? 'text-gray-900' : 'text-gray-700'}`}>{opt.label}</div>
                    <div className="text-sm text-gray-400">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jméno / Název firmy</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={form.type === 'business' ? 'Název vaší firmy' : 'Vaše jméno'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="vas@email.cz"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => goTo(1)}
                disabled={!form.name.trim() || !form.email.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Pokračovat <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 1 — Vaše lokalita */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-black mb-2 text-gray-900">Vaše lokalita</h2>
              <p className="text-gray-500 mb-8">Vyberte kraj a typ vaší instalace.</p>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" /> Kraj</span>
                  </label>
                  <select
                    value={form.regionId}
                    onChange={e => setForm(f => ({ ...f, regionId: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
                  >
                    {CZECH_REGIONS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {selectedRegion && (
                    <p className="text-xs text-gray-400 mt-2">
                      Solární potenciál: {selectedRegion.solarPotential} kWh/kWp/rok · Cena el.: {selectedRegion.avgElectricityPrice} Kč/kWh
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Typ instalace</label>
                  <div className="grid grid-cols-3 gap-3">
                    {INSTALL_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setForm(f => ({ ...f, installationType: t.value }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          form.installationType === t.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <t.icon className={`w-6 h-6 mx-auto mb-2 ${form.installationType === t.value ? t.color : 'text-gray-400'}`} />
                        <div className="text-xs font-semibold leading-tight text-gray-700">{t.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instalovaný výkon (kW)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={form.type === 'business' ? 10000 : 100}
                    value={form.installedCapacityKw}
                    onChange={e => setForm(f => ({ ...f, installedCapacityKw: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.type === 'household' ? 'Typická domácnost: 5–20 kW' : 'Typická firma: 50–500 kW'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => goTo(0)}
                  className="flex items-center gap-2 px-5 py-4 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => goTo(2)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
                >
                  Pokračovat <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Přebytky */}
          {step === 2 && (
            <div>
              <h2 className="text-3xl font-black mb-2 text-gray-900">Přebytky energie</h2>
              <p className="text-gray-500 mb-8">Kolik kWh měsíčně dokážete dodat do sítě?</p>

              <div className="mb-10">
                <div className="flex items-end justify-between mb-4">
                  <label className="text-sm font-semibold text-gray-700">Měsíční přebytek</label>
                  <div className="text-right">
                    <span className="text-3xl font-black text-gradient-primary">
                      {form.monthlySurplusKwh.toLocaleString('cs-CZ')}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">kWh/měs</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={surplusMin}
                  max={surplusMax}
                  step={form.type === 'business' ? 100 : 10}
                  value={form.monthlySurplusKwh}
                  onChange={e => setForm(f => ({ ...f, monthlySurplusKwh: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
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
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {preset.toLocaleString('cs-CZ')} kWh
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm mb-4 p-3 rounded-lg bg-red-50 border border-red-200">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => goTo(1)}
                  className="flex items-center gap-2 px-5 py-4 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={submitRegistration}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-blue-600" />
              </div>

              <h2 className="text-3xl font-black mb-3 text-gray-900">Vítejte v síti H2Age!</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">{result.welcomeMessage}</p>

              <div className="card-glass rounded-2xl p-5 mb-6 text-left bg-gray-50">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vaše unikátní ID</div>
                <div className="font-mono text-sm text-blue-600 break-all">{result.userId}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="card-glass rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Roční příjem</span>
                  </div>
                  <div className="text-2xl font-black text-gradient-primary">
                    {formatCZK(result.estimatedAnnualIncome)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">odhad při {form.monthlySurplusKwh.toLocaleString('cs-CZ')} kWh/měs</div>
                </div>
                <div className="card-glass rounded-2xl p-5 text-left">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Lokalita</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{selectedRegion?.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {form.type === 'household' ? 'Domácnost' : 'Firma'} · {form.installedCapacityKw} kW
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-200"
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">H2Age</span>
        </Link>
        <div className="text-sm font-medium text-gray-400">Registrace</div>
      </div>
    </nav>
  )
}
