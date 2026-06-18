import { NextRequest, NextResponse } from "next/server";
import { optimizePlantNetwork } from "@/lib/optimizer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minFeasibility = parseInt(searchParams.get("minFeasibility") ?? "45");
  const budget = searchParams.get("budget")
    ? parseInt(searchParams.get("budget")!)
    : undefined;

  try {
    const result = optimizePlantNetwork(minFeasibility, budget);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
