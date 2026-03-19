import {
  CONTINGENCY_PERCENTAGES,
  DEFAULT_QUALITY_ID,
  type QualityId,
} from "../../constants/construction"

interface ContingencyCostsInput {
  constructionSubtotal: number
  qualityId: QualityId
  manualContingencyPercent?: number | null
  manualContingencyCost?: number | null
}

export function calculateContingencyCosts(input: ContingencyCostsInput) {
  const recommendedPercent =
    CONTINGENCY_PERCENTAGES[input.qualityId] ??
    CONTINGENCY_PERCENTAGES[DEFAULT_QUALITY_ID]
  const manualPercent = input.manualContingencyPercent ?? null
  const manualCost = input.manualContingencyCost ?? null

  const appliedPercent =
    manualPercent !== null
      ? manualPercent / 100
      : (
        manualCost !== null && input.constructionSubtotal > 0
          ? manualCost / input.constructionSubtotal
          : recommendedPercent
      )

  return {
    recommendedPercent,
    recommendedCost: Math.round(input.constructionSubtotal * recommendedPercent),
    appliedPercent,
    appliedPercentValue: appliedPercent * 100,
    contingencyCost: Math.round(input.constructionSubtotal * appliedPercent),
    manualOverrideActive: manualPercent !== null || manualCost !== null,
  }
}
