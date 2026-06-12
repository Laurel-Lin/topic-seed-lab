"use client";

import { useEffect, useMemo, useState } from "react";
import { exampleSeedCards } from "@/lib/mock";
import type {
  AppState,
  DivergentIdea,
  DirectionCluster,
  MatrixEntry,
  ResearchOpportunity,
  SeedCard,
  Stage,
  TopicCandidate
} from "@/lib/types";

const STORAGE_KEY = "topic-seed-lab-state-v2";

export const defaultState: AppState = {
  stage: "no_direction",
  roughDirection: "",
  cards: [],
  ideas: [],
  directions: [],
  matrix: [],
  opportunities: [],
  topics: [],
  hasNewMaterialSinceAnalysis: false
};

export function useSeedStore() {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const actions = useMemo(
    () => ({
      setStage(stage: Stage) {
        setState((current) => ({
          ...current,
          stage,
          roughDirection: stage === "no_direction" ? "" : current.roughDirection
        }));
      },
      setRoughDirection(roughDirection: string) {
        setState((current) => ({ ...current, roughDirection }));
      },
      importState(nextState: AppState) {
        setState({ ...defaultState, ...nextState });
      },
      addCard(card: SeedCard) {
        setState((current) => ({
          ...current,
          cards: [card, ...current.cards],
          hasNewMaterialSinceAnalysis:
            current.directions.length > 0 ||
            current.matrix.length > 0 ||
            current.opportunities.length > 0 ||
            current.topics.length > 0
        }));
      },
      updateCard(card: SeedCard) {
        setState((current) => ({
          ...current,
          cards: current.cards.map((item) => (item.id === card.id ? card : item)),
          hasNewMaterialSinceAnalysis: true
        }));
      },
      setIdeas(ideas: DivergentIdea[]) {
        setState((current) => ({ ...current, ideas }));
      },
      addIdeas(ideas: DivergentIdea[]) {
        setState((current) => ({ ...current, ideas: [...ideas, ...current.ideas] }));
      },
      updateIdea(idea: DivergentIdea) {
        setState((current) => ({
          ...current,
          ideas: current.ideas.map((item) => (item.id === idea.id ? idea : item)),
          hasNewMaterialSinceAnalysis: idea.status === "感兴趣" ? true : current.hasNewMaterialSinceAnalysis
        }));
      },
      deleteIdea(id: string) {
        setState((current) => ({
          ...current,
          ideas: current.ideas.filter((idea) => idea.id !== id),
          hasNewMaterialSinceAnalysis: true
        }));
      },
      deleteCard(id: string) {
        setState((current) => ({
          ...current,
          cards: current.cards.filter((card) => card.id !== id),
          directions: current.directions.map((direction) => ({
            ...direction,
            seedIds: direction.seedIds.filter((seedId) => seedId !== id)
          })),
          matrix: current.matrix.filter((entry) => entry.sourceSeedId !== id),
          opportunities: current.opportunities.map((opportunity) => ({
            ...opportunity,
            evidenceSeedIds: opportunity.evidenceSeedIds.filter((seedId) => seedId !== id)
          })),
          topics: current.topics.map((topic) => ({
            ...topic,
            evidenceSeedIds: topic.evidenceSeedIds.filter((seedId) => seedId !== id)
          })),
          hasNewMaterialSinceAnalysis: true
        }));
      },
      setDirections(directions: DirectionCluster[]) {
        setState((current) => ({ ...current, directions, hasNewMaterialSinceAnalysis: false }));
      },
      clearDirections() {
        setState((current) => ({ ...current, directions: [] }));
      },
      setMatrix(matrix: MatrixEntry[]) {
        setState((current) => ({ ...current, matrix, hasNewMaterialSinceAnalysis: false }));
      },
      setOpportunities(opportunities: ResearchOpportunity[]) {
        setState((current) => ({ ...current, opportunities, hasNewMaterialSinceAnalysis: false }));
      },
      setTopics(topics: TopicCandidate[]) {
        setState((current) => ({ ...current, topics, hasNewMaterialSinceAnalysis: false }));
      },
      loadExample() {
        setState({
          ...defaultState,
          stage: "vague_direction",
          roughDirection: "大学生使用生成式AI学习",
          cards: exampleSeedCards()
        });
      },
      reset() {
        setState(defaultState);
      }
    }),
    []
  );

  return { state, actions, hydrated };
}
