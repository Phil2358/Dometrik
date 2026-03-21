export interface Kg500Subgroup {
  code: string
  cost: number
  visible: boolean
  meta?: Record<string, string | number | boolean>
}

const LANDSCAPING_ALLOCATION_SHARES = {
  earthworks: 0.25,
  surface: 0.35,
  builtIn: 0.10,
} as const

interface Kg500SubgroupsInput {
  landscapingCost: number
  landscapingArea: number
  landscapingBaseRatePerSqm: number
  landscapingBaseCost: number
  landscapingSiteConditionMultiplier: number
  landscapingSiteConditionAdjustment: number
  poolCost: number
  includePool: boolean
  poolArea: number
  poolQualityId: string
  poolTypeId: string
  siteConditionId: string
}

function getPoolAllocationShares(input: Pick<Kg500SubgroupsInput, "poolQualityId" | "poolTypeId">) {
  if (input.poolQualityId === "enhanced" && input.poolTypeId === "infinity") {
    return { subgroup548Share: 0.72, subgroup550Share: 0.28 }
  }

  if (input.poolQualityId === "enhanced") {
    return { subgroup548Share: 0.74, subgroup550Share: 0.26 }
  }

  if (input.poolTypeId === "infinity") {
    return { subgroup548Share: 0.78, subgroup550Share: 0.22 }
  }

  return { subgroup548Share: 0.80, subgroup550Share: 0.20 }
}

export function calculateKg500Subgroups(input: Kg500SubgroupsInput) {
  const landscapingEarthworksCost =
    input.landscapingCost > 0
      ? Math.round(input.landscapingCost * LANDSCAPING_ALLOCATION_SHARES.earthworks)
      : 0
  const landscapingSurfaceCost =
    input.landscapingCost > 0
      ? Math.round(input.landscapingCost * LANDSCAPING_ALLOCATION_SHARES.surface)
      : 0
  const landscapingBuiltInCost =
    input.landscapingCost > 0
      ? Math.round(input.landscapingCost * LANDSCAPING_ALLOCATION_SHARES.builtIn)
      : 0
  const landscapingGreenCost =
    input.landscapingCost > 0
      ? input.landscapingCost - landscapingEarthworksCost - landscapingSurfaceCost - landscapingBuiltInCost
      : 0
  const { subgroup548Share, subgroup550Share } = getPoolAllocationShares(input)
  const poolStructuralCost =
    input.poolCost > 0 ? Math.round(input.poolCost * subgroup548Share) : 0
  const poolTechnicalCost =
    input.poolCost > 0 ? input.poolCost - poolStructuralCost : 0

  const kg500Subgroups: Kg500Subgroup[] = [
    {
      code: "510",
      cost: landscapingEarthworksCost,
      visible: input.landscapingCost > 0,
      meta: {
        siteConditionId: input.siteConditionId,
        landscapingArea: input.landscapingArea,
        landscapingBaseRatePerSqm: input.landscapingBaseRatePerSqm,
        landscapingBaseCost: input.landscapingBaseCost,
        landscapingSiteConditionMultiplier: input.landscapingSiteConditionMultiplier,
        landscapingSiteConditionAdjustment: input.landscapingSiteConditionAdjustment,
        landscapingTotal: input.landscapingCost,
        allocationShare: LANDSCAPING_ALLOCATION_SHARES.earthworks,
        costSource: "allocated",
      },
    },
    {
      code: "530",
      cost: landscapingSurfaceCost,
      visible: input.landscapingCost > 0,
      meta: {
        landscapingArea: input.landscapingArea,
        landscapingBaseRatePerSqm: input.landscapingBaseRatePerSqm,
        landscapingBaseCost: input.landscapingBaseCost,
        landscapingSiteConditionMultiplier: input.landscapingSiteConditionMultiplier,
        landscapingSiteConditionAdjustment: input.landscapingSiteConditionAdjustment,
        landscapingTotal: input.landscapingCost,
        allocationShare: LANDSCAPING_ALLOCATION_SHARES.surface,
        costSource: "allocated",
      },
    },
    {
      code: "560",
      cost: landscapingBuiltInCost,
      visible: input.landscapingCost > 0,
      meta: {
        landscapingArea: input.landscapingArea,
        landscapingBaseRatePerSqm: input.landscapingBaseRatePerSqm,
        landscapingBaseCost: input.landscapingBaseCost,
        landscapingSiteConditionMultiplier: input.landscapingSiteConditionMultiplier,
        landscapingSiteConditionAdjustment: input.landscapingSiteConditionAdjustment,
        landscapingTotal: input.landscapingCost,
        allocationShare: LANDSCAPING_ALLOCATION_SHARES.builtIn,
        costSource: "allocated",
      },
    },
    {
      code: "570",
      cost: landscapingGreenCost,
      visible: input.landscapingCost > 0,
      meta: {
        landscapingArea: input.landscapingArea,
        landscapingBaseRatePerSqm: input.landscapingBaseRatePerSqm,
        landscapingBaseCost: input.landscapingBaseCost,
        landscapingSiteConditionMultiplier: input.landscapingSiteConditionMultiplier,
        landscapingSiteConditionAdjustment: input.landscapingSiteConditionAdjustment,
        landscapingTotal: input.landscapingCost,
        allocationShare:
          1
          - LANDSCAPING_ALLOCATION_SHARES.earthworks
          - LANDSCAPING_ALLOCATION_SHARES.surface
          - LANDSCAPING_ALLOCATION_SHARES.builtIn,
        costSource: "allocated",
      },
    },
    {
      code: "548",
      cost: poolStructuralCost,
      visible: input.includePool && input.poolCost > 0,
      meta: {
        poolArea: input.poolArea,
        poolQualityId: input.poolQualityId,
        poolTypeId: input.poolTypeId,
        allocationShare: subgroup548Share,
        allocationRole: "structural",
        costSource: "allocated",
      },
    },
    {
      code: "550",
      cost: poolTechnicalCost,
      visible: input.includePool && input.poolCost > 0,
      meta: {
        poolArea: input.poolArea,
        poolQualityId: input.poolQualityId,
        poolTypeId: input.poolTypeId,
        allocationShare: subgroup550Share,
        allocationRole: "technical",
        costSource: "allocated",
      },
    },
  ]

  return {
    kg500Subgroups,
    kg500Total: kg500Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0),
  }
}
