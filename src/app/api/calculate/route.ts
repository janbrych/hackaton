import { NextRequest, NextResponse } from "next/server";
import { calculateROI } from "@/lib/optimizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { regionId, monthlySurplusKwh, userType } = body;

    if (!regionId || !monthlySurplusKwh || !userType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = calculateROI(regionId, monthlySurplusKwh, userType);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
