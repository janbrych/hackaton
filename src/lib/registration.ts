export interface RegisteredUser {
  id: string
  name: string
  email: string
  regionId: string
  type: 'household' | 'business'
  monthlySurplusKwh: number
  registeredAt: string
  installationType: 'solar' | 'wind' | 'other'
  installedCapacityKw: number
}

const STORAGE_KEY = 'hydrogrid_user'

export function saveRegistration(
  user: Omit<RegisteredUser, 'id' | 'registeredAt'>
): RegisteredUser {
  const full: RegisteredUser = {
    ...user,
    id: crypto.randomUUID(),
    registeredAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full))
  return full
}

export function getRegistration(): RegisteredUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as RegisteredUser
  } catch {
    return null
  }
}

export function clearRegistration(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
