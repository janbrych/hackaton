import { NextRequest, NextResponse } from 'next/server'
import { fetchLiveGeneration, fetchSurplusHistory, fetchRegionSurplus } from '@/lib/energyApi'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'generation'

  try {
    if (type === 'generation') {
      return NextResponse.json(await fetchLiveGeneration())
    }
    if (type === 'history') {
      const hours = parseInt(searchParams.get('hours') ?? '24')
      return NextResponse.json(await fetchSurplusHistory(hours))
    }
    if (type === 'regions') {
      return NextResponse.json(await fetchRegionSurplus())
    }
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
