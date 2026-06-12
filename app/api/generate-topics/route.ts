import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import { mockTopics } from "@/lib/mock";
import { stageInstruction } from "@/lib/prompts";
import type {
  DirectionCluster,
  MatrixEntry,
  ResearchOpportunity,
  SeedCard,
  Stage,
  TopicCandidate
} from "@/lib/types";

interface RequestBody {
  stage: Stage;
  roughDirection: string;
  directions: DirectionCluster[];
  matrix: MatrixEntry[];
  opportunities: ResearchOpportunity[];
  cards: SeedCard[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    if (!body.cards?.length) {
      return NextResponse.json({ error: "至少需要一张种子卡" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(mockTopics(body.cards, body.matrix || []));
    }

    const prompt = `${stageInstruction(body.stage, body.roughDirection)}

请生成3到5个候选研究问题或候选研究方向。每个候选必须绑定 evidenceSeedIds 和 evidenceMatrixIds，不能凭空生成。若证据不足，请在 whatIsStillMissing 中明确写出。

输入：
${JSON.stringify(body, null, 2)}

只输出如下 JSON：
{
  "topics": [
    {
      "id": "topic_001",
      "title": "...",
      "oneSentence": "...",
      "possibleObjects": ["..."],
      "researchQuestions": ["2到3个问题"],
      "recommendedMethod": "...",
      "feasibility": {
        "sampleAvailability": 80,
        "conceptClarity": 75,
        "methodFeasibility": 70,
        "literatureBase": 65,
        "personalInterestFit": 85
      },
      "nextKeywords": ["..."],
      "mainRisks": ["..."],
      "evidenceSeedIds": ["seed_001"],
      "evidenceMatrixIds": ["matrix_001"],
      "evidenceSummary": "...",
      "whatMaterialsSupportThis": "...",
      "whatIsStillMissing": "..."
    }
  ]
}`;

    const result = await callDeepSeekJson<{ topics: TopicCandidate[] }>(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成候选研究问题失败" },
      { status: 500 }
    );
  }
}
