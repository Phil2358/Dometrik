import { ProjectInput } from "./types"

export function calculateProjectCost(input: ProjectInput) {

  const effectiveArea =
    input.livingArea +
    input.terraceArea * 0.5 +
    input.basementArea * 0.5

  const totalCost =
    effectiveArea *
    input.baseCostPerM2 *
    input.locationFactor

  return {
    effectiveArea,
    totalCost
  }
}