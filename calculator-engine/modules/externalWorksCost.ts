import { ProjectInput } from "../types"

export function calculateExternalWorksCost(input: ProjectInput) {

  const landscapingArea = input.landscapingArea ?? 0

  const landscapingCostPerM2 = 40

  const landscapingCost =
    landscapingArea * landscapingCostPerM2

  return landscapingCost
}