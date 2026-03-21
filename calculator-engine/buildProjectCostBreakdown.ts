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
  landAcquisitionRatePercent: number
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
  bathroomRoomCountAddons: {
    kg340Cost: number
    kg350Cost: number
    kg400CategoryCostsById: {
      plumbing: number
      heating: number
      ventilation_cooling: number
      electrical: number
    }
  }
  wcRoomCountAddons: {
    kg340Cost: number
    kg350Cost: number
    kg400CategoryCostsById: {
      plumbing: number
      heating: number
      ventilation_cooling: number
      electrical: number
    }
  }
  kg400Total: number
  kg400CategoryCostsById: Record<string, number>
  kg500Subgroups: ProjectBreakdownSubgroup[]
  hvacSelections: Record<string, boolean>
  siteConditionId: string
  kg600Cost: number
  kg600SubgroupCosts: {
    subgroup610Cost: number
    subgroup620Cost: number
  }
  bedroomPackageCost: number
  areaBased610Cost: number
  kitchenFurnitureCost: number
  bathroomWcFurnishingSliceCost: number
  kg700Subgroups: ProjectBreakdownSubgroup[]
}

export function buildProjectCostBreakdown(input: BuildProjectCostBreakdownInput): ProjectBreakdownGroup[] {
  const kg500Total =
    input.kg500Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0)
  const kg700Total =
    input.kg700Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0)
  const subgroup340RoomCountAddons =
    input.bathroomRoomCountAddons.kg340Cost + input.wcRoomCountAddons.kg340Cost
  const subgroup350RoomCountAddons =
    input.bathroomRoomCountAddons.kg350Cost + input.wcRoomCountAddons.kg350Cost
  const subgroup410RoomCountAddons =
    input.bathroomRoomCountAddons.kg400CategoryCostsById.plumbing
    + input.wcRoomCountAddons.kg400CategoryCostsById.plumbing
  const subgroup420RoomCountAddons =
    input.bathroomRoomCountAddons.kg400CategoryCostsById.heating
    + input.wcRoomCountAddons.kg400CategoryCostsById.heating
  const subgroup430RoomCountAddons =
    input.bathroomRoomCountAddons.kg400CategoryCostsById.ventilation_cooling
    + input.wcRoomCountAddons.kg400CategoryCostsById.ventilation_cooling
  const subgroup440RoomCountAddons =
    input.bathroomRoomCountAddons.kg400CategoryCostsById.electrical
    + input.wcRoomCountAddons.kg400CategoryCostsById.electrical

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
            ratePercent: input.landAcquisitionRatePercent,
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
        {
          code: "340",
          cost: input.kg300SubgroupCosts.subgroup340Cost,
          visible: true,
          meta: {
            baseBeforeRoomCountAddons: input.kg300SubgroupCosts.subgroup340Cost - subgroup340RoomCountAddons,
            bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg340Cost,
            wcRoomCountAddonCost: input.wcRoomCountAddons.kg340Cost,
            roomCountAddonCost: subgroup340RoomCountAddons,
          },
        },
        {
          code: "350",
          cost: input.kg300SubgroupCosts.subgroup350Cost,
          visible: true,
          meta: {
            baseBeforeRoomCountAddons: input.kg300SubgroupCosts.subgroup350Cost - subgroup350RoomCountAddons,
            bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg350Cost,
            wcRoomCountAddonCost: input.wcRoomCountAddons.kg350Cost,
            roomCountAddonCost: subgroup350RoomCountAddons,
          },
        },
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
        {
          code: "410",
          cost: input.kg400CategoryCostsById.plumbing ?? 0,
          visible: true,
          meta: {
            baseBeforeRoomCountAddons: (input.kg400CategoryCostsById.plumbing ?? 0) - subgroup410RoomCountAddons,
            bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg400CategoryCostsById.plumbing,
            wcRoomCountAddonCost: input.wcRoomCountAddons.kg400CategoryCostsById.plumbing,
            roomCountAddonCost: subgroup410RoomCountAddons,
          },
        },
        {
          code: "420",
          cost: input.kg400CategoryCostsById.heating ?? 0,
          visible: true,
          meta: {
            baseBeforeRoomCountAddons: (input.kg400CategoryCostsById.heating ?? 0) - subgroup420RoomCountAddons,
            bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg400CategoryCostsById.heating,
            wcRoomCountAddonCost: input.wcRoomCountAddons.kg400CategoryCostsById.heating,
            roomCountAddonCost: subgroup420RoomCountAddons,
            underfloorHeating: input.hvacSelections.underfloor_heating ?? false,
            solarThermal: input.hvacSelections.solar_thermal ?? false,
          },
        },
        {
          code: "430",
          cost: input.kg400CategoryCostsById.ventilation_cooling ?? 0,
          visible: true,
          meta: {
            baseBeforeRoomCountAddons: (input.kg400CategoryCostsById.ventilation_cooling ?? 0) - subgroup430RoomCountAddons,
            bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg400CategoryCostsById.ventilation_cooling,
            wcRoomCountAddonCost: input.wcRoomCountAddons.kg400CategoryCostsById.ventilation_cooling,
            roomCountAddonCost: subgroup430RoomCountAddons,
          },
        },
        {
          code: "440",
          cost: input.kg400CategoryCostsById.electrical ?? 0,
          visible: true,
          meta: {
            baseBeforeRoomCountAddons: (input.kg400CategoryCostsById.electrical ?? 0) - subgroup440RoomCountAddons,
            bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg400CategoryCostsById.electrical,
            wcRoomCountAddonCost: input.wcRoomCountAddons.kg400CategoryCostsById.electrical,
            roomCountAddonCost: subgroup440RoomCountAddons,
            photovoltaic: input.hvacSelections.photovoltaic ?? false,
          },
        },
        { code: "450", cost: input.kg400CategoryCostsById.data_security ?? 0, visible: true },
        { code: "480", cost: input.kg400CategoryCostsById.automation ?? 0, visible: true },
      ],
    },
    {
      code: "500",
      subtotal: kg500Total,
      percentOfTotal: input.investmentTotal > 0 ? (kg500Total / input.investmentTotal) * 100 : 0,
      subgroups: input.kg500Subgroups,
    },
    {
      code: "600",
      subtotal: input.kg600Cost,
      percentOfTotal: input.investmentTotal > 0 ? (input.kg600Cost / input.investmentTotal) * 100 : 0,
      subgroups: [
        {
          code: "610",
          cost: input.kg600SubgroupCosts.subgroup610Cost,
          visible: input.kg600SubgroupCosts.subgroup610Cost > 0,
          meta: {
            bedroomPackageCost: input.bedroomPackageCost,
            areaBased610Cost: input.areaBased610Cost,
            kitchenFurnitureCost: input.kitchenFurnitureCost,
          },
        },
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
      subtotal: kg700Total,
      percentOfTotal: input.investmentTotal > 0 ? (kg700Total / input.investmentTotal) * 100 : 0,
      subgroups: input.kg700Subgroups,
    },
  ]
}
