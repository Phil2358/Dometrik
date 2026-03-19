import {
  DEFAULT_QUALITY_ID,
  type QualityId,
} from "../../constants/construction"
import type { Kg300SubgroupCosts } from "./categoryCosts"

const KG300_BASE_FLEXIBLE_SHARES: Record<QualityId, {
  subgroup330Share: number
  subgroup340Share: number
  subgroup350Share: number
  subgroup360Share: number
  subgroup390Share: number
}> = {
  economy: {
    subgroup330Share: 0.495,
    subgroup340Share: 0.243,
    subgroup350Share: 0.10,
    subgroup360Share: 0.117,
    subgroup390Share: 0.045,
  },
  midRange: {
    subgroup330Share: 0.54,
    subgroup340Share: 0.216,
    subgroup350Share: 0.10,
    subgroup360Share: 0.099,
    subgroup390Share: 0.045,
  },
  luxury: {
    subgroup330Share: 0.567,
    subgroup340Share: 0.189,
    subgroup350Share: 0.10,
    subgroup360Share: 0.099,
    subgroup390Share: 0.045,
  },
}

interface Kg300SubgroupDetailsInput {
  kg300Cost: number
  qualityId: QualityId
}

export function calculateDetailedKg300SubgroupCosts(
  input: Kg300SubgroupDetailsInput
): { kg300Total: number; kg300SubgroupCosts: Kg300SubgroupCosts } {
  const kg300Total = Math.max(0, input.kg300Cost)
  const subgroup310BaseCost = Math.round(kg300Total * 0.02)
  const subgroup320BaseCost = Math.round(kg300Total * 0.12)
  const subgroup350StructuralBaseCost = Math.round(kg300Total * 0.10)
  const flexibleKg300 = Math.max(
    0,
    kg300Total - subgroup310BaseCost - subgroup320BaseCost - subgroup350StructuralBaseCost
  )

  const flexibleShares =
    KG300_BASE_FLEXIBLE_SHARES[input.qualityId] ??
    KG300_BASE_FLEXIBLE_SHARES[DEFAULT_QUALITY_ID]

  const subgroup330Cost = Math.round(flexibleKg300 * flexibleShares.subgroup330Share)
  const subgroup340Cost = Math.round(flexibleKg300 * flexibleShares.subgroup340Share)
  const subgroup350FlexibleCost = Math.round(flexibleKg300 * flexibleShares.subgroup350Share)
  const subgroup350Cost = subgroup350StructuralBaseCost + subgroup350FlexibleCost
  const subgroup360Cost = Math.round(flexibleKg300 * flexibleShares.subgroup360Share)
  const subgroup390Cost =
    kg300Total
    - subgroup310BaseCost
    - subgroup320BaseCost
    - subgroup330Cost
    - subgroup340Cost
    - subgroup350Cost
    - subgroup360Cost

  return {
    kg300Total,
    kg300SubgroupCosts: {
      subgroup310Cost: subgroup310BaseCost,
      subgroup320Cost: subgroup320BaseCost,
      subgroup330Cost,
      subgroup340Cost,
      subgroup350Cost,
      subgroup360Cost,
      subgroup370Cost: 0,
      subgroup380Cost: 0,
      subgroup390Cost,
    },
  }
}
