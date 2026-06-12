import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import { mockMatrix } from "@/lib/mock";
import { stageInstruction } from "@/lib/prompts";
import type { MatrixEntry, SeedCard, Stage } from "@/lib/types";

interface RequestBody {
  stage: Stage;
  roughDirection: string;
  cards: SeedCard[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    if (!body.cards?.length) {
      return NextResponse.json({ error: "至少需要一张种子卡" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(mockMatrix(body.cards));
    }

    const prompt = `${stageInstruction(body.stage, body.roughDirection)}

请把用户的多条材料整理成文献/材料对比矩阵。若某条材料不是正式文献，也按“材料”分析，不要虚构作者、年份或 DOI。

输入：
${JSON.stringify(body, null, 2)}

只输出如下 JSON：
{
  "matrix": [
    {
      "id": "matrix_001",
      "sourceSeedId": "seed_001",
      "materialSummary": "...",
      "researchProblem": "...",
      "method": "未知时写证据不足",
      "objects": ["..."],
      "concepts": ["..."],
      "innovation": "...",
      "limitations": "...",
      "inspirationForUser": "..."
    }
  ]
}`;

    const result = await callDeepSeekJson<{ matrix: MatrixEntry[] }>(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成材料对比矩阵失败" },
      { status: 500 }
    );
  }
}
