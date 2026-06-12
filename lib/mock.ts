import type {
  DivergentIdea,
  DirectionCluster,
  ExtractCardRequest,
  MatrixEntry,
  ResearchOpportunity,
  SeedCard,
  TopicCandidate
} from "@/lib/types";

const now = () => new Date().toISOString();

export const exampleRawMaterials = [
  "我发现很多同学用AI写作业，但他们不一定真的理解内容。",
  "有研究讨论生成式AI对学生学习动机的影响。",
  "我对AI依赖、自我效能感、学习自主性这几个概念感兴趣。",
  "有些学生觉得AI反馈比老师反馈更即时，但也更容易直接照搬。",
  "我想知道长期使用AI会不会影响学生独立思考。",
  "课堂上老师提到认知卸载，我觉得这个概念可能和AI学习有关。",
  "有同学说自己用AI之后更敢开始写作业，但也更难判断答案对不对。",
  "我看到一些讨论AI信任、算法依赖和学习策略变化的文章。"
];

export function makeSeedCard(input: ExtractCardRequest, index = 1): Omit<SeedCard, "id" | "interest" | "createdAt"> {
  const raw = input.rawContent;
  const summary = raw.length > 42 ? `${raw.slice(0, 42)}...` : raw;
  const lower = raw.toLowerCase();
  const keywords = [
    lower.includes("动机") ? "学习动机" : "生成式AI",
    lower.includes("反馈") ? "AI反馈" : "学习行为",
    lower.includes("信任") ? "AI信任" : lower.includes("认知") ? "认知卸载" : "学习理解"
  ];

  return {
    inputType: input.type,
    rawContent: input.rawContent,
    whySaved: input.whySaved,
    summary,
    keywords: Array.from(new Set(keywords)),
    possibleObjects: ["大学生", "生成式AI学习工具使用者"],
    possibleConcepts: lower.includes("效能")
      ? ["AI依赖", "自我效能感", "学习自主性"]
      : lower.includes("反馈")
        ? ["即时反馈", "照搬行为", "反馈信任"]
        : lower.includes("认知")
          ? ["认知卸载", "独立思考", "学习策略"]
          : ["AI使用程度", "内容理解", "学习投入"],
    methodHints: index % 2 === 0 ? ["问卷调查", "访谈"] : ["半结构访谈", "学习日志分析"],
    possibleDirection:
      input.stage === "no_direction"
        ? "生成式AI学习中的兴趣线索"
        : "大学生使用生成式AI学习的行为机制",
    confidence: 0.78
  };
}

export function exampleSeedCards(): SeedCard[] {
  return exampleRawMaterials.map((rawContent, index) => ({
    id: `seed_${String(index + 1).padStart(3, "0")}`,
    ...makeSeedCard(
      {
        stage: "vague_direction",
        roughDirection: "大学生使用生成式AI学习",
        type: index === 1 || index === 7 ? "文献摘要" : index === 5 ? "课堂灵感" : "生活观察",
        rawContent,
        whySaved: "这个材料可能帮助我理解AI学习工具如何影响学生学习过程。"
      },
      index + 1
    ),
    interest: index < 3 ? "高" : index < 6 ? "中" : "低",
    createdAt: now()
  }));
}

export function mockDirections(cards: SeedCard[]): { directions: DirectionCluster[] } {
  const ids = cards.map((card) => card.id);
  return {
    directions: [
      {
        id: "direction_001",
        directionName: "AI辅助学习中的理解与照搬边界",
        seedIds: ids.filter((_, index) => [0, 3, 6].includes(index)),
        commonKeywords: ["AI反馈", "内容理解", "照搬行为"],
        whyThisDirection: "多条材料都指向学生使用AI完成任务时，可能出现效率提升与理解不足并存的现象。",
        missingEvidence: "证据不足：还需要进一步收集学生如何判断AI答案质量、如何修正答案的材料。",
        maturityScore: 74
      },
      {
        id: "direction_002",
        directionName: "AI依赖、学习自主性与自我效能感",
        seedIds: ids.filter((_, index) => [1, 2, 4].includes(index)),
        commonKeywords: ["AI依赖", "学习动机", "自我效能感"],
        whyThisDirection: "已有材料支持将AI使用与学习动机、自我效能感、长期独立思考联系起来。",
        missingEvidence: "需要进一步检索验证不同AI使用方式对学习自主性的差异影响。",
        maturityScore: 68
      },
      {
        id: "direction_003",
        directionName: "认知卸载与学习策略变化",
        seedIds: ids.filter((_, index) => [5, 7].includes(index)),
        commonKeywords: ["认知卸载", "AI信任", "学习策略"],
        whyThisDirection: "材料显示AI可能改变学生分配思考、判断和写作任务的方式。",
        missingEvidence: "证据不足：目前更像概念线索，需要补充更具体的场景和行为材料。",
        maturityScore: 56
      }
    ].filter((direction) => direction.seedIds.length > 0)
  };
}

export function mockIdeas(cards: SeedCard[]): { ideas: Omit<DivergentIdea, "status" | "createdAt">[] } {
  const ids = cards.map((card) => card.id);
  const ideas: Omit<DivergentIdea, "status" | "createdAt">[] = [
    {
      id: "idea_001",
      sourceSeedIds: ids.slice(0, 2),
      title: "把焦虑从结果变量转为使用情境变量",
      angleType: "变量",
      explanation: "不仅问AI是否缓解焦虑，也可以观察焦虑在任务开始、反馈判断、提交前检查等阶段如何变化。",
      possibleObjects: ["大学生", "课程作业压力较高的学生"],
      possibleConcepts: ["焦虑水平", "任务启动", "反馈信任", "自我效能感"],
      methodHints: ["学习日志", "访谈", "问卷调查"],
      followUpQuestions: ["哪类学习任务最容易触发焦虑？", "AI反馈是在缓解焦虑还是推迟焦虑？"],
      evidenceNote: "已有材料支持焦虑、反馈和学习行为存在联系，但具体机制仍需进一步检索验证。"
    },
    {
      id: "idea_002",
      sourceSeedIds: ids.slice(2, 5),
      title: "比较AI帮助前后的学习控制感",
      angleType: "对象",
      explanation: "关注学生使用AI前后，对任务可控性、答案判断和独立完成能力的主观变化。",
      possibleObjects: ["高频AI使用者", "低频AI使用者"],
      possibleConcepts: ["学习控制感", "AI依赖", "自我效能感"],
      methodHints: ["分组问卷", "半结构访谈"],
      followUpQuestions: ["高频使用者是否更有信心开始任务？", "这种信心是否伴随更高依赖？"],
      evidenceNote: "材料支持自我效能和AI依赖线索，但缺少分组比较证据。"
    },
    {
      id: "idea_003",
      sourceSeedIds: ids.slice(3, 8),
      title: "反向观察：AI为什么可能加重焦虑",
      angleType: "反向",
      explanation: "AI并不总是缓解焦虑，答案不确定、难以验证、反馈过多也可能带来新的认知负担。",
      possibleObjects: ["需要判断AI答案质量的学生"],
      possibleConcepts: ["答案不确定性", "AI信任", "认知负荷", "决策焦虑"],
      methodHints: ["情境任务观察", "访谈"],
      followUpQuestions: ["什么情况下AI反馈会增加不确定感？", "学生如何处理多个AI答案之间的冲突？"],
      evidenceNote: "已有材料提到难以判断答案对错；是否加重焦虑仍需进一步验证。"
    },
    {
      id: "idea_004",
      sourceSeedIds: ids.slice(0, 6),
      title: "把缓解焦虑放进课堂支持场景",
      angleType: "场景",
      explanation: "将研究场景限定在课堂作业、论文开题或考试复习，能让焦虑来源和AI介入方式更清楚。",
      possibleObjects: ["课程作业学生", "毕业论文学生"],
      possibleConcepts: ["学业焦虑", "任务清晰度", "AI支持感"],
      methodHints: ["场景化问卷", "访谈"],
      followUpQuestions: ["AI在哪个学习阶段最能缓解焦虑？", "任务清晰度是否影响AI支持效果？"],
      evidenceNote: "这是基于现有材料的可探索推测，需要补充具体课堂场景材料。"
    }
  ];

  return {
    ideas: ideas.filter((idea) => idea.sourceSeedIds.length > 0)
  };
}

export function mockMatrix(cards: SeedCard[]): { matrix: MatrixEntry[] } {
  return {
    matrix: cards.map((card, index) => ({
      id: `matrix_${String(index + 1).padStart(3, "0")}`,
      sourceSeedId: card.id,
      materialSummary: card.summary,
      researchProblem:
        index % 3 === 0
          ? "学生使用AI完成学习任务时，理解是否被任务完成感掩盖？"
          : index % 3 === 1
            ? "生成式AI如何影响学生学习动机和开始任务的意愿？"
            : "AI信任、AI依赖与学习自主性之间可能存在什么关系？",
      method: card.methodHints.join(" / "),
      objects: card.possibleObjects,
      concepts: card.possibleConcepts,
      innovation: "将AI学习工具使用从单纯效率问题转向学习过程、判断能力和自主性变化。",
      limitations: index % 2 === 0 ? "证据不足：当前材料偏观察，需要补充更系统的文献或访谈。" : "需要进一步区分不同AI使用场景和任务类型。",
      inspirationForUser: "可围绕学生如何使用、信任和修正AI反馈，发展更具体的研究问题。"
    }))
  };
}

export function mockOpportunities(cards: SeedCard[], matrix: MatrixEntry[]): { opportunities: ResearchOpportunity[] } {
  const seedIds = cards.map((card) => card.id);
  return {
    opportunities: [
      {
        id: "opp_001",
        opportunityName: "AI反馈即时性是否提高启动意愿但削弱深度加工",
        evidenceSeedIds: seedIds.filter((_, index) => [0, 3, 6].includes(index)),
        whatIsKnown: "已有材料支持学生认为AI反馈即时、能帮助开始任务，也可能直接照搬。",
        whatIsUnsolved: "需要进一步检索验证即时反馈、任务启动和深度加工之间的关系。",
        whyItMatters: "这个机会能把常见AI使用现象转化为可测量的学习过程问题。",
        possibleResearchQuestions: ["AI反馈即时性如何影响大学生的作业启动意愿？", "照搬行为是否中介AI反馈与内容理解之间的关系？"],
        possibleMethods: ["问卷调查", "访谈", "学习任务实验"],
        feasibilityScore: 78,
        mainRisks: ["变量边界需要进一步清晰化", "自陈数据可能高估理解程度"],
        nextSearchKeywords: ["AI反馈", "学习投入", "深度加工", "作业启动"],
        strengthenedDirection: "强化了理解与照搬边界方向",
        insufficientEvidence: matrix.length < 4 ? "证据不足：矩阵条目偏少，建议补充真实论文摘要。" : "仍需补充不同课程任务场景的材料。"
      },
      {
        id: "opp_002",
        opportunityName: "认知卸载视角下的AI依赖与独立思考",
        evidenceSeedIds: seedIds.filter((_, index) => [2, 4, 5, 7].includes(index)),
        whatIsKnown: "材料显示用户关心AI依赖、自我效能、学习自主性、认知卸载和独立思考。",
        whatIsUnsolved: "现有材料还不能判断AI依赖一定削弱独立思考，需要进一步检索和区分使用方式。",
        whyItMatters: "能将抽象担忧转化为具体机制：哪些认知任务被转交给AI，学生还保留哪些判断。",
        possibleResearchQuestions: ["大学生AI依赖是否通过认知卸载影响学习自主性？", "自我效能感是否调节AI使用与独立思考之间的关系？"],
        possibleMethods: ["结构方程模型", "半结构访谈"],
        feasibilityScore: 72,
        mainRisks: ["概念容易重叠", "需要避免把相关关系解释为因果"],
        nextSearchKeywords: ["认知卸载", "AI依赖", "学习自主性", "自我效能感"],
        strengthenedDirection: "强化了认知卸载与学习策略变化方向",
        insufficientEvidence: "需要进一步检索验证认知卸载在AI学习情境中的已有定义。"
      },
      {
        id: "opp_003",
        opportunityName: "学生如何判断AI答案是否可信",
        evidenceSeedIds: seedIds.filter((_, index) => [3, 6, 7].includes(index)),
        whatIsKnown: "材料支持学生会使用AI反馈，但也会遇到难以判断答案正确性的问题。",
        whatIsUnsolved: "证据不足：目前缺少学生实际判断策略和错误识别过程的材料。",
        whyItMatters: "可信度判断是AI学习从工具使用走向学习能力培养的关键环节。",
        possibleResearchQuestions: ["大学生如何形成对AI答案的信任判断？", "AI信任是否影响学生修正和验证答案的学习策略？"],
        possibleMethods: ["访谈", "情境任务观察"],
        feasibilityScore: 69,
        mainRisks: ["需要设计能观察判断过程的任务", "不同学科答案可验证性不同"],
        nextSearchKeywords: ["AI信任", "算法依赖", "信息验证", "学习策略"],
        strengthenedDirection: "新增材料可能强化AI信任与学习策略方向",
        insufficientEvidence: "仍需补充关于AI信任或算法依赖的具体论文材料。"
      }
    ]
  };
}

export function mockTopics(cards: SeedCard[], matrix: MatrixEntry[]): { topics: TopicCandidate[] } {
  const seedIds = cards.map((card) => card.id);
  const matrixIds = matrix.map((entry) => entry.id);
  return {
    topics: [
      {
        id: "topic_001",
        title: "生成式AI反馈即时性对大学生作业启动意愿与深度加工的影响研究",
        oneSentence: "考察AI反馈带来的即时支持是否既帮助学生开始任务，也可能降低深度理解。",
        possibleObjects: ["大学生", "经常使用生成式AI完成课程任务的学生"],
        researchQuestions: ["AI反馈即时性是否提升作业启动意愿？", "照搬倾向是否影响内容理解？", "学生如何解释自己对AI反馈的使用方式？"],
        recommendedMethod: "问卷调查结合访谈",
        feasibility: {
          sampleAvailability: 82,
          conceptClarity: 74,
          methodFeasibility: 78,
          literatureBase: 62,
          personalInterestFit: 86
        },
        nextKeywords: ["AI反馈", "作业启动", "深度加工", "生成式AI学习"],
        mainRisks: ["需要进一步检索验证深度加工的成熟量表", "照搬行为可能存在社会期许偏差"],
        evidenceSeedIds: seedIds.filter((_, index) => [0, 3, 6].includes(index)),
        evidenceMatrixIds: matrixIds.filter((_, index) => [0, 3, 6].includes(index)),
        evidenceSummary: "来自关于AI写作业、AI反馈即时性、开始写作业但难判断答案的材料。",
        whatMaterialsSupportThis: "已有材料支持AI反馈与任务启动、照搬和理解之间存在可研究关系。",
        whatIsStillMissing: "仍需补充真实文献中关于反馈即时性、深度加工和生成式AI学习的已有研究。"
      },
      {
        id: "topic_002",
        title: "AI依赖与学习自主性的关系：认知卸载的中介作用",
        oneSentence: "从认知卸载角度分析长期使用AI是否改变学生自主思考和学习控制感。",
        possibleObjects: ["大学生", "高频使用AI学习工具者"],
        researchQuestions: ["AI依赖是否与学习自主性下降相关？", "认知卸载是否解释二者关系？", "自我效能感是否缓冲AI依赖的负面影响？"],
        recommendedMethod: "问卷调查与结构方程模型",
        feasibility: {
          sampleAvailability: 80,
          conceptClarity: 72,
          methodFeasibility: 70,
          literatureBase: 66,
          personalInterestFit: 84
        },
        nextKeywords: ["AI依赖", "学习自主性", "认知卸载", "自我效能感"],
        mainRisks: ["概念边界需要严格定义", "横截面数据不能直接说明因果"],
        evidenceSeedIds: seedIds.filter((_, index) => [2, 4, 5].includes(index)),
        evidenceMatrixIds: matrixIds.filter((_, index) => [2, 4, 5].includes(index)),
        evidenceSummary: "来自AI依赖、自我效能、学习自主性、独立思考和认知卸载材料。",
        whatMaterialsSupportThis: "已有材料支持用户对AI依赖与独立思考的机制性兴趣。",
        whatIsStillMissing: "需要进一步检索认知卸载在教育技术与AI学习中的操作化方式。"
      },
      {
        id: "topic_003",
        title: "大学生对AI答案的信任判断及其学习策略变化研究",
        oneSentence: "关注学生如何判断AI答案可信，以及这种判断如何影响验证、修改和照搬行为。",
        possibleObjects: ["大学生", "使用AI完成写作或课程任务的学生"],
        researchQuestions: ["学生如何判断AI答案是否可信？", "AI信任是否影响答案验证行为？", "不同课程任务中的信任判断是否不同？"],
        recommendedMethod: "半结构访谈与情境任务观察",
        feasibility: {
          sampleAvailability: 76,
          conceptClarity: 70,
          methodFeasibility: 74,
          literatureBase: 58,
          personalInterestFit: 82
        },
        nextKeywords: ["AI信任", "算法依赖", "答案验证", "学习策略"],
        mainRisks: ["访谈样本可能偏主观", "任务设计需要能暴露判断过程"],
        evidenceSeedIds: seedIds.filter((_, index) => [3, 6, 7].includes(index)),
        evidenceMatrixIds: matrixIds.filter((_, index) => [3, 6, 7].includes(index)),
        evidenceSummary: "来自AI反馈、难以判断答案对错、AI信任和算法依赖材料。",
        whatMaterialsSupportThis: "已有材料支持学生在AI学习中存在信任和判断问题。",
        whatIsStillMissing: "证据不足：需要补充关于AI信任形成机制的文献或实证材料。"
      }
    ]
  };
}
