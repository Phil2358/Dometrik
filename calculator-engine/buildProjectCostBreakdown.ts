export interface ProjectBreakdownSubgroup {
  code: string
  cost: number
  visible: boolean
  meta?: Record<string, string | number | boolean>
}

export interface ProjectBreakdownGroup {
  code: string
  subtotal: number
  percentOfTotal: number
  subgroups: ProjectBreakdownSubgroup[]
}

interface BuildProjectCostBreakdownInput {
  investmentTotal: number
  landValue: number
  landAcquisitionCosts: number
  landAcquisitionCostsMode: "auto" | "manual"
  kg200Total: number
  siteExcavationCost: number
  utilityGroup220Cost: number
  utilityGroup230Cost: number
  kg300Total: number
  kg300SubgroupCosts: {
    subgroup310Cost: number
    subgroup320Cost: number
    subgroup330Cost: number
    subgroup340Cost: number
    subgroup350Cost: number
    subgroup360Cost: number
    subgroup370Cost: number
    subgroup380Cost: number
    subgroup390Cost: number
  }
  kg400Total: number
  kg400CategoryCostsById: Record<string, number>
  kg500Total: number
  landscapingCost: number
  landscapingArea: number
  poolCost: number
  includePool: boolean
  poolArea: number
  poolQualityId: string
  poolTypeId: string
  hvacSelections: Record<string, boolean>
  siteConditionId: string
  kg600Cost: number
  kg600SubgroupCosts: {
    subgroup610Cost: number
    subgroup620Cost: number
  }
  bathroomWcFurnishingSliceCost: number
  permitDesignFee: number
}

export function buildProjectCostBreakdown(input: BuildProjectCostBreakdownInput): ProjectBreakdownGroup[] {
  const landscapingEarthworksCost = input.landscapingCost > 0 ? Math.round(input.landscapingCost * 0.20) : 0
  const landscapingSurfaceCost = input.landscapingCost > 0 ? Math.round(input.landscapingCost * 0.30) : 0
  const landscapingBuiltInCost = input.landscapingCost > 0 ? Math.round(input.landscapingCost * 0.20) : 0
  const landscapingGreenCost = input.landscapingCost > 0
    ? input.landscapingCost - landscapingEarthworksCost - landscapingSurfaceCost - landscapingBuiltInCost
    : 0

  return [
    {
      code: "100",
      subtotal: input.landValue + input.landAcquisitionCosts,
      percentOfTotal: input.investmentTotal > 0 ? ((input.landValue + input.landAcquisitionCosts) / input.investmentTotal) * 100 : 0,
      subgroups: [
        { code: "110", cost: input.landValue, visible: input.landValue > 0 },
        {
          code: "120",
          cost: input.landAcquisitionCosts,
          visible: input.landAcquisitionCosts > 0 || input.landAcquisitionCostsMode === "manual",
          meta: {
            mode: input.landAcquisitionCostsMode,
            landValue: input.landValue,
          },
        },
      ],
    },
    {
      code: "200",
      subtotal: input.kg200Total,
      percentOfTotal: input.investmentTotal > 0 ? (input.kg200Total / input.investmentTotal) * 100 : 0,
      subgroups: [
        { code: "210", cost: input.siteExcavationCost, visible: true, meta: { siteConditionId: input.siteConditionId } },
        { code: "220", cost: input.utilityGroup220Cost, visible: true },
        { code: "230", cost: input.utilityGroup230Cost, visible: true },
        { code: "240", cost: 0, visible: false },
        { code: "250", cost: 0, visible: false },
      ],
    },
    {
      code: "300",
      subtotal: input.kg300Total,
      percentOfTotal: input.investmentTotal > 0 ? (input.kg300Total / input.investmentTotal) * 100 : 0,
      subgroups: [
        { code: "310", cost: input.kg300SubgroupCosts.subgroup310Cost, visible: true },
        { code: "320", cost: input.kg300SubgroupCosts.subgroup320Cost, visible: true },
        { code: "330", cost: input.kg300SubgroupCosts.subgroup330Cost, visible: true },
        { code: "340", cost: input.kg300SubgroupCosts.subgroup340Cost, visible: true },
        { code: "350", cost: input.kg300SubgroupCosts.subgroup350Cost, visible: true },
        { code: "360", cost: input.kg300SubgroupCosts.subgroup360Cost, visible: true },
        { code: "370", cost: input.kg300SubgroupCosts.subgroup370Cost, visible: input.kg300SubgroupCosts.subgroup370Cost > 0 },
        { code: "380", cost: input.kg300SubgroupCosts.subgroup380Cost, visible: input.kg300SubgroupCosts.subgroup380Cost > 0 },
        { code: "390", cost: input.kg300SubgroupCosts.subgroup390Cost, visible: true },
      ],
    },
    {
      code: "400",
      subtotal: input.kg400Total,
      percentOfTotal: input.investmentTotal > 0 ? (input.kg400Total / input.investmentTotal) * 100 : 0,
      subgroups: [
        { code: "410", cost: input.kg400CategoryCostsById.plumbing ?? 0, visible: true },
        {
          code: "420",
          cost: input.kg400CategoryCostsById.heating ?? 0,
          visible: true,
          meta: {
            underfloorHeating: input.hvacSelections.underfloor_heating ?? false,
            solarThermal: input.hvacSelections.solar_thermal ?? false,
          },
        },
        { code: "430", cost: input.kg400CategoryCostsById.ventilation_cooling ?? 0, visible: true },
        {
          code: "440",
          cost: input.kg400CategoryCostsById.electrical ?? 0,
          visible: true,
          meta: { photovoltaic: input.hvacSelections.photovoltaic ?? false },
        },
        { code: "450", cost: input.kg400CategoryCostsById.data_security ?? 0, visible: true },
        { code: "480", cost: input.kg400CategoryCostsById.automation ?? 0, visible: true },
      ],
    },
    {
      code: "500",
      subtotal: input.kg500Total,
      percentOfTotal: input.investmentTotal > 0 ? (input.kg500Total / input.investmentTotal) * 100 : 0,
      subgroups: [
        { code: "510", cost: landscapingEarthworksCost, visible: input.landscapingCost > 0, meta: { siteConditionId: input.siteConditionId } },
        { code: "530", cost: landscapingSurfaceCost, visible: input.landscapingCost > 0 },
        { code: "560", cost: landscapingBuiltInCost, visible: input.landscapingCost > 0 },
        { code: "570", cost: landscapingGreenCost, visible: input.landscapingCost > 0, meta: { landscapingArea: input.landscapingArea } },
        {
          code: "580",
          cost: input.poolCost,
          visible: input.includePool && input.poolCost > 0,
          meta: {
            poolArea: input.poolArea,
            poolQualityId: input.poolQualityId,
            poolTypeId: input.poolTypeId,
          },
        },
      ],
    },
    {
      code: "600",
      subtotal: input.kg600Cost,
      percentOfTotal: input.investmentTotal > 0 ? (input.kg600Cost / input.investmentTotal) * 100 : 0,
      subgroups: [
        { code: "610", cost: input.kg600SubgroupCosts.subgroup610Cost, visible: input.kg600SubgroupCosts.subgroup610Cost > 0 },
        {
          code: "620",
          cost: input.kg600SubgroupCosts.subgroup620Cost,
          visible: true,
          meta: { bathroomWcFurnishingSliceCost: input.bathroomWcFurnishingSliceCost },
        },
      ],
    },
    {
      code: "700",
      subtotal: input.permitDesignFee,
      percentOfTotal: input.investmentTotal > 0 ? (input.permitDesignFee / input.investmentTotal) * 100 : 0,
      subgroups: [
        { code: "710", cost: Math.round(input.permitDesignFee * 0.50), visible: true },
        { code: "720", cost: Math.round(input.permitDesignFee * 0.30), visible: true },
        {
          code: "750",
          cost: input.permitDesignFee - Math.round(input.permitDesignFee * 0.50) - Math.round(input.permitDesignFee * 0.30),
          visible: true,
        },
      ],
    },
  ]
}
