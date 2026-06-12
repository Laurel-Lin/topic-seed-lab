import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import { mockIdeas } from "@/lib/mock";
import { stageInstruction } from "@/lib/prompts";
import type { DivergentIdea, SeedCard, Stage } from "@/lib/types";

interface RequestBody {
  stage: Stage;
  roughDirection: string;
  cards: SeedCard[];
}

type IdeaResponse = {
  ideas: Array<Omit<DivergentIdea, "status" | "createdAt">>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    if (!body.cards?.length) {
      return NextResponse.json({ error: "至少需要一张种子卡" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(mockIdeas(body.cards));
    }

    const prompt = `${stageInstruction(body.stage, body.roughDirection)}

请基于用户选择的种子卡进行“灵感发散”，先扩散可能研究角度，而不是直接生成最终选题。
请生成8到12个发散点，覆盖对象、场景、变量、方法、问题、反向这几类角度。
每个发散点必须绑定 sourceSeedIds，只能基于输入材料推断。材料不足时在 evidenceNote 中明确写「证据不足」。
不要把粗方向强行套到不相关的材料上。

输入：
${JSON.stringify(body, null, 2)}

只输出如下 JSON：
{
  "ideas": [
    {
      "id": "idea_001",
      "sourceSeedIds": ["seed_001"],
      "title": "...",
      "angleType": "对象 | 场景 | 变量 | 方法 | 问题 | 反向",
      "explanation": "...",
      "possibleObjects": ["..."],
      "possibleConcepts": ["..."],
      "methodHints": ["..."],
      "followUpQuestions": ["..."],
      "evidenceNote": "..."
    }
  ]
}`;

    const result = await callDeepSeekJson<IdeaResponse>(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成灵感发散失败" },
      { status: 500 }
    );
  }
}
