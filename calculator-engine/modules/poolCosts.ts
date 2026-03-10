import {
  POOL_SIZE_OPTIONS,
  POOL_QUALITY_OPTIONS,
  POOL_TYPE_OPTIONS,
  POOL_TERRAIN_MULTIPLIERS,
  DEFAULT_POOL_DEPTH,
  getPoolDepthFactor,
  POOL_MINIMUM_COST
} from "@/constants/construction"

interface PoolCostsInput {
  includePool: boolean

  poolSizeId: string
  poolCustomArea?: number | null

  poolDepth?: number | null

  poolQualityId: string
  poolTypeId: string

  siteConditionId: string
}

export function calculatePoolCosts(input: PoolCostsInput) {

  if (!input.includePool) {
    return {
      poolArea: 0,
      poolCost: 0
    }
  }

  const sizeOption =
    POOL_SIZE_OPTIONS.find(s => s.id === input.poolSizeId)
    ?? POOL_SIZE_OPTIONS[0]

  const poolArea =
    input.poolSizeId === "custom"
      ? (input.poolCustomArea ?? 0)
      : sizeOption.area

  const depth =
    input.poolDepth ?? DEFAULT_POOL_DEPTH

  const quality =
    POOL_QUALITY_OPTIONS.find(q => q.id === input.poolQualityId)
    ?? POOL_QUALITY_OPTIONS[0]

  const type =
    POOL_TYPE_OPTIONS.find(t => t.id === input.poolTypeId)
    ?? POOL_TYPE_OPTIONS[0]

  const terrainMultiplier =
    POOL_TERRAIN_MULTIPLIERS[input.siteConditionId] ?? 1

  const depthFactor =
    getPoolDepthFactor(depth)

  let poolCost =
    poolArea *
    quality.baseCostPerSqm *
    type.multiplier *
    terrainMultiplier *
    depthFactor

  if (poolCost < POOL_MINIMUM_COST) {
    poolCost = POOL_MINIMUM_COST
  }

  return {
    poolArea,
    poolCost
  }
}