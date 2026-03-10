import { ProjectInput } from "../types"

export function calculateSystemsCost(input: ProjectInput) {

  const effectiveArea =
    input.livingArea +
    input.terraceArea * 0.5 +
    input.basementArea * 0.5

  const systemsCostPerM2 = input.baseCostPerM2 * 0.25

  const systemsCost =
    effectiveArea * systemsCostPerM2

  return systemsCost
}