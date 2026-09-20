"use client";

import { Calculator, GraduationCap, ListChecks, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { PracticeShell } from "@/components/practice/PracticeShell";
import { getSftTopic } from "@/content/sft/lesson-02/modules";
import { cn } from "@/lib/utils";
import { SftLearnPanel } from "./SftLearnPanel";
import { SftSolutionView } from "./SftSolutionView";
import { SftSolvePanel } from "./SftSolvePanel";

type Tab = "learn" | "solve" | "practice";

const TABS: { id: Tab; en: string; si: string; icon: LucideIcon }[] = [
  { id: "learn", en: "Learn", si: "ඉගෙනුම", icon: GraduationCap },
  { id: "solve", en: "Solve", si: "විසඳන්න", icon: Calculator },
  { id: "practice", en: "Practice", si: "පුහුණුව", icon: ListChecks },
];

/**
 * Client entry point for an SFT topic. Receives only the topic id and resolves
 * the definition (which contains functions) on the client.
 */
export function SftModuleView({ topicId }: { topicId: string }) {
  const topic = getSftTopic(topicId);
  const [tab, setTab] = useState<Tab>("solve");
  if (!topic) return null;

  const practice =
    topic.practiceCategories && topic.practiceCategories.length > 0 && topic.createGenerator
      ? { categories: topic.practiceCategories, createGenerator: topic.createGenerator }
      : null;
  const tabs = practice ? TABS : TABS.filter((t) => t.id !== "practice");
  const active = tab === "practice" && !practice ? "solve" : tab;

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Learn / Solve / Practice"
        className={cn("grid gap-1 rounded-2xl border border-line bg-surface p-1", practice ? "grid-cols-3" : "grid-cols-2")}
      >
        {tabs.map(({ id, en, si, icon: Icon }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors sm:flex-row sm:gap-2",
                selected ? "bg-accent text-canvas" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{en}</span>
              <span className={cn("hidden text-xs font-medium sm:inline", selected ? "text-canvas/80" : "text-ink-subtle")}>
                · {si}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} key={active} className="animate-rise">
        {active === "learn" ? <SftLearnPanel topic={topic} /> : null}
        {active === "solve" ? <SftSolvePanel topic={topic} /> : null}
        {active === "practice" && practice ? (
          <PracticeShell
            categories={practice.categories}
            createGenerator={practice.createGenerator}
            renderSolution={(question) => <SftSolutionView solution={question.solution} />}
          />
        ) : null}
      </div>
    </div>
  );
}
