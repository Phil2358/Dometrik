import { ProjectInput } from "../types"

export function calculatePermitFees(input: ProjectInput) {

  const effectiveArea =
    input.livingArea +
    input.terraceArea * 0.5 +
    input.basementArea * 0.5

  let permitCost = 15000

  if (effectiveArea > 200) {
    permitCost = 20000
  }

  return permitCost
}