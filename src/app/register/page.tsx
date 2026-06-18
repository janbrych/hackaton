'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, User, Building2, MapPin, Sun, Wind, Cpu, ChevronRight, ChevronLeft, Check, Sparkles, TrendingUp, Mail, BadgeCheck, ArrowRight } from 'lucide-react'
import { CZECH_REGIONS } from '@/data/czechRegions'
import { saveRegistration, getRegistration, type RegisteredUser } from '@/lib/registration'

type UserType = 'household' | 'business'
type InstallationType = 'solar' | 'wind' | 'other'

interface FormData {
  type: UserType; name: string; email: string; regionId: string
  installationType: InstallationType; installedCapacityKw: number; monthlySurplusKwh: number
}

const STEPS = [
  { label: 'Kdo jste?', short: '01' }, { label: 'Vaše lokalita', short: '02' },
  { label: 'Přebytky', short: '03' }, { label: 'Výsledek', short: '04' },
]
const INSTALL_TYPES = [
  { value: 'solar' as InstallationType, label: 'Solární panely', Icon: Sun, color: '#f59e0b' },
  { value: 'wind' as InstallationType, label: 'Větrná turbína', Icon: Wind, color: '#0ea5e9' },
  { value: 'other' as InstallationType, label: 'Jiný zdroj', Icon: Cpu, color: '#7c3aed' },
]
function fmtCZK(n: number) { return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n) }

const card: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
const inputStyle: React.CSSProperties = { width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }
const btnPrimary: React.CSSProperties = { width: '100%', padding: '14px', borderRadius: 12, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [existingUser, setExistingUser] = useState<RegisteredUser | null>(null)
  const [result, setResult] = useState<{ userId: string; welcomeMessage: string; estimatedAnnualIncome: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({ type: 'household', name: '', email: '', regionId: 'STC', installationType: 'solar', installedCapacityKw: 10, monthlySurplusKwh: 300 })

  useEffect(() => { const u = getRegistration(); if (u) setExistingUser(u) }, [])

  const surplusMin = form.type === 'business' ? 500 : 50
  const surplusMax = form.type === 'business' ? 200000 : 2000

  function goTo(nextStep: number) {
    setDirection(nextStep > step ? 'forward' : 'back')
    setAnimating(true)
    setTimeout(() => { setStep(nextStep); setAnimating(false) }, 220)
  }

  async function submitRegistration() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chyba při registraci')
      const saved = saveRegistration({ name: form.name, email: form.email, regionId: form.regionId, type: form.type, monthlySurplusKwh: form.monthlySurplusKwh, installationType: form.installationType, installedCapacityKw: form.installedCapacityKw })
      setResult({ userId: saved.id, welcomeMessage: data.welcomeMessage, estimatedAnnualIncome: data.estimatedAnnualIncome })
      goTo(3)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  const selectedRegion = CZECH_REGIONS.find(r => r.id === form.regionId)
  const translateX = animating ? (direction === 'forward' ? '-32px' : '32px') : '0px'
  const opacity = animating ? 0 : 1

  if (existingUser) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <NavBar />
      <div style={{ maxWidth: 480, width: '100%', marginTop: 64 }}>
        <div style={{ ...card, textAlign: 'center', border: '1px solid #bfdbfe' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <BadgeCheck style={{ width: 32, height: 32, color: '#2563eb' }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Již jste registrováni</h1>
          <p style={{ color: '#64748b', marginBottom: 6 }}>Vítejte zpět, <span style={{ color: '#2563eb', fontWeight: 600 }}>{existingUser.name}</span>!</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 32 }}>ID: <span style={{ fontFamily: 'monospace', color: '#374151' }}>{existingUser.id}</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: '#2563eb', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
              Přejít na Dashboard <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <button onClick={() => setExistingUser(null)} style={{ fontSize: 13, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>Zaregistrovat jiný účet</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <NavBar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '112px 24px 64px' }}>
        {/* progress */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            {STEPS.map((s, i) => (
              <div key={s.short} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.3s',
                  background: i < step ? '#2563eb' : i === step ? '#eff6ff' : '#fff',
                  border: i < step ? 'none' : i === step ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  color: i < step ? '#fff' : i === step ? '#2563eb' : '#94a3b8' }}>
                  {i < step ? <Check style={{ width: 14, height: 14 }} /> : s.short}
                </div>
                <span style={{ fontSize: 12, color: i === step ? '#2563eb' : '#94a3b8', fontWeight: i === step ? 600 : 400, display: window.innerWidth > 480 ? 'block' : 'none' }}>{s.label}</span>
                {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: i < step ? '#2563eb' : '#e2e8f0', marginLeft: 4 }} />}
              </div>
            ))}
          </div>
          <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#2563eb', borderRadius: 999, width: `${(step / (STEPS.length - 1)) * 100}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* step card */}
        <div style={{ ...card, transform: `translateX(${translateX})`, opacity, transition: 'all 0.22s ease-out' }}>
          {/* STEP 0 */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Kdo jste?</h2>
              <p style={{ color: '#64748b', marginBottom: 28 }}>Vyberte typ účtu a vyplňte základní údaje.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {([{ value: 'household' as UserType, label: 'Domácnost', Icon: User, desc: 'Rodinný dům, byt' }, { value: 'business' as UserType, label: 'Firma', Icon: Building2, desc: 'Podnik, provozovna' }]).map(opt => (
                  <button key={opt.value} onClick={() => setForm(f => ({ ...f, type: opt.value, monthlySurplusKwh: opt.value === 'business' ? 5000 : 300 }))}
                    style={{ padding: 20, borderRadius: 14, border: `2px solid ${form.type === opt.value ? '#2563eb' : '#e2e8f0'}`, background: form.type === opt.value ? '#eff6ff' : '#fff', textAlign: 'left', cursor: 'pointer' }}>
                    <opt.Icon style={{ width: 26, height: 26, marginBottom: 10, color: form.type === opt.value ? '#2563eb' : '#94a3b8' }} />
                    <div style={{ fontWeight: 700, fontSize: 16, color: form.type === opt.value ? '#2563eb' : '#0f172a' }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Jméno / Název firmy</label>
                  <input style={inputStyle} type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={form.type === 'business' ? 'Název vaší firmy' : 'Vaše jméno'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties}>
                    <Mail style={{ width: 14, height: 14 }} /> E-mail
                  </label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vas@email.cz" />
                </div>
              </div>
              <button onClick={() => goTo(1)} disabled={!form.name.trim() || !form.email.trim()} style={{ ...btnPrimary, opacity: !form.name.trim() || !form.email.trim() ? 0.4 : 1 }}>
                Pokračovat <ChevronRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Vaše lokalita</h2>
              <p style={{ color: '#64748b', marginBottom: 28 }}>Vyberte kraj a typ vaší instalace.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    <MapPin style={{ width: 14, height: 14, color: '#2563eb' }} /> Kraj
                  </label>
                  <select style={inputStyle} value={form.regionId} onChange={e => setForm(f => ({ ...f, regionId: e.target.value }))}>
                    {CZECH_REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  {selectedRegion && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Solární potenciál: {selectedRegion.solarPotential} kWh/kWp/rok · Cena el.: {selectedRegion.avgElectricityPrice} Kč/kWh</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Typ instalace</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {INSTALL_TYPES.map(t => (
                      <button key={t.value} onClick={() => setForm(f => ({ ...f, installationType: t.value }))}
                        style={{ padding: 14, borderRadius: 12, border: `2px solid ${form.installationType === t.value ? '#2563eb' : '#e2e8f0'}`, background: form.installationType === t.value ? '#eff6ff' : '#fff', textAlign: 'center', cursor: 'pointer' }}>
                        <t.Icon style={{ width: 22, height: 22, margin: '0 auto 6px', color: form.installationType === t.value ? t.color : '#94a3b8' }} />
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{t.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Instalovaný výkon (kW)</label>
                  <input style={inputStyle} type="number" min={1} max={form.type === 'business' ? 10000 : 100} value={form.installedCapacityKw} onChange={e => setForm(f => ({ ...f, installedCapacityKw: Number(e.target.value) }))} />
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{form.type === 'household' ? 'Typická domácnost: 5–20 kW' : 'Typická firma: 50–500 kW'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => goTo(0)} style={{ padding: '14px 18px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <ChevronLeft style={{ width: 18, height: 18 }} />
                </button>
                <button onClick={() => goTo(2)} style={{ ...btnPrimary, flex: 1 }}>
                  Pokračovat <ChevronRight style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Přebytky energie</h2>
              <p style={{ color: '#64748b', marginBottom: 28 }}>Kolik kWh měsíčně dokážete dodat do sítě?</p>
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Měsíční přebytek</span>
                  <div style={{ textAlign: 'right' }}>
                    <span className="text-gradient-primary" style={{ fontSize: 30, fontWeight: 900 }}>{form.monthlySurplusKwh.toLocaleString('cs-CZ')}</span>
                    <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>kWh/měs</span>
                  </div>
                </div>
                <input type="range" min={surplusMin} max={surplusMax} step={form.type === 'business' ? 100 : 10} value={form.monthlySurplusKwh}
                  onChange={e => setForm(f => ({ ...f, monthlySurplusKwh: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#2563eb' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  <span>{surplusMin.toLocaleString('cs-CZ')} kWh</span><span>{surplusMax.toLocaleString('cs-CZ')} kWh</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 20 }}>
                  {(form.type === 'household' ? [100, 300, 600] : [1000, 5000, 20000]).map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, monthlySurplusKwh: p }))}
                      style={{ padding: 8, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.monthlySurplusKwh === p ? '#2563eb' : '#e2e8f0'}`, background: form.monthlySurplusKwh === p ? '#eff6ff' : '#fff', color: form.monthlySurplusKwh === p ? '#2563eb' : '#64748b' }}>
                      {p.toLocaleString('cs-CZ')} kWh
                    </button>
                  ))}
                </div>
              </div>
              {error && <p style={{ fontSize: 13, color: '#ef4444', padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => goTo(1)} style={{ padding: '14px 18px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <ChevronLeft style={{ width: 18, height: 18 }} />
                </button>
                <button onClick={submitRegistration} disabled={loading} style={{ ...btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}>
                  {loading ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Zpracování...</> : <>Dokončit registraci <ChevronRight style={{ width: 18, height: 18 }} /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && result && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eff6ff', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Sparkles style={{ width: 36, height: 36, color: '#2563eb' }} />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Vítejte v síti H2Age!</h2>
              <p style={{ color: '#64748b', marginBottom: 20, lineHeight: 1.65 }}>{result.welcomeMessage}</p>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Vaše unikátní ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#2563eb', wordBreak: 'break-all' }}>{result.userId}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', marginBottom: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                    <TrendingUp style={{ width: 14, height: 14 }} /> Roční příjem
                  </div>
                  <div className="text-gradient-primary" style={{ fontSize: 22, fontWeight: 900 }}>{fmtCZK(result.estimatedAnnualIncome)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>odhad při {form.monthlySurplusKwh.toLocaleString('cs-CZ')} kWh/měs</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', marginBottom: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                    <MapPin style={{ width: 14, height: 14 }} /> Lokalita
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{selectedRegion?.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{form.type === 'household' ? 'Domácnost' : 'Firma'} · {form.installedCapacityKw} kW</div>
                </div>
              </div>
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.2)' }}>
                Přejít na Dashboard <ArrowRight style={{ width: 18, height: 18 }} />
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
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>H2Age</span>
        </Link>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>Registrace</span>
      </div>
    </nav>
  )
}
