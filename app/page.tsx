"use client";

import {
  ArrowRight,
  BookOpenCheck,
  Boxes,
  BrainCircuit,
  Check,
  Crown,
  Download,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Network,
  Plus,
  RefreshCw,
  SearchCheck,
  Sparkles,
  Trash2,
  Upload,
  WandSparkles
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button, Card, Field, Input, Progress, Select, Textarea } from "@/components/ui";
import { useSeedStore } from "@/lib/store";
import type {
  DirectionCluster,
  DivergentIdea,
  IdeaStatus,
  ExtractCardRequest,
  InterestLevel,
  MatrixEntry,
  ResearchOpportunity,
  SeedCard,
  SeedInputType,
  Stage,
  TopicCandidate
} from "@/lib/types";
import { clampScore, formatDateTime, splitList } from "@/lib/utils";

const views = [
  { id: "dashboard", label: "首页", icon: LayoutDashboard },
  { id: "inbox", label: "种子收集箱", icon: Plus },
  { id: "cards", label: "种子卡片库", icon: Boxes },
  { id: "ideas", label: "灵感发散池", icon: WandSparkles },
  { id: "directions", label: "方向地图", icon: GitBranch },
  { id: "matrix", label: "材料对比矩阵", icon: BookOpenCheck },
  { id: "opportunities", label: "研究机会地图", icon: Network },
  { id: "topics", label: "候选选题板", icon: Lightbulb }
] as const;

type ViewId = (typeof views)[number]["id"];

const stageLabels: Record<Stage, string> = {
  no_direction: "我完全没有方向",
  vague_direction: "我有一个模糊方向",
  specific_direction: "我已有具体方向"
};

const stageCopy: Record<Stage, string> = {
  no_direction: "从兴趣、课堂灵感、关键词和生活观察中形成兴趣簇。",
  vague_direction: "围绕粗方向整理材料差异，挖掘潜在研究空白。",
  specific_direction: "拆解论文或笔记，提炼创新点、局限和候选研究问题。"
};

const seedTypes: SeedInputType[] = ["文献标题", "文献摘要", "关键词", "课堂灵感", "个人困惑", "生活观察"];

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || "请求失败");
  }
  return json as T;
}

export default function Home() {
  const { state, actions, hydrated } = useSeedStore();
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [pricingOpen, setPricingOpen] = useState(false);
  const seedMap = useMemo(() => new Map(state.cards.map((card) => [card.id, card])), [state.cards]);

  if (!hydrated) {
    return (
      <main className="grid min-h-screen place-items-center text-ink">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在打开选题种子库
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-5">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-5 rounded-lg border border-ink/10 bg-white/78 p-3 shadow-soft">
            <div className="px-2 py-3">
              <div className="flex items-center gap-2 text-lg font-bold text-ink">
                <Sparkles className="h-5 w-5 text-clay" />
                选题种子库
              </div>
              <p className="mt-1 text-xs leading-5 text-ink/60">把零散文献与灵感孵化成研究方向</p>
            </div>
            <nav className="mt-3 grid gap-1">
              {views.map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                      activeView === view.id ? "bg-moss text-white" : "text-ink/72 hover:bg-sage/70"
                    }`}
                    onClick={() => setActiveView(view.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {view.label}
                  </button>
                );
              })}
            </nav>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => setPricingOpen(true)}>
              <Crown className="h-4 w-4" />
              会员版
            </Button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <Header activeView={activeView} setActiveView={setActiveView} openPricing={() => setPricingOpen(true)} />
          <StageStrip state={state} />
          {state.hasNewMaterialSinceAnalysis ? <IterationNotice /> : null}

          {activeView === "dashboard" && (
            <Dashboard state={state} actions={actions} goTo={setActiveView} openPricing={() => setPricingOpen(true)} />
          )}
          {activeView === "inbox" && <SeedInbox state={state} actions={actions} goTo={setActiveView} />}
          {activeView === "cards" && <SeedCards cards={state.cards} actions={actions} />}
          {activeView === "ideas" && <IdeaDivergence state={state} actions={actions} seedMap={seedMap} />}
          {activeView === "directions" && (
            <DirectionMap state={state} actions={actions} seedMap={seedMap} />
          )}
          {activeView === "matrix" && <MaterialMatrix state={state} actions={actions} seedMap={seedMap} />}
          {activeView === "opportunities" && (
            <OpportunityMap state={state} actions={actions} seedMap={seedMap} />
          )}
          {activeView === "topics" && <TopicBoard state={state} actions={actions} seedMap={seedMap} />}
        </section>
      </div>
      {pricingOpen ? <PricingModal onClose={() => setPricingOpen(false)} /> : null}
    </main>
  );
}

function Header({
  activeView,
  setActiveView,
  openPricing
}: {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  openPricing: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">选题种子库</h1>
        </div>
        <Button variant="secondary" onClick={openPricing}>
          <Crown className="h-4 w-4" />
          会员版
        </Button>
        <div className="flex flex-wrap gap-2 lg:hidden">
          {views.map((view) => (
            <Button
              key={view.id}
              size="sm"
              variant={activeView === view.id ? "primary" : "secondary"}
              onClick={() => setActiveView(view.id)}
            >
              {view.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StageStrip({ state }: { state: ReturnType<typeof useSeedStore>["state"] }) {
  return (
    <Card className="mb-4 p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>当前阶段</Badge>
            <span className="font-semibold">{stageLabels[state.stage]}</span>
            {state.stage !== "no_direction" && state.roughDirection ? (
              <Badge className="bg-white">{state.roughDirection}</Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-ink/62">{stageCopy[state.stage]}</p>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {["收集", "卡片", "矩阵", "机会", "选题"].map((step, index) => (
            <div key={step} className="rounded-md border border-ink/10 bg-paper px-3 py-2">
              <div className="font-semibold text-ink">{index + 1}</div>
              <div className="text-ink/56">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function IterationNotice() {
  return (
    <div className="mb-4 rounded-lg border border-gold/30 bg-gold/12 px-4 py-3 text-sm text-ink">
      新增材料可能改变方向判断，你可以重新生成方向地图/研究机会地图/候选研究问题。
    </div>
  );
}

function Dashboard({
  state,
  actions,
  goTo,
  openPricing
}: {
  state: ReturnType<typeof useSeedStore>["state"];
  actions: ReturnType<typeof useSeedStore>["actions"];
  goTo: (view: ViewId) => void;
  openPricing: () => void;
}) {
  const stats = [
    ["种子数量", state.cards.length],
    ["方向数量", state.directions.length],
    ["矩阵条目", state.matrix.length],
    ["研究机会", state.opportunities.length],
    ["候选问题", state.topics.length]
  ];

  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <Badge className="mb-4">Research Direction Incubator</Badge>
            <h2 className="max-w-3xl text-3xl font-bold leading-tight text-ink md:text-5xl">
              把零散文献与灵感孵化成研究方向
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/66">
              面向还在早期探索的本科和研究生论文选题，把课堂灵感、关键词、论文片段和个人困惑整理成证据可追踪的研究机会。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => goTo("inbox")}>
                <Plus className="h-4 w-4" />
                添加第一颗种子
              </Button>
              <Button variant="secondary" onClick={actions.loadExample}>
                <Sparkles className="h-4 w-4" />
                加载AI学习工具使用研究示例
              </Button>
              <Button variant="secondary" onClick={openPricing}>
                <Crown className="h-4 w-4" />
                查看会员方案
              </Button>
            </div>
          </div>
          <div className="grid content-start gap-3">
            <Field label="我的选题阶段">
              <Select value={state.stage} onChange={(event) => actions.setStage(event.target.value as Stage)}>
                <option value="no_direction">我完全没有方向</option>
                <option value="vague_direction">我有一个模糊方向</option>
                <option value="specific_direction">我已有具体方向</option>
              </Select>
            </Field>
            {state.stage !== "no_direction" ? (
              <Field label="粗方向">
                <div className="flex gap-2">
                  <Input
                    value={state.roughDirection}
                    placeholder="例如：大学生使用生成式AI学习"
                    onChange={(event) => actions.setRoughDirection(event.target.value)}
                  />
                  {state.roughDirection ? (
                    <Button type="button" variant="secondary" onClick={() => actions.setRoughDirection("")}>
                      清空
                    </Button>
                  ) : null}
                </div>
              </Field>
            ) : null}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-2">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-md border border-ink/10 bg-paper p-3">
                  <div className="text-2xl font-bold text-ink">{value}</div>
                  <div className="mt-1 text-xs text-ink/55">{label}</div>
                </div>
              ))}
            </div>
            <DataPortability state={state} actions={actions} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold">它与 Zotero 不同</h3>
          <p className="mt-2 text-sm leading-6 text-ink/64">
            Zotero 帮你保存、组织和引用文献；选题种子库帮助你从零散兴趣、文献片段和生活观察中发现研究方向。
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold">它与 ChatGPT 不同</h3>
          <p className="mt-2 text-sm leading-6 text-ink/64">
            ChatGPT 更像一次性问答；这里把灵感、标签、材料矩阵、证据来源、研究机会和候选问题保存为可视化工作台。
          </p>
        </Card>
      </div>
    </div>
  );
}

function DataPortability({
  state,
  actions
}: {
  state: ReturnType<typeof useSeedStore>["state"];
  actions: ReturnType<typeof useSeedStore>["actions"];
}) {
  const [message, setMessage] = useState("");

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      product: "选题种子库",
      version: 2,
      state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `选题种子库备份-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("已导出当前工作台数据。");
  }

  async function importData(file: File | undefined) {
    if (!file) return;
    setMessage("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedState = parsed.state ?? parsed;
      actions.importState(importedState);
      setMessage("导入成功，当前工作台已恢复。");
    } catch {
      setMessage("导入失败：请选择有效的选题种子库 JSON 备份。");
    }
  }

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-3">
      <div className="mb-3 text-sm font-semibold text-ink">数据备份</div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={exportData}>
          <Download className="h-4 w-4" />
          导出数据
        </Button>
        <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border border-sage bg-white px-3 text-sm font-medium text-ink transition hover:border-moss">
          <Upload className="h-4 w-4" />
          导入数据
          <input
            className="hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => importData(event.target.files?.[0])}
          />
        </label>
      </div>
      {message ? <p className="mt-2 text-xs text-ink/60">{message}</p> : null}
    </div>
  );
}

const pricingRows = [
  ["种子卡数量", "最多20张种子卡", "无限种子卡"],
  ["方向地图", "生成1张方向地图", "多方向地图与历史版本对比"],
  ["灵感发散", "基础发散池", "更多发散角度与批量筛选"],
  ["材料矩阵", "基础材料对比矩阵", "文献/材料深度对比与空白提示"],
  ["候选选题", "基础候选问题", "开题报告框架与研究问题迭代"],
  ["导出能力", "手动导出JSON", "一键导出选题分析报告"],
  ["数据保存", "浏览器本地保存", "云端同步与多设备访问"]
];

const freeFeatures = ["适合初次体验", "本地保存", "基础种子卡和方向生成", "手动导入/导出"];
const paidFeatures = ["不限卡片", "更多方向对比", "开题报告框架", "一键导出分析报告", "云端同步"];

function PricingModal({ onClose }: { onClose: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "paid">("paid");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-ink/10 bg-paper shadow-soft">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink/10 bg-paper/95 px-5 py-4 backdrop-blur">
          <div>
            <Badge className="mb-2 bg-white">
              <Crown className="mr-1 h-3.5 w-3.5" />
              会员方案预览
            </Badge>
            <h2 className="text-2xl font-bold text-ink">选择适合你的选题工作台</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">当前只展示产品设计，不接真实支付。</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            关闭
          </Button>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-2">
          <button
            className={`rounded-lg border p-5 text-left transition ${
              selectedPlan === "free" ? "border-moss bg-white" : "border-ink/10 bg-white/70 hover:border-moss/50"
            }`}
            onClick={() => setSelectedPlan("free")}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold">免费版</h3>
              <Badge className="bg-white">当前可用</Badge>
            </div>
            <p className="mt-2 text-sm text-ink/60">适合刚开始收集灵感和验证选题方向。</p>
            <div className="mt-5 text-3xl font-bold">¥0<span className="text-sm font-medium text-ink/50"> / 月</span></div>
            <Button className="mt-5 w-full" variant="secondary">继续使用免费版</Button>
            <FeatureList items={freeFeatures} />
          </button>

          <button
            className={`rounded-lg border p-5 text-left transition ${
              selectedPlan === "paid" ? "border-clay bg-white" : "border-ink/10 bg-white/70 hover:border-clay/50"
            }`}
            onClick={() => setSelectedPlan("paid")}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold">会员版</h3>
              <Badge className="border-clay/25 bg-clay/10 text-clay">推荐</Badge>
            </div>
            <p className="mt-2 text-sm text-ink/60">适合持续推进论文选题、开题和材料整理。</p>
            <div className="mt-5 text-3xl font-bold">¥29<span className="text-sm font-medium text-ink/50"> / 月</span></div>
            <Button className="mt-5 w-full" onClick={(event) => event.preventDefault()}>
              模拟开通会员
            </Button>
            <FeatureList items={paidFeatures} />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-ink/10 bg-sage/55 px-4 py-3 text-sm font-bold">
              <div>能力</div>
              <div>免费版</div>
              <div>会员版</div>
            </div>
            {pricingRows.map(([label, free, paid]) => (
              <div key={label} className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-ink/10 px-4 py-3 text-sm last:border-b-0">
                <div className="font-semibold text-ink">{label}</div>
                <div className="text-ink/64">{free}</div>
                <div className="font-medium text-ink">{paid}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-ink/50">
            后续如果接真实付费，建议先接 Stripe 或 Lemon Squeezy；国内场景可再评估微信/支付宝收款和发票需求。
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-3 text-sm text-ink/66">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <Check className="h-4 w-4 text-moss" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function SeedInbox({
  state,
  actions,
  goTo
}: {
  state: ReturnType<typeof useSeedStore>["state"];
  actions: ReturnType<typeof useSeedStore>["actions"];
  goTo: (view: ViewId) => void;
}) {
  const [inputType, setInputType] = useState<SeedInputType>("课堂灵感");
  const [rawContent, setRawContent] = useState("");
  const [whySaved, setWhySaved] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latest, setLatest] = useState<SeedCard | null>(null);

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const request: ExtractCardRequest = {
        stage: state.stage,
        roughDirection: state.roughDirection,
        type: inputType,
        rawContent,
        whySaved
      };
      const result = await postJson<Omit<SeedCard, "id" | "inputType" | "rawContent" | "whySaved" | "interest" | "createdAt">>(
        "/api/extract-card",
        request
      );
      const card: SeedCard = {
        id: `seed_${Date.now()}`,
        inputType,
        rawContent,
        whySaved,
        ...result,
        confidence: result.confidence ?? 0.72,
        interest: "中",
        createdAt: new Date().toISOString()
      };
      actions.addCard(card);
      setLatest(card);
      setRawContent("");
      setWhySaved("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <Card className="p-5">
        <h2 className="text-xl font-bold">Seed Inbox 种子收集箱</h2>
        <p className="mt-2 text-sm leading-6 text-ink/62">
          输入一条材料，系统会把它转成可聚类、可比较、可追踪证据的种子卡。
        </p>
        {state.stage !== "no_direction" && state.roughDirection ? (
          <div className="mt-4 rounded-md border border-gold/30 bg-gold/12 p-3 text-sm text-ink">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                当前生成会参考粗方向：
                <span className="font-semibold">{state.roughDirection}</span>
              </span>
              <Button size="sm" variant="secondary" onClick={() => actions.setRoughDirection("")}>
                清空粗方向
              </Button>
            </div>
          </div>
        ) : null}
        <div className="mt-5 grid gap-4">
          <Field label="类型">
            <Select value={inputType} onChange={(event) => setInputType(event.target.value as SeedInputType)}>
              {seedTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </Field>
          <Field label="原始内容 rawContent">
            <Textarea value={rawContent} onChange={(event) => setRawContent(event.target.value)} placeholder="粘贴论文标题、摘要片段、课堂灵感、关键词或个人困惑" />
          </Field>
          <Field label="我为什么存它 whySaved">
            <Textarea value={whySaved} onChange={(event) => setWhySaved(event.target.value)} placeholder="例如：我觉得它可能和AI依赖、学习自主性有关" />
          </Field>
          {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <Button disabled={loading || !rawContent.trim()} onClick={submit}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            生成种子卡
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">生成结果</h3>
          <Button size="sm" variant="secondary" onClick={() => goTo("cards")}>
            查看卡片库
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {latest ? <SeedCardView card={latest} compact /> : <EmptyState title="还没有生成结果" text="添加一条材料后，这里会显示结构化种子卡。" />}
      </Card>
    </div>
  );
}

function SeedCards({
  cards,
  actions
}: {
  cards: SeedCard[];
  actions: ReturnType<typeof useSeedStore>["actions"];
}) {
  if (!cards.length) return <EmptyState title="卡片库还是空的" text="先去 Seed Inbox 添加一条材料，或在首页加载示例数据。" />;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <EditableSeedCard key={card.id} card={card} actions={actions} />
      ))}
    </div>
  );
}

function EditableSeedCard({
  card,
  actions
}: {
  card: SeedCard;
  actions: ReturnType<typeof useSeedStore>["actions"];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card);

  function save() {
    actions.updateCard(draft);
    setEditing(false);
  }

  if (!editing) {
    return (
      <Card className="p-4">
        <SeedCardView card={card} />
        <div className="mt-4 flex flex-wrap gap-2">
          {(["高", "中", "低"] as InterestLevel[]).map((level) => (
            <Button
              key={level}
              size="sm"
              variant={card.interest === level ? "primary" : "secondary"}
              onClick={() => actions.updateCard({ ...card, interest: level })}
            >
              {level}
            </Button>
          ))}
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            编辑
          </Button>
          <Button size="sm" variant="danger" onClick={() => actions.deleteCard(card.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="grid gap-3 p-4">
      <Field label="摘要">
        <Textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} />
      </Field>
      <Field label="关键词">
        <Input value={draft.keywords.join("，")} onChange={(event) => setDraft({ ...draft, keywords: splitList(event.target.value) })} />
      </Field>
      <Field label="研究对象">
        <Input value={draft.possibleObjects.join("，")} onChange={(event) => setDraft({ ...draft, possibleObjects: splitList(event.target.value) })} />
      </Field>
      <Field label="概念/变量">
        <Input value={draft.possibleConcepts.join("，")} onChange={(event) => setDraft({ ...draft, possibleConcepts: splitList(event.target.value) })} />
      </Field>
      <Field label="方法提示">
        <Input value={draft.methodHints.join("，")} onChange={(event) => setDraft({ ...draft, methodHints: splitList(event.target.value) })} />
      </Field>
      <Field label="可能方向">
        <Input value={draft.possibleDirection} onChange={(event) => setDraft({ ...draft, possibleDirection: event.target.value })} />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>保存</Button>
        <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>取消</Button>
      </div>
    </Card>
  );
}

function makeSeedCardFromIdea(idea: DivergentIdea): SeedCard {
  return {
    id: `seed_${Date.now()}`,
    inputType: "个人困惑",
    rawContent: `${idea.title}\n\n${idea.explanation}\n\n追问：${idea.followUpQuestions.join("；")}`,
    whySaved: "从灵感发散池中转化而来，作为后续聚类和研究机会挖掘的新增材料。",
    summary: idea.title,
    keywords: [idea.angleType, ...idea.possibleConcepts].slice(0, 6),
    possibleObjects: idea.possibleObjects,
    possibleConcepts: idea.possibleConcepts,
    methodHints: idea.methodHints,
    possibleDirection: idea.explanation,
    confidence: 0.7,
    interest: "高",
    createdAt: new Date().toISOString()
  };
}

function IdeaDivergence({
  state,
  actions,
  seedMap
}: {
  state: ReturnType<typeof useSeedStore>["state"];
  actions: ReturnType<typeof useSeedStore>["actions"];
  seedMap: Map<string, SeedCard>;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"全部" | IdeaStatus>("全部");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeCards = selectedIds.length ? state.cards.filter((card) => selectedIds.includes(card.id)) : state.cards;
  const interestedCount = state.ideas.filter((idea) => idea.status === "感兴趣").length;
  const statusPriority: Record<IdeaStatus, number> = { 感兴趣: 0, 暂存: 1, 忽略: 2 };
  const visibleIdeas = state.ideas
    .filter((idea) => statusFilter === "全部" || idea.status === statusFilter)
    .toSorted((a, b) => statusPriority[a.status] - statusPriority[b.status]);

  function toggleSeed(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const result = await postJson<{ ideas: Array<Omit<DivergentIdea, "status" | "createdAt">> }>("/api/diverge-ideas", {
        stage: state.stage,
        roughDirection: state.roughDirection,
        cards: activeCards
      });
      actions.addIdeas(
        result.ideas.map((idea, index) => ({
          ...idea,
          id: idea.id || `idea_${Date.now()}_${index}`,
          status: "暂存",
          createdAt: new Date().toISOString()
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  function ideaToSeedCard(idea: DivergentIdea) {
    actions.addCard(makeSeedCardFromIdea(idea));
    actions.deleteIdea(idea.id);
  }

  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-xl font-bold">灵感发散池</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/62">
              先把种子材料扩散成多个探索角度，再由你选择感兴趣的发散点进入方向聚类，避免AI直接替你收束。
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink/60">
              <Badge>{state.ideas.length} 个发散点</Badge>
              <Badge className="bg-white">{interestedCount} 个感兴趣</Badge>
              <Badge className="bg-white">{selectedIds.length ? `已选择 ${selectedIds.length} 张种子` : "默认使用全部种子"}</Badge>
            </div>
          </div>
          <Button disabled={!state.cards.length || loading} onClick={generate}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
            发散灵感
          </Button>
        </div>
        {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      </Card>

      <Card className="p-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-bold">发散点筛选</h3>
            <p className="mt-1 text-sm leading-6 text-ink/56">
              忽略会保留发散点，方便之后恢复；删除会从发散池彻底移除。转成种子卡后，原发散点会自动移出发散池。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["全部", "感兴趣", "暂存", "忽略"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "primary" : "secondary"}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {state.cards.length ? (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">选择用于发散的种子</h3>
              <p className="mt-1 text-sm text-ink/56">不勾选时默认使用全部种子卡。</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setSelectedIds([])}>
              使用全部
            </Button>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {state.cards.map((card) => (
              <button
                key={card.id}
                className={`rounded-md border p-3 text-left text-sm transition ${
                  selectedIds.includes(card.id)
                    ? "border-moss bg-sage/70"
                    : "border-ink/10 bg-white hover:border-moss/50"
                }`}
                onClick={() => toggleSeed(card.id)}
              >
                <div className="font-semibold text-ink">{card.summary}</div>
                <div className="mt-2 line-clamp-2 text-xs leading-5 text-ink/56">{card.rawContent}</div>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {!state.ideas.length ? (
        <EmptyState title="还没有发散点" text="先添加种子卡，再点击发散灵感。你可以先看扩散结果，再挑选感兴趣的进入方向聚类。" />
      ) : !visibleIdeas.length ? (
        <EmptyState title="当前筛选没有结果" text="换一个筛选状态，或继续生成新的发散点。" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} seedMap={seedMap} actions={actions} onToSeed={() => ideaToSeedCard(idea)} />
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({
  idea,
  seedMap,
  actions,
  onToSeed
}: {
  idea: DivergentIdea;
  seedMap: Map<string, SeedCard>;
  actions: ReturnType<typeof useSeedStore>["actions"];
  onToSeed: () => void;
}) {
  const statusOptions: IdeaStatus[] = ["感兴趣", "暂存", "忽略"];

  return (
    <Card className={`p-4 ${idea.status === "忽略" ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{idea.angleType}</Badge>
        <Badge className={idea.status === "感兴趣" ? "bg-clay/10 text-clay" : "bg-white"}>{idea.status}</Badge>
      </div>
      <h3 className="mt-3 font-bold leading-6">{idea.title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/64">{idea.explanation}</p>
      <EvidenceSeeds ids={idea.sourceSeedIds} seedMap={seedMap} />
      <InfoLine label="对象" items={idea.possibleObjects} />
      <InfoLine label="概念" items={idea.possibleConcepts} />
      <InfoLine label="方法" items={idea.methodHints} />
      <InfoLine label="可追问" items={idea.followUpQuestions} />
      <p className="mt-3 text-sm leading-6 text-clay">{idea.evidenceNote}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={idea.status === status ? "primary" : "secondary"}
            onClick={() => actions.updateIdea({ ...idea, status })}
          >
            {status}
          </Button>
        ))}
        <Button size="sm" variant="secondary" onClick={onToSeed}>
          转成种子卡
        </Button>
        <Button size="sm" variant="danger" onClick={() => actions.deleteIdea(idea.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function SeedCardView({ card, compact = false }: { card: SeedCard; compact?: boolean }) {
  return (
    <div className={compact ? "mt-4" : ""}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{card.inputType}</Badge>
        <Badge className="bg-white">兴趣 {card.interest}</Badge>
        <span className="text-xs text-ink/45">{formatDateTime(card.createdAt)}</span>
      </div>
      <h3 className="mt-3 font-bold leading-6">{card.summary}</h3>
      <RawContentBlock content={card.rawContent} />
      <ChipRow items={card.keywords} />
      <InfoLine label="对象" items={card.possibleObjects} />
      <InfoLine label="概念" items={card.possibleConcepts} />
      <InfoLine label="方法" items={card.methodHints} />
      <p className="mt-3 text-sm text-ink/62"><span className="font-semibold text-ink">方向：</span>{card.possibleDirection}</p>
      <p className="mt-2 text-sm text-ink/62"><span className="font-semibold text-ink">为什么存：</span>{card.whySaved || "未填写"}</p>
    </div>
  );
}

function RawContentBlock({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > 120;
  const displayContent = !isLong || expanded ? content : `${content.slice(0, 120)}...`;

  return (
    <div className="mt-3 rounded-md border border-ink/10 bg-paper/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-ink/55">原始内容</span>
        {isLong ? (
          <Button size="sm" variant="ghost" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "收起" : "展开"}
          </Button>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink/68">{displayContent}</p>
    </div>
  );
}

function DirectionMap({
  state,
  actions,
  seedMap
}: {
  state: ReturnType<typeof useSeedStore>["state"];
  actions: ReturnType<typeof useSeedStore>["actions"];
  seedMap: Map<string, SeedCard>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const result = await postJson<{ directions: DirectionCluster[] }>("/api/cluster-directions", {
        stage: state.stage,
        roughDirection: state.roughDirection,
        cards: state.cards,
        ideas: state.ideas.filter((idea) => idea.status === "感兴趣")
      });
      actions.setDirections(result.directions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GeneratorSection
      title="Direction Map 方向地图"
      description="把多张种子卡聚类成方向簇，观察哪些方向已成熟，哪些仍缺证据。"
      buttonLabel="生成方向地图"
      disabled={!state.cards.length}
      loading={loading}
      error={error}
      onGenerate={generate}
      onClear={actions.clearDirections}
      clearLabel="清空方向地图"
      empty={!state.directions.length}
      emptyText="暂无方向簇。添加多张种子卡后生成方向地图。"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {state.directions.map((direction) => (
          <Card key={direction.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold leading-6">{direction.directionName}</h3>
              <Badge>{direction.seedIds.length} 张卡</Badge>
            </div>
            <ChipRow items={direction.commonKeywords} />
            <p className="mt-3 text-sm leading-6 text-ink/64">{direction.whyThisDirection}</p>
            <p className="mt-2 text-sm leading-6 text-ink/64"><span className="font-semibold text-ink">缺少：</span>{direction.missingEvidence}</p>
            <Score label="方向成熟度" value={direction.maturityScore} />
            <EvidenceSeeds ids={direction.seedIds} seedMap={seedMap} />
          </Card>
        ))}
      </div>
    </GeneratorSection>
  );
}

function MaterialMatrix({
  state,
  actions,
  seedMap
}: {
  state: ReturnType<typeof useSeedStore>["state"];
  actions: ReturnType<typeof useSeedStore>["actions"];
  seedMap: Map<string, SeedCard>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const result = await postJson<{ matrix: MatrixEntry[] }>("/api/analyze-material-matrix", {
        stage: state.stage,
        roughDirection: state.roughDirection,
        cards: state.cards
      });
      actions.setMatrix(result.matrix);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GeneratorSection
      title="Material Matrix 文献/材料对比矩阵"
      description="把多条材料拆成研究问题、方法、对象、变量、创新点、局限和启发。"
      buttonLabel="生成材料对比矩阵"
      disabled={!state.cards.length}
      loading={loading}
      error={error}
      onGenerate={generate}
      empty={!state.matrix.length}
      emptyText="暂无矩阵。先添加种子卡，再生成材料对比矩阵。"
    >
      <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="min-w-[1120px] border-collapse text-left text-sm">
          <thead className="bg-sage/55 text-xs text-ink/70">
            <tr>
              {["材料", "研究问题", "方法", "对象", "概念/变量", "创新点", "局限", "启发"].map((head) => (
                <th key={head} className="border-b border-ink/10 px-3 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.matrix.map((entry) => (
              <tr key={entry.id} className="align-top">
                <td className="border-b border-ink/10 px-3 py-3">
                  <Badge className="mb-2 bg-white">{seedMap.get(entry.sourceSeedId)?.inputType || entry.sourceSeedId}</Badge>
                  <div>{entry.materialSummary}</div>
                </td>
                <td className="border-b border-ink/10 px-3 py-3">{entry.researchProblem}</td>
                <td className="border-b border-ink/10 px-3 py-3">{entry.method}</td>
                <td className="border-b border-ink/10 px-3 py-3">{entry.objects.join("、")}</td>
                <td className="border-b border-ink/10 px-3 py-3">{entry.concepts.join("、")}</td>
                <td className="border-b border-ink/10 px-3 py-3">{entry.innovation}</td>
                <td className="border-b border-ink/10 px-3 py-3">{entry.limitations}</td>
                <td className="border-b border-ink/10 px-3 py-3">{entry.inspirationForUser}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GeneratorSection>
  );
}

function OpportunityMap({
  state,
  actions,
  seedMap
}: {
  state: ReturnType<typeof useSeedStore>["state"];
  actions: ReturnType<typeof useSeedStore>["actions"];
  seedMap: Map<string, SeedCard>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const result = await postJson<{ opportunities: ResearchOpportunity[] }>("/api/mine-research-opportunities", {
        stage: state.stage,
        roughDirection: state.roughDirection,
        matrix: state.matrix,
        cards: state.cards
      });
      actions.setOpportunities(result.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GeneratorSection
      title="Opportunity Map 研究机会地图"
      description="从已有材料中区分已知、未解、重要性、可行路径和下一步检索关键词。"
      buttonLabel="生成研究机会地图"
      disabled={!state.cards.length}
      loading={loading}
      error={error}
      onGenerate={generate}
      empty={!state.opportunities.length}
      emptyText="暂无研究机会。建议先生成材料矩阵，再生成机会地图。"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {state.opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="p-4">
            <h3 className="font-bold leading-6">{opportunity.opportunityName}</h3>
            <EvidenceSeeds ids={opportunity.evidenceSeedIds} seedMap={seedMap} />
            <p className="mt-3 text-sm leading-6 text-ink/64"><span className="font-semibold text-ink">已知：</span>{opportunity.whatIsKnown}</p>
            <p className="mt-2 text-sm leading-6 text-ink/64"><span className="font-semibold text-ink">未解：</span>{opportunity.whatIsUnsolved}</p>
            <p className="mt-2 text-sm leading-6 text-ink/64"><span className="font-semibold text-ink">重要性：</span>{opportunity.whyItMatters}</p>
            <InfoLine label="问题" items={opportunity.possibleResearchQuestions} />
            <InfoLine label="方法" items={opportunity.possibleMethods} />
            <Score label="可行性" value={opportunity.feasibilityScore} />
            <InfoLine label="风险" items={opportunity.mainRisks} />
            <InfoLine label="检索" items={opportunity.nextSearchKeywords} />
            {opportunity.strengthenedDirection ? <Badge className="mt-3 bg-white">{opportunity.strengthenedDirection}</Badge> : null}
            {opportunity.insufficientEvidence ? <p className="mt-2 text-sm text-clay">{opportunity.insufficientEvidence}</p> : null}
          </Card>
        ))}
      </div>
    </GeneratorSection>
  );
}

function TopicBoard({
  state,
  actions,
  seedMap
}: {
  state: ReturnType<typeof useSeedStore>["state"];
  actions: ReturnType<typeof useSeedStore>["actions"];
  seedMap: Map<string, SeedCard>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const result = await postJson<{ topics: TopicCandidate[] }>("/api/generate-topics", {
        stage: state.stage,
        roughDirection: state.roughDirection,
        directions: state.directions,
        matrix: state.matrix,
        opportunities: state.opportunities,
        cards: state.cards
      });
      actions.setTopics(result.topics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GeneratorSection
      title="Topic Board 候选研究问题板"
      description="候选问题必须绑定证据来源，同时指出已有材料支持什么、仍缺什么。"
      buttonLabel="生成候选研究问题"
      disabled={!state.cards.length}
      loading={loading}
      error={error}
      onGenerate={generate}
      empty={!state.topics.length}
      emptyText="暂无候选研究问题。建议先生成矩阵和研究机会，再生成候选问题。"
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {state.topics.map((topic) => (
          <Card key={topic.id} className="p-5">
            <h3 className="text-lg font-bold leading-7">{topic.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/64">{topic.oneSentence}</p>
            <EvidenceSeeds ids={topic.evidenceSeedIds} seedMap={seedMap} />
            <p className="mt-3 text-sm leading-6 text-ink/64"><span className="font-semibold text-ink">证据摘要：</span>{topic.evidenceSummary}</p>
            <p className="mt-2 text-sm leading-6 text-ink/64"><span className="font-semibold text-ink">支持材料：</span>{topic.whatMaterialsSupportThis}</p>
            <p className="mt-2 text-sm leading-6 text-clay"><span className="font-semibold">仍缺：</span>{topic.whatIsStillMissing}</p>
            <InfoLine label="对象" items={topic.possibleObjects} />
            <InfoLine label="问题" items={topic.researchQuestions} />
            <p className="mt-3 text-sm text-ink/64"><span className="font-semibold text-ink">方法：</span>{topic.recommendedMethod}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Score label="样本可得性" value={topic.feasibility.sampleAvailability} />
              <Score label="变量清晰度" value={topic.feasibility.conceptClarity} />
              <Score label="方法可行性" value={topic.feasibility.methodFeasibility} />
              <Score label="文献基础" value={topic.feasibility.literatureBase} />
              <Score label="个人兴趣匹配" value={topic.feasibility.personalInterestFit} />
            </div>
            <InfoLine label="检索关键词" items={topic.nextKeywords} />
            <InfoLine label="主要风险" items={topic.mainRisks} />
            {topic.evidenceMatrixIds.length ? <InfoLine label="矩阵依据" items={topic.evidenceMatrixIds} /> : null}
          </Card>
        ))}
      </div>
    </GeneratorSection>
  );
}

function GeneratorSection({
  title,
  description,
  buttonLabel,
  disabled,
  loading,
  error,
  onGenerate,
  onClear,
  clearLabel,
  empty,
  emptyText,
  children
}: {
  title: string;
  description: string;
  buttonLabel: string;
  disabled: boolean;
  loading: boolean;
  error: string;
  onGenerate: () => void;
  onClear?: () => void;
  clearLabel?: string;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/62">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onClear && clearLabel && !empty ? (
              <Button variant="secondary" disabled={loading} onClick={onClear}>
                {clearLabel}
              </Button>
            ) : null}
            <Button disabled={disabled || loading} onClick={onGenerate}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {buttonLabel}
            </Button>
          </div>
        </div>
        {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      </Card>
      {empty ? <EmptyState title="等待生成" text={emptyText} /> : children}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="grid min-h-56 place-items-center p-8 text-center">
      <div>
        <SearchCheck className="mx-auto h-8 w-8 text-moss" />
        <h3 className="mt-3 font-bold">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink/58">{text}</p>
      </div>
    </Card>
  );
}

function ChipRow({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </div>
  );
}

function InfoLine({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      <div className="text-xs font-semibold text-ink/50">{label}</div>
      <ChipRow items={items} />
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  const score = clampScore(value);
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-ink/60">{label}</span>
        <span className="font-bold text-ink">{score}</span>
      </div>
      <Progress value={score} />
    </div>
  );
}

function EvidenceSeeds({ ids, seedMap }: { ids: string[]; seedMap: Map<string, SeedCard> }) {
  if (!ids.length) {
    return <p className="mt-3 text-sm text-clay">证据不足：尚未绑定种子卡。</p>;
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {ids.map((id) => {
        const card = seedMap.get(id);
        return (
          <Badge key={id} className="bg-white">
            {card ? `${card.inputType}：${card.summary.slice(0, 14)}` : id}
          </Badge>
        );
      })}
    </div>
  );
}
