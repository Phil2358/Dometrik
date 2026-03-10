import { ProjectInput } from "../types"

export function calculateStructureCost(input: ProjectInput) {

  const effectiveArea =
    input.livingArea +
    input.terraceArea * 0.5 +
    input.basementArea * 0.5

  const structureCost =
    effectiveArea *
    input.baseCostPerM2 *
    input.locationFactor

  return structureCost
}