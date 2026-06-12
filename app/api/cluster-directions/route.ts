import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import { mockDirections } from "@/lib/mock";
import { stageInstruction } from "@/lib/prompts";
import type { DirectionCluster, DivergentIdea, SeedCard, Stage } from "@/lib/types";

interface RequestBody {
  stage: Stage;
  roughDirection: string;
  cards: SeedCard[];
  ideas?: DivergentIdea[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    if (!body.cards?.length) {
      return NextResponse.json({ error: "至少需要一张种子卡" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(mockDirections(body.cards));
    }

    const prompt = `${stageInstruction(body.stage, body.roughDirection)}

请基于种子卡和用户标记为感兴趣的灵感发散点生成3到5个方向簇。必须只基于输入材料，不要虚构文献来源。
如果 ideas 存在，它们是用户筛选过的探索角度，可作为聚类上下文，但仍需绑定到原始种子材料。

输入：
${JSON.stringify(body, null, 2)}

只输出如下 JSON：
{
  "directions": [
    {
      "id": "direction_001",
      "directionName": "...",
      "seedIds": ["seed_001"],
      "commonKeywords": ["..."],
      "whyThisDirection": "...",
      "missingEvidence": "如果材料不足请写证据不足",
      "maturityScore": 72
    }
  ]
}`;

    const result = await callDeepSeekJson<{ directions: DirectionCluster[] }>(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成方向地图失败" },
      { status: 500 }
    );
  }
}
