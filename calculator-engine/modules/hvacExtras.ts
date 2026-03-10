import { HVAC_OPTIONS } from "../../constants/construction"

interface HvacExtrasInput {
  effectiveArea: number
  hvacSelections: Record<string, boolean>
}

export function calculateHvacExtras(input: HvacExtrasInput) {

  let totalHvacCost = 0

  for (const option of HVAC_OPTIONS) {

    if (input.hvacSelections[option.id]) {

      const optionCost =
        input.effectiveArea * option.costPerSqm

      totalHvacCost += optionCost

    }

  }

  return {
    hvacExtrasCost: Math.round(totalHvacCost)
  }

}