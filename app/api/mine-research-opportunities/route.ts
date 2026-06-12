import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import { mockOpportunities } from "@/lib/mock";
import { stageInstruction } from "@/lib/prompts";
import type { MatrixEntry, ResearchOpportunity, SeedCard, Stage } from "@/lib/types";

interface RequestBody {
  stage: Stage;
  roughDirection: string;
  matrix: MatrixEntry[];
  cards: SeedCard[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    if (!body.cards?.length && !body.matrix?.length) {
      return NextResponse.json({ error: "至少需要种子卡或矩阵材料" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(mockOpportunities(body.cards || [], body.matrix || []));
    }

    const prompt = `${stageInstruction(body.stage, body.roughDirection)}

请基于材料矩阵和种子卡挖掘研究机会。每个机会必须绑定 evidenceSeedIds。请区分已有材料支持的判断和需要进一步检索验证的推测。

输入：
${JSON.stringify(body, null, 2)}

只输出如下 JSON：
{
  "opportunities": [
    {
      "id": "opp_001",
      "opportunityName": "...",
      "evidenceSeedIds": ["seed_001"],
      "whatIsKnown": "...",
      "whatIsUnsolved": "材料不足时写证据不足",
      "whyItMatters": "...",
      "possibleResearchQuestions": ["..."],
      "possibleMethods": ["..."],
      "feasibilityScore": 75,
      "mainRisks": ["..."],
      "nextSearchKeywords": ["..."],
      "strengthenedDirection": "...",
      "insufficientEvidence": "..."
    }
  ]
}`;

    const result = await callDeepSeekJson<{ opportunities: ResearchOpportunity[] }>(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成研究机会地图失败" },
      { status: 500 }
    );
  }
}
