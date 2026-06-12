import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import { makeSeedCard } from "@/lib/mock";
import { stageInstruction } from "@/lib/prompts";
import type { ExtractCardRequest, SeedCard } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtractCardRequest;
    if (!body.rawContent?.trim()) {
      return NextResponse.json({ error: "rawContent 不能为空" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(makeSeedCard(body));
    }

    const prompt = `${stageInstruction(body.stage, body.roughDirection)}

请把以下用户材料提炼为一张选题种子卡。
重点优先级：rawContent > whySaved > roughDirection。
如果 rawContent 只是「缓解焦虑」这类独立关键词，且没有明确出现 roughDirection 中的主题，不要把它改写成 roughDirection 相关问题。

输入：
${JSON.stringify(body, null, 2)}

只输出如下 JSON：
{
  "summary": "40字以内摘要",
  "keywords": ["3到6个关键词"],
  "possibleObjects": ["可能研究对象"],
  "possibleConcepts": ["可能变量或概念"],
  "methodHints": ["可能方法提示"],
  "possibleDirection": "可能所属方向",
  "confidence": 0.82
}`;

    const result = await callDeepSeekJson<Omit<SeedCard, "id" | "inputType" | "rawContent" | "whySaved" | "interest" | "createdAt">>(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成种子卡失败" },
      { status: 500 }
    );
  }
}
