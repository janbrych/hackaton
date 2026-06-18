import { NextResponse } from "next/server";
import { REGIONS_WITH_CALCULATIONS } from "@/data/czechRegions";

export async function GET() {
  return NextResponse.json(REGIONS_WITH_CALCULATIONS);
}
