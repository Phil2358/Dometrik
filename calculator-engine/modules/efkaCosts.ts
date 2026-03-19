const EFKA_REFERENCE_COST = 19000
const EFKA_REFERENCE_AREA = 130

interface EfkaCostsInput {
  buildingArea: number
  manualCost?: number | null
}

export function calculateEfkaCosts(input: EfkaCostsInput) {
  const automaticCost = Math.round(input.buildingArea * (EFKA_REFERENCE_COST / EFKA_REFERENCE_AREA))
  const manualCost = input.manualCost ?? null

  return {
    automaticCost,
    appliedCost: manualCost ?? automaticCost,
    manualOverrideActive: manualCost !== null,
  }
}
