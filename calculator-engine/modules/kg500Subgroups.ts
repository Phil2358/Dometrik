export interface Kg500Subgroup {
  code: string
  cost: number
  visible: boolean
  meta?: Record<string, string | number | boolean>
  children?: Kg500Subgroup[]
}

const LANDSCAPING_ALLOCATION_SHARES = {
  earthworks: 0.25,
  surface: 0.35,
  externalConstructions: 0.12,
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

function createHiddenKg500ThirdLevelChildren(parentCode: string): Kg500Subgroup[] | undefined {
  switch (parentCode) {
    case "530":
      return [
        { code: "533", cost: 0, visible: false },
        { code: "534", cost: 0, visible: false },
      ]
    case "540":
      return [
        { code: "541", cost: 0, visible: false },
        { code: "543", cost: 0, visible: false },
        { code: "544", cost: 0, visible: false },
        { code: "545", cost: 0, visible: false },
      ]
    case "560":
      return [
        { code: "561", cost: 0, visible: false },
      ]
    case "570":
      return [
        { code: "573", cost: 0, visible: false },
        { code: "574", cost: 0, visible: false },
      ]
    default:
      return undefined
  }
}

function createKg500SurfaceAllocationChildren(subgroup530Cost: number): Kg500Subgroup[] {
  const squaresCourtyardsTerracesCost = Math.round(subgroup530Cost * 0.72)
  const parkingSpacesCost = subgroup530Cost - squaresCourtyardsTerracesCost

  return [
    {
      code: "533",
      cost: squaresCourtyardsTerracesCost,
      visible: subgroup530Cost > 0,
      meta: { allocationShare: 0.72, costSource: "allocated" },
    },
    {
      code: "534",
      cost: parkingSpacesCost,
      visible: subgroup530Cost > 0,
      meta: { allocationShare: 0.28, costSource: "allocated" },
    },
  ]
}

function createKg500ExternalConstructionAllocationChildren(subgroup540Cost: number): Kg500Subgroup[] {
  const enclosuresFencesCost = Math.round(subgroup540Cost * 0.32)
  const wallConstructionsCost = Math.round(subgroup540Cost * 0.36)
  const rampsStairsTerracesTiersCost = Math.round(subgroup540Cost * 0.22)
  const canopiesSheltersCost =
    subgroup540Cost
    - enclosuresFencesCost
    - wallConstructionsCost
    - rampsStairsTerracesTiersCost

  return [
    {
      code: "541",
      cost: enclosuresFencesCost,
      visible: subgroup540Cost > 0,
      meta: { allocationShare: 0.32, costSource: "allocated" },
    },
    {
      code: "543",
      cost: wallConstructionsCost,
      visible: subgroup540Cost > 0,
      meta: { allocationShare: 0.36, costSource: "allocated" },
    },
    {
      code: "544",
      cost: rampsStairsTerracesTiersCost,
      visible: subgroup540Cost > 0,
      meta: { allocationShare: 0.22, costSource: "allocated" },
    },
    {
      code: "545",
      cost: canopiesSheltersCost,
      visible: subgroup540Cost > 0,
      meta: { allocationShare: 0.10, costSource: "allocated" },
    },
  ]
}

function createKg500GeneralOutdoorInstallationAllocationChildren(subgroup560Cost: number): Kg500Subgroup[] {
  return [
    {
      code: "561",
      cost: subgroup560Cost,
      visible: subgroup560Cost > 0,
      meta: { allocationShare: 1, costSource: "allocated" },
    },
  ]
}

function createKg500PlantingAllocationChildren(subgroup570Cost: number): Kg500Subgroup[] {
  const plantingAreasCost = Math.round(subgroup570Cost * 0.58)
  const lawnAndSeededAreasCost = subgroup570Cost - plantingAreasCost

  return [
    {
      code: "573",
      cost: plantingAreasCost,
      visible: subgroup570Cost > 0,
      meta: { allocationShare: 0.58, costSource: "allocated" },
    },
    {
      code: "574",
      cost: lawnAndSeededAreasCost,
      visible: subgroup570Cost > 0,
      meta: { allocationShare: 0.42, costSource: "allocated" },
    },
  ]
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
  const landscapingExternalConstructionsCost =
    input.landscapingCost > 0
      ? Math.round(input.landscapingCost * LANDSCAPING_ALLOCATION_SHARES.externalConstructions)
      : 0
  const landscapingGreenCost =
    input.landscapingCost > 0
      ? input.landscapingCost
        - landscapingEarthworksCost
        - landscapingSurfaceCost
        - landscapingExternalConstructionsCost
        - landscapingBuiltInCost
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
      // TODO: Current default residential baseline; later rebalance via site typology, slope, and landscape style presets.
      children: createKg500SurfaceAllocationChildren(landscapingSurfaceCost),
    },
    {
      code: "540",
      cost: landscapingExternalConstructionsCost,
      visible: input.landscapingCost > 0,
      meta: {
        landscapingArea: input.landscapingArea,
        landscapingBaseRatePerSqm: input.landscapingBaseRatePerSqm,
        landscapingBaseCost: input.landscapingBaseCost,
        landscapingSiteConditionMultiplier: input.landscapingSiteConditionMultiplier,
        landscapingSiteConditionAdjustment: input.landscapingSiteConditionAdjustment,
        landscapingTotal: input.landscapingCost,
        allocationShare: LANDSCAPING_ALLOCATION_SHARES.externalConstructions,
        costSource: "allocated",
      },
      // TODO: Current default residential baseline; later rebalance via site typology, slope, and landscape style presets.
      children: createKg500ExternalConstructionAllocationChildren(landscapingExternalConstructionsCost),
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
      // TODO: Current default residential baseline; later rebalance via site typology, slope, and landscape style presets.
      children: createKg500GeneralOutdoorInstallationAllocationChildren(landscapingBuiltInCost),
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
          - LANDSCAPING_ALLOCATION_SHARES.externalConstructions
          - LANDSCAPING_ALLOCATION_SHARES.builtIn,
        costSource: "allocated",
      },
      // TODO: Current default residential baseline; later rebalance via site typology, slope, and landscape style presets.
      children: createKg500PlantingAllocationChildren(landscapingGreenCost),
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
