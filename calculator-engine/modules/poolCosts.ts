import {
  POOL_SIZE_OPTIONS,
  POOL_QUALITY_OPTIONS,
  POOL_TYPE_OPTIONS,
  POOL_TERRAIN_MULTIPLIERS,
  DEFAULT_POOL_DEPTH,
  getPoolDepthFactor,
  POOL_MINIMUM_COST
} from "../../constants/construction"

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

  const poolSizes = [...POOL_SIZE_OPTIONS]
  const poolQualities = [...POOL_QUALITY_OPTIONS]
  const poolTypes = [...POOL_TYPE_OPTIONS]

  const sizeOption =
    poolSizes.find((s: any) => s.id === input.poolSizeId) ??
    poolSizes[0]

  const poolArea =
    input.poolSizeId === "custom"
      ? (input.poolCustomArea ?? 0)
      : sizeOption.area

  const depth =
    input.poolDepth ?? DEFAULT_POOL_DEPTH

  const quality =
    poolQualities.find((q: any) => q.id === input.poolQualityId) ??
    poolQualities[0]

  const type =
    poolTypes.find((t: any) => t.id === input.poolTypeId) ??
    poolTypes[0]

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
    poolCost: Math.round(poolCost)
  }

}