import { CONTINGENCY_PERCENTAGES } from "../../constants/construction"

interface ContingencyCostsInput {
  constructionSubtotal: number
  qualityId: string
  manualContingencyPercent?: number | null
  manualContingencyCost?: number | null
}

export function calculateContingencyCosts(input: ContingencyCostsInput) {
  const recommendedPercent = CONTINGENCY_PERCENTAGES[input.qualityId] ?? 0.10
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
