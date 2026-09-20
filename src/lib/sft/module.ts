/**
 * A Science for Technology topic as Learn / Solve / Practice. Pure data plus
 * functions; the UI renders any topic without knowing which lesson it is in.
 */

import type { MathNode } from "@/lib/math/ast";
import type { PracticeCategory, QuestionGenerator } from "@/lib/book/practice";
import type { SftRegistry } from "./engine";
import type { SftOutcome, SftQuantity, SftSolution, SftSolveMode } from "./types";

/** A way of solving offered in the Solve tab. */
export type SftMode =
  /** The dependency-aware formula engine. */
  | { kind: "formula"; mode: SftSolveMode }
  /** 2.1 — value + "from" unit + "to" unit, using only the supplied relationships. */
  | {
      kind: "converter";
      id: string;
      titleSi: string;
      titleEn: string;
      descriptionSi: string;
      /** Units offered, grouped as the lesson groups them (දිග, ස්කන්ධය, …). */
      unitGroups: readonly { groupSi: string; units: readonly string[] }[];
      convert: (rawValue: string, from: string, to: string) => SftOutcome;
    }
  /** 2.8 — මිනුම = ලබාගත් අගය ± දෝෂය, whose answer is a value with its error. */
  | {
      kind: "plusMinus";
      id: string;
      titleSi: string;
      titleEn: string;
      descriptionSi: string;
      fields: string[];
      solve: (raw: Readonly<Record<string, string>>) => SftOutcome;
    };

export const modeId = (m: SftMode): string => (m.kind === "formula" ? m.mode.id : m.id);
export const modeTitleSi = (m: SftMode): string => (m.kind === "formula" ? m.mode.titleSi : m.titleSi);
export const modeTitleEn = (m: SftMode): string => (m.kind === "formula" ? m.mode.titleEn : m.titleEn);
export const modeDescriptionSi = (m: SftMode): string =>
  m.kind === "formula" ? m.mode.descriptionSi : m.descriptionSi;

/** One "read this first" block in the Learn tab. */
export interface SftLearnTopic {
  titleSi: string;
  paragraphs: string[];
  equations: MathNode[];
  bullets: string[];
}

/** A supplied formula, shown exactly as the lesson writes it. */
export interface SftLearnFormula {
  titleSi: string;
  equation: MathNode;
  meaningSi?: string;
  /** Kept for methods that must never be merged (ක්‍රමය 01 / ක්‍රමය 02). */
  noteSi?: string;
}

/** A worked example solved live by the engine — never stored text. */
export interface SftWorkedExample {
  titleSi: string;
  questionSi: string;
  solve: () => SftOutcome;
}

export interface SftLearnContent {
  introSi: string[];
  formulas: SftLearnFormula[];
  /** Meaning of every quantity used, in the lesson's own words. */
  quantities: SftQuantity[];
  topics: SftLearnTopic[];
  examples: SftWorkedExample[];
  notes: string[];
}

export interface SftTopicModule {
  /** URL segment, e.g. "vernier-caliper". */
  id: string;
  /** Syllabus section, e.g. "2.3". */
  section: string;
  titleSi: string;
  titleEn: string;
  subtitleSi: string;
  /** Formula preview on the lesson page. */
  preview: MathNode;
  registry: SftRegistry;
  learn: SftLearnContent;
  modes: SftMode[];
  /** Omitted while a section has no question generator — the Practice tab is then hidden. */
  practiceCategories?: PracticeCategory[];
  createGenerator?: () => QuestionGenerator<SftSolution>;
}
