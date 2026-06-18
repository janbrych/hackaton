import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { REGIONS_WITH_CALCULATIONS } from "@/data/czechRegions";
import { optimizePlantNetwork } from "@/lib/optimizer";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          answer:
            "AI analýza není dostupná – nastavte ANTHROPIC_API_KEY v prostředí. Systém funguje i bez AI díky deterministickým algoritmům optimalizace.",
          fallback: true,
        },
        { status: 200 }
      );
    }

    const optimization = optimizePlantNetwork(45);
    const regionsSummary = REGIONS_WITH_CALCULATIONS.slice(0, 5)
      .map(
        (r) =>
          `${r.name}: přebytek ${r.annualSurplus} MWh/rok, OZE ${r.renewableCapacity} MW, skóre ${r.plantFeasibility}/100`
      )
      .join("\n");

    const systemPrompt = `Jsi expert na energetiku a vodíkové technologie v České republice.
Pracuješ pro společnost H2Age, která buduje síť vodíkových elektráren.
Máš přístup k aktuálním datům z ČEPS, ERÚ a OTE.

Aktuální stav optimalizace sítě:
- Celková kapacita: ${optimization.totalCapacityMW} MW
- Počet lokalit: ${optimization.recommendations.length}
- Průměrná návratnost: ${optimization.avgPaybackYears} let
- Ušetřené CO2: ${optimization.annualCO2SavedTons} t/rok

Top regiony:
${regionsSummary}

Odpovídej v češtině, stručně a věcně. Uváděj konkrétní čísla a zdroje dat.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: question + (context ? `\n\nKontext: ${context}` : ""),
        },
      ],
    });

    const answer =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ answer, fallback: false });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
