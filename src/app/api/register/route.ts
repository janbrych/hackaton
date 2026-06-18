import { NextRequest, NextResponse } from 'next/server'
import { calculateROI } from '@/lib/optimizer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, regionId, type, monthlySurplusKwh, installationType, installedCapacityKw } = body

    if (!name || !email || !regionId || !type || !monthlySurplusKwh || !installationType || !installedCapacityKw) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 })
    }

    const roi = calculateROI(regionId, monthlySurplusKwh, type as 'household' | 'business')

    const userId = crypto.randomUUID()

    const typeLabel = type === 'business' ? 'firemní' : 'domácnostní'
    const welcomeMessage = `Vítejte v síti H2Age, ${name}! Váš ${typeLabel} účet byl aktivován. Začínáte vydělávat na zelené energii.`

    return NextResponse.json({
      success: true,
      userId,
      welcomeMessage,
      estimatedAnnualIncome: roi.annualIncomeCZK,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
