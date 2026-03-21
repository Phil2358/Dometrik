import {
  POOL_SIZE_OPTIONS,
  POOL_QUALITY_OPTIONS,
  POOL_TYPE_OPTIONS,
  POOL_TERRAIN_MULTIPLIERS,
  POOL_BASE_SHELL_COST_PER_SQM,
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
      poolShellBaseRatePerSqm: POOL_BASE_SHELL_COST_PER_SQM,
      poolShellBaseCost: 0,
      poolTypeMultiplier: 1,
      poolTerrainMultiplier: 1,
      poolDepthFactor: getPoolDepthFactor(DEFAULT_POOL_DEPTH),
      poolAdjustedShellCost: 0,
      poolFinishEquipmentDeltaPerSqm: 0,
      poolFinishEquipmentCost: 0,
      poolCost: 0,
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

  const poolShellBaseCost =
    poolArea *
    POOL_BASE_SHELL_COST_PER_SQM

  const poolAdjustedShellCost =
    poolShellBaseCost *
    type.multiplier *
    terrainMultiplier *
    depthFactor

  const poolFinishEquipmentCost =
    poolArea *
    quality.finishEquipmentDeltaPerSqm

  let poolCost =
    poolAdjustedShellCost +
    poolFinishEquipmentCost

  if (poolCost < POOL_MINIMUM_COST) {
    poolCost = POOL_MINIMUM_COST
  }

  return {
    poolArea,
    poolShellBaseRatePerSqm: POOL_BASE_SHELL_COST_PER_SQM,
    poolShellBaseCost,
    poolTypeMultiplier: type.multiplier,
    poolTerrainMultiplier: terrainMultiplier,
    poolDepthFactor: depthFactor,
    poolAdjustedShellCost: Math.round(poolAdjustedShellCost),
    poolFinishEquipmentDeltaPerSqm: quality.finishEquipmentDeltaPerSqm,
    poolFinishEquipmentCost: Math.round(poolFinishEquipmentCost),
    poolCost: Math.round(poolCost)
  }

}
