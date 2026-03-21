export interface Kg500Subgroup {
  code: string
  cost: number
  visible: boolean
  meta?: Record<string, string | number | boolean>
}

interface Kg500SubgroupsInput {
  landscapingCost: number
  landscapingArea: number
  poolCost: number
  includePool: boolean
  poolArea: number
  poolQualityId: string
  poolTypeId: string
  siteConditionId: string
}

export function calculateKg500Subgroups(input: Kg500SubgroupsInput) {
  const landscapingEarthworksCost =
    input.landscapingCost > 0 ? Math.round(input.landscapingCost * 0.20) : 0
  const landscapingSurfaceCost =
    input.landscapingCost > 0 ? Math.round(input.landscapingCost * 0.30) : 0
  const landscapingBuiltInCost =
    input.landscapingCost > 0 ? Math.round(input.landscapingCost * 0.20) : 0
  const landscapingGreenCost =
    input.landscapingCost > 0
      ? input.landscapingCost - landscapingEarthworksCost - landscapingSurfaceCost - landscapingBuiltInCost
      : 0

  const kg500Subgroups: Kg500Subgroup[] = [
    {
      code: "510",
      cost: landscapingEarthworksCost,
      visible: input.landscapingCost > 0,
      meta: {
        siteConditionId: input.siteConditionId,
        costSource: "allocated",
      },
    },
    {
      code: "530",
      cost: landscapingSurfaceCost,
      visible: input.landscapingCost > 0,
      meta: { costSource: "allocated" },
    },
    {
      code: "560",
      cost: landscapingBuiltInCost,
      visible: input.landscapingCost > 0,
      meta: { costSource: "allocated" },
    },
    {
      code: "570",
      cost: landscapingGreenCost,
      visible: input.landscapingCost > 0,
      meta: {
        landscapingArea: input.landscapingArea,
        costSource: "allocated",
      },
    },
    {
      code: "580",
      cost: input.poolCost,
      visible: input.includePool && input.poolCost > 0,
      meta: {
        poolArea: input.poolArea,
        poolQualityId: input.poolQualityId,
        poolTypeId: input.poolTypeId,
        costSource: "explicit",
      },
    },
  ]

  return {
    kg500Subgroups,
    kg500Total: kg500Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0),
  }
}
