export type Stage = "no_direction" | "vague_direction" | "specific_direction";

export type SeedInputType =
  | "文献标题"
  | "文献摘要"
  | "关键词"
  | "课堂灵感"
  | "个人困惑"
  | "生活观察";

export type InterestLevel = "高" | "中" | "低";

export interface ExtractCardRequest {
  stage: Stage;
  roughDirection: string;
  type: SeedInputType;
  rawContent: string;
  whySaved: string;
}

export interface SeedCard {
  id: string;
  inputType: SeedInputType;
  rawContent: string;
  whySaved: string;
  summary: string;
  keywords: string[];
  possibleObjects: string[];
  possibleConcepts: string[];
  methodHints: string[];
  possibleDirection: string;
  confidence: number;
  interest: InterestLevel;
  createdAt: string;
}

export interface DirectionCluster {
  id: string;
  directionName: string;
  seedIds: string[];
  commonKeywords: string[];
  whyThisDirection: string;
  missingEvidence: string;
  maturityScore: number;
}

export type IdeaAngleType = "对象" | "场景" | "变量" | "方法" | "问题" | "反向";
export type IdeaStatus = "感兴趣" | "暂存" | "忽略";

export interface DivergentIdea {
  id: string;
  sourceSeedIds: string[];
  title: string;
  angleType: IdeaAngleType;
  explanation: string;
  possibleObjects: string[];
  possibleConcepts: string[];
  methodHints: string[];
  followUpQuestions: string[];
  evidenceNote: string;
  status: IdeaStatus;
  createdAt: string;
}

export interface MatrixEntry {
  id: string;
  sourceSeedId: string;
  materialSummary: string;
  researchProblem: string;
  method: string;
  objects: string[];
  concepts: string[];
  innovation: string;
  limitations: string;
  inspirationForUser: string;
}

export interface ResearchOpportunity {
  id: string;
  opportunityName: string;
  evidenceSeedIds: string[];
  whatIsKnown: string;
  whatIsUnsolved: string;
  whyItMatters: string;
  possibleResearchQuestions: string[];
  possibleMethods: string[];
  feasibilityScore: number;
  mainRisks: string[];
  nextSearchKeywords: string[];
  strengthenedDirection?: string;
  insufficientEvidence?: string;
}

export interface TopicCandidate {
  id: string;
  title: string;
  oneSentence: string;
  possibleObjects: string[];
  researchQuestions: string[];
  recommendedMethod: string;
  feasibility: {
    sampleAvailability: number;
    conceptClarity: number;
    methodFeasibility: number;
    literatureBase: number;
    personalInterestFit: number;
  };
  nextKeywords: string[];
  mainRisks: string[];
  evidenceSeedIds: string[];
  evidenceMatrixIds: string[];
  evidenceSummary: string;
  whatMaterialsSupportThis: string;
  whatIsStillMissing: string;
}

export interface AppState {
  stage: Stage;
  roughDirection: string;
  cards: SeedCard[];
  ideas: DivergentIdea[];
  directions: DirectionCluster[];
  matrix: MatrixEntry[];
  opportunities: ResearchOpportunity[];
  topics: TopicCandidate[];
  hasNewMaterialSinceAnalysis: boolean;
}
