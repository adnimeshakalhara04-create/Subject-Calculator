/**
 * Lesson 02 study topics: ඒකක, ව’නියර් කැලිපරය, මයික්‍රෝමීටර් ඉස්කුරුප්පු ආමානය,
 * චල අන්වීක්ෂය සහ මිනුම් දෝෂ — each with Learn, Solve and (where the lesson
 * supplies a generator) Practice.
 *
 * Nothing here restates a formula: every equation shown in Learn is built from
 * the same `SftFormula` the Solve tab uses, so the two can never drift apart.
 */

import type { SftLearnFormula, SftMode, SftTopicModule } from "@/lib/sft/module";
import { lookupQuantity } from "@/lib/sft/engine";
import { solveSft } from "@/lib/sft/engine";
import { eq, quantity, type MathNode } from "@/lib/math/ast";
import { quantityNode, type SftFormula, type SftQuantity, type SftSolveMode } from "@/lib/sft/types";
import {
  ERROR_MODES,
  MEASUREMENT_MODE,
  errorFromLeastCount,
  fractionalError,
  percentageErrorDirect,
  percentageErrorFromFractional,
  solveMeasurementWithError,
} from "./errors";
import {
  MICROMETER_MODES,
  micrometerCorrectedFromNegative,
  micrometerCorrectedFromPositive,
  micrometerLeastCount,
  micrometerNegativeZeroErrorMagnitude,
  micrometerNegativeZeroErrorSigned,
  micrometerPitch,
  micrometerPositiveZeroError,
  micrometerReading,
} from "./micrometer";
import {
  MICROSCOPE_MODES,
  objectLengthAbsolute,
  objectLengthDifference,
} from "./microscope";
import { MICROMETER_CATEGORIES, createMicrometerGenerator } from "./practice-micrometer";
import { VERNIER_CATEGORIES, createVernierGenerator } from "./practice-vernier";
import { LESSON_02_QUANTITIES, q } from "./quantities";
import { CONVERTIBLE_UNITS, UNIT_CONVERSION_MODE, convertUnit } from "./units";
import {
  VERNIER_MODES,
  correctedFromNegative,
  correctedFromPositive,
  leastCountMethod01,
  leastCountMethod02,
  negativeZeroErrorMagnitude,
  negativeZeroErrorSigned,
  positiveZeroError,
  scaleDivisionLength,
  vernierReading,
  vernierScaleDivisionLength,
} from "./vernier";

const REGISTRY = LESSON_02_QUANTITIES;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** A quantity as it appears in an equation, honouring the formula's own wording. */
const wordsOf = (formula: SftFormula) => (id: string) =>
  quantityNode(lookupQuantity(REGISTRY, id), formula.labels?.[id]);

/** The formula exactly as the lesson writes it: output = right-hand side. */
const equationOf = (formula: SftFormula): MathNode => {
  const words = wordsOf(formula);
  return eq(words(formula.output), formula.rhs(words));
};

const learnFormula = (formula: SftFormula, extra?: Omit<SftLearnFormula, "titleSi" | "equation">): SftLearnFormula => ({
  titleSi: formula.titleSi,
  equation: equationOf(formula),
  ...extra,
});

const quantities = (...ids: string[]): SftQuantity[] => ids.map((id) => q(id));

/** Every mode of a section, offered through the formula engine. */
const formulaModes = (modes: readonly SftSolveMode[]): SftMode[] =>
  modes.map((mode) => ({ kind: "formula", mode }));

/** A worked example the engine solves live — the answer is never stored text. */
const example = (
  titleSi: string,
  questionSi: string,
  mode: SftSolveMode,
  raw: Readonly<Record<string, string>>,
  target: string,
) => ({ titleSi, questionSi, solve: () => solveSft({ mode, registry: REGISTRY, raw, target }) });

const mode = (modes: readonly SftSolveMode[], id: string): SftSolveMode => {
  const found = modes.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown SFT solve mode: ${id}`);
  return found;
};

/* ------------------------------------------------------------------ */
/* 2.1 ඒකක සහ ඒකක පරිවර්තනය                                            */
/* ------------------------------------------------------------------ */

export const unitsTopic: SftTopicModule = {
  id: "units",
  section: "2.1",
  titleSi: "ඒකක සහ ඒකක පරිවර්තනය",
  titleEn: "Units and unit conversion",
  subtitleSi: "පාඩමේ දී ඇති සම්බන්ධතා පමණක් යොදාගෙන ඒකකයක් තවත් ඒකකයකට පරිවර්තනය කිරීම",
  preview: quantity("ඒකක පරිවර්තනය"),
  registry: REGISTRY,
  learn: {
    introSi: [
      "මෙම කොටසේ ඇත්තේ පාඩමේ දී ඇති මූලික සම්බන්ධතා පමණි. ඒවායින් සොයාගත හැකි පරිවර්තන පමණක් කෙරේ.",
      "අවශ්‍ය නම් සම්බන්ධතා කිහිපයක් අනුපිළිවෙලින් භාවිත වේ; එක් එක් පියවර විසඳුමේ වෙන වෙනම ලියැවේ.",
    ],
    formulas: [],
    quantities: [],
    topics: [],
    examples: [],
    notes: ["පාඩමේ නොදුන් සම්බන්ධතාවක් අවශ්‍ය පරිවර්තනයක් මෙහි නොකෙරේ."],
  },
  modes: [
    {
      kind: "converter",
      id: UNIT_CONVERSION_MODE.id,
      titleSi: UNIT_CONVERSION_MODE.titleSi,
      titleEn: UNIT_CONVERSION_MODE.titleEn,
      descriptionSi: UNIT_CONVERSION_MODE.descriptionSi,
      unitGroups: CONVERTIBLE_UNITS,
      convert: convertUnit,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 2.3 ව’නියර් කැලිපරය                                                  */
/* ------------------------------------------------------------------ */

export const vernierTopic: SftTopicModule = {
  id: "vernier-caliper",
  section: "2.3",
  titleSi: "ව’නියර් කැලිපරය",
  titleEn: "Vernier caliper",
  subtitleSi: "කුඩා මිනුම, මිනුම සහ මූලාංක දෝෂය",
  preview: equationOf(leastCountMethod01),
  registry: REGISTRY,
  learn: {
    introSi: [
      "ව’නියර් කැලිපරයක කුඩා මිනුම සෙවීමට පාඩම ක්‍රම දෙකක් දෙයි. ක්‍රම දෙක වෙන් වෙන්ව තබා ඇති අතර කිසිවිටෙක එකට එකතු නොකෙරේ.",
      "කුඩා මිනුම හමු වූ පසු, මිනුම = ප්‍රධාන පරිමාණ පාඨාංකය + (කුඩා මිනුම × සමපාතිත ව’නියර් කොටස් ගණන).",
      "මූලාංක දෝෂය ධන නම් එය අඩු කරයි; ඍණ නම් එහි ප්‍රමාණය එකතු කරයි.",
    ],
    formulas: [
      learnFormula(scaleDivisionLength, {
        meaningSi: "පරිමාණයක මුළු දිග කොටස් ගණනෙන් බෙදූ විට එක් කොටසක දිග ලැබේ.",
      }),
      learnFormula(leastCountMethod01, { noteSi: "ක්‍රමය 01" }),
      learnFormula(vernierScaleDivisionLength),
      learnFormula(leastCountMethod02, { noteSi: "ක්‍රමය 02" }),
      learnFormula(vernierReading),
      learnFormula(positiveZeroError),
      learnFormula(correctedFromPositive),
      learnFormula(negativeZeroErrorMagnitude),
      learnFormula(negativeZeroErrorSigned),
      learnFormula(correctedFromNegative),
    ],
    quantities: quantities(
      "totalScaleLength",
      "scaleDivisionCount",
      "mainScaleDivisionLength",
      "vernierScaleTotalLength",
      "vernierDivisionCount",
      "vernierScaleDivisionLength",
      "leastCount",
      "mainScaleReading",
      "coincidingVernierDivision",
      "vernierReading",
      "totalVernierDivisions",
      "obtainedReading",
      "zeroErrorPositive",
      "zeroErrorMagnitude",
      "zeroErrorNegative",
      "correctedReading",
    ),
    topics: [],
    examples: [
      example(
        "උදාහරණය 1 — කුඩා මිනුම (ක්‍රමය 01)",
        "ප්‍රධාන පරිමාණයේ 10 mm ක දිගක් කොටස් 10 කට බෙදා ඇත. ව’නියර් පරිමාණයේ කොටස් 10 ක් ඇත. කුඩා මිනුම සොයන්න.",
        mode(VERNIER_MODES, "vernier-method-01"),
        { totalScaleLength: "10", scaleDivisionCount: "10", vernierDivisionCount: "10" },
        "leastCount",
      ),
      example(
        "උදාහරණය 2 — ව’නියර් කැලිපරයක මිනුම",
        "කුඩා මිනුම 0.1 mm, ප්‍රධාන පරිමාණ පාඨාංකය 2.4 mm, සමපාතිත ව’නියර් කොටස 6 නම් මිනුම සොයන්න.",
        mode(VERNIER_MODES, "vernier-method-01"),
        { leastCount: "0.1", mainScaleReading: "2.4", coincidingVernierDivision: "6", vernierDivisionCount: "10" },
        "vernierReading",
      ),
      example(
        "උදාහරණය 3 — ඍණ මූලාංක දෝෂය",
        "කුඩා මිනුම 0.1 mm, මුළු ව’නියර් කොටස් 10, සමපාතිත කොටස 8, ලබාගත් පාඨාංකය 5.3 mm නම් නිවැරදි පාඨාංකය සොයන්න.",
        mode(VERNIER_MODES, "vernier-zero-error-negative"),
        {
          leastCount: "0.1",
          totalVernierDivisions: "10",
          coincidingVernierDivision: "8",
          obtainedReading: "5.3",
        },
        "correctedReading",
      ),
    ],
    notes: [
      "ක්‍රමය 01 සහ ක්‍රමය 02 එකම කුඩා මිනුමට යන වෙනම මාර්ග දෙකකි — එකක් තෝරා ගන්න.",
      "සමපාතිත ව’නියර් කොටස් ගණන මුළු කොටස් ගණනට වඩා වැඩි විය නොහැක.",
    ],
  },
  modes: formulaModes(VERNIER_MODES),
  practiceCategories: VERNIER_CATEGORIES,
  createGenerator: () => createVernierGenerator(),
};

/* ------------------------------------------------------------------ */
/* 2.4 මයික්‍රෝමීටර් ඉස්කුරුප්පු ආමානය                                   */
/* ------------------------------------------------------------------ */

export const micrometerTopic: SftTopicModule = {
  id: "micrometer",
  section: "2.4",
  titleSi: "මයික්‍රෝමීටර් ඉස්කුරුප්පු ආමානය",
  titleEn: "Micrometer screw gauge",
  subtitleSi: "අන්තරාලය, කුඩා මිනුම, පාඨාංකය සහ මූලාංක දෝෂය",
  preview: equationOf(micrometerLeastCount),
  registry: REGISTRY,
  learn: {
    introSi: [
      "අන්තරාලය සහ කුඩා මිනුම බෙදීම් දෙකකි — ඒවා කිසිවිටෙක එක් බෙදීමකට එකතු නොකෙරේ.",
      "අන්තරාලය = ගමන් කළ මුළු දුර ÷ වට ගණන; කුඩා මිනුම = අන්තරාලය ÷ වෘත්ත පරිමාණ කොටස් ගණන.",
      "පාඨාංකය = රේඛීය පරිමාණ පාඨාංකය + (කුඩා මිනුම × සමපාතික වෘත්ත පරිමාණ කොටස් ගණන).",
    ],
    formulas: [
      learnFormula(micrometerPitch),
      learnFormula(micrometerLeastCount),
      learnFormula(micrometerReading),
      learnFormula(micrometerPositiveZeroError),
      learnFormula(micrometerCorrectedFromPositive),
      learnFormula(micrometerNegativeZeroErrorMagnitude),
      learnFormula(micrometerNegativeZeroErrorSigned),
      learnFormula(micrometerCorrectedFromNegative),
    ],
    quantities: quantities(
      "totalDistance",
      "turnCount",
      "pitch",
      "circularDivisionCount",
      "leastCount",
      "linearScaleReading",
      "coincidingCircularDivision",
      "micrometerReading",
      "totalCircularDivisions",
      "obtainedReading",
      "zeroErrorPositive",
      "zeroErrorMagnitude",
      "zeroErrorNegative",
      "correctedReading",
    ),
    topics: [],
    examples: [
      example(
        "උදාහරණය 1 — අන්තරාලය සහ කුඩා මිනුම",
        "වට 5 කදී ඉස්කුරුප්පුව 2.5 mm ක් ගමන් කරයි. වෘත්ත පරිමාණයේ කොටස් 50 ක් ඇත. කුඩා මිනුම සොයන්න.",
        mode(MICROMETER_MODES, "micrometer-main"),
        { totalDistance: "2.5", turnCount: "5", circularDivisionCount: "50" },
        "leastCount",
      ),
      example(
        "උදාහරණය 2 — මයික්‍රෝමීටර් පාඨාංකය",
        "කුඩා මිනුම 0.01 mm, රේඛීය පරිමාණ පාඨාංකය 4.5 mm, සමපාතික වෘත්ත පරිමාණ කොටස 32 නම් පාඨාංකය සොයන්න.",
        mode(MICROMETER_MODES, "micrometer-main"),
        {
          leastCount: "0.01",
          linearScaleReading: "4.5",
          coincidingCircularDivision: "32",
          circularDivisionCount: "50",
        },
        "micrometerReading",
      ),
      example(
        "උදාහරණය 3 — ධන මූලාංක දෝෂය",
        "කුඩා මිනුම 0.01 mm, සමපාතිත වෘත්ත පරිමාණ කොටස 3, ලබාගත් පාඨාංකය 2.47 mm නම් නිවැරදි පාඨාංකය සොයන්න.",
        mode(MICROMETER_MODES, "micrometer-zero-error-positive"),
        { leastCount: "0.01", coincidingCircularDivision: "3", obtainedReading: "2.47" },
        "correctedReading",
      ),
    ],
    notes: [
      "අන්තරාලය සහ කුඩා මිනුම යනු පියවර දෙකකි — දෙකම වෙන වෙනම ලියන්න.",
      "ධන මූලාංක දෝෂය අඩු කරයි; ඍණ මූලාංක දෝෂයේ ප්‍රමාණය එකතු කරයි.",
    ],
  },
  modes: formulaModes(MICROMETER_MODES),
  practiceCategories: MICROMETER_CATEGORIES,
  createGenerator: () => createMicrometerGenerator(),
};

/* ------------------------------------------------------------------ */
/* 2.7 චල අන්වීක්ෂය                                                     */
/* ------------------------------------------------------------------ */

export const microscopeTopic: SftTopicModule = {
  id: "travelling-microscope",
  section: "2.7",
  titleSi: "චල අන්වීක්ෂය",
  titleEn: "Travelling microscope",
  subtitleSi: "පාඨාංක දෙකකින් වස්තුවේ දිග",
  preview: equationOf(objectLengthDifference),
  registry: REGISTRY,
  learn: {
    introSi: [
      "පාඩම වස්තුවේ දිග ආකාර දෙකකින් ලියයි; දෙකම තබා ඇති අතර එකට එකතු නොකෙරේ.",
      "වස්තුවේ දිග = X₂ − X₁ යනු ලකුණ සහිත වෙනසයි — පාඨාංක මාරුව ඇතුළත් කළ විට එය ඍණ වේ.",
      "දිශාව නොසලකා දිග අවශ්‍ය නම් |X₂ − X₁| ක්‍රමය තෝරන්න.",
    ],
    formulas: [learnFormula(objectLengthDifference), learnFormula(objectLengthAbsolute)],
    quantities: quantities("x1", "x2", "objectLength"),
    topics: [],
    examples: [
      example(
        "උදාහරණය — වස්තුවේ දිග",
        "X₁ = 2.35, X₂ = 5.60 නම් වස්තුවේ දිග සොයන්න.",
        mode(MICROSCOPE_MODES, "microscope-difference"),
        { x1: "2.35", x2: "5.60" },
        "objectLength",
      ),
    ],
    notes: ["X₁ සහ X₂ මාරුව ඇතුළත් කළ විට වෙනස ඍණ වේ."],
  },
  modes: formulaModes(MICROSCOPE_MODES),
};

/* ------------------------------------------------------------------ */
/* 2.8 මිනුම් උපකරණ හා දෝෂ                                              */
/* ------------------------------------------------------------------ */

export const errorsTopic: SftTopicModule = {
  id: "measurement-errors",
  section: "2.8",
  titleSi: "මිනුම් උපකරණ හා දෝෂ",
  titleEn: "Measuring instruments and errors",
  subtitleSi: "භාගික දෝෂය, ප්‍රතිශත දෝෂය සහ දෝෂය සහිත මිනුම",
  preview: equationOf(percentageErrorDirect),
  registry: REGISTRY,
  learn: {
    introSi: [
      "දෝෂය කුඩා මිනුමෙන් අඩක් වන විට දෝෂය = කුඩා මිනුම ÷ 2.",
      "ප්‍රතිශත දෝෂයට පාඩම මාර්ග දෙකක් දෙයි — භාගික දෝෂය හරහා, හෝ කෙළින්ම. දෙකම වෙන වෙනම තබා ඇත.",
      "අවසානයේ මිනුම ලියන්නේ මිනුම = ලබාගත් අගය ± දෝෂය ලෙසයි.",
    ],
    formulas: [
      learnFormula(errorFromLeastCount),
      learnFormula(fractionalError),
      learnFormula(percentageErrorFromFractional),
      learnFormula(percentageErrorDirect),
    ],
    quantities: quantities(
      "errorLeastCount",
      "errorValue",
      "measuredValue",
      "fractionalError",
      "percentageError",
      "obtainedValue",
      "measurementWithError",
    ),
    topics: [],
    examples: [
      example(
        "උදාහරණය 1 — ප්‍රතිශත දෝෂය (කෙළින්ම)",
        "කුඩා මිනුම 0.1 mm වන උපකරණයකින් 25.0 mm ක් මනිනු ලැබේ. ප්‍රතිශත දෝෂය සොයන්න.",
        mode(ERROR_MODES, "error-percentage-direct"),
        { errorLeastCount: "0.1", measuredValue: "25.0" },
        "percentageError",
      ),
      example(
        "උදාහරණය 2 — භාගික දෝෂය හරහා",
        "දෝෂය 0.05 mm, මිනුමේ අගය 20.0 mm නම් භාගික දෝෂය හා ප්‍රතිශත දෝෂය සොයන්න.",
        mode(ERROR_MODES, "error-fractional"),
        { errorValue: "0.05", measuredValue: "20.0" },
        "percentageError",
      ),
    ],
    notes: ["දෝෂය සහ මිනුමේ අගය එකම ඒකකයෙන් දිය යුතුය; ප්‍රතිශත දෝෂය පමණක් % සමඟ ලියැවේ."],
  },
  modes: [
    ...formulaModes(ERROR_MODES),
    {
      kind: "plusMinus",
      id: MEASUREMENT_MODE.id,
      titleSi: MEASUREMENT_MODE.titleSi,
      titleEn: MEASUREMENT_MODE.titleEn,
      descriptionSi: MEASUREMENT_MODE.descriptionSi,
      fields: MEASUREMENT_MODE.fields,
      solve: solveMeasurementWithError,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

export const LESSON_02_TOPICS: readonly SftTopicModule[] = [
  unitsTopic,
  vernierTopic,
  micrometerTopic,
  microscopeTopic,
  errorsTopic,
];

export const getSftTopic = (id: string): SftTopicModule | undefined =>
  LESSON_02_TOPICS.find((topic) => topic.id === id);
