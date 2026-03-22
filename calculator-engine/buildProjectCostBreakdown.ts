export interface ProjectBreakdownSubgroup {
  code: string
  cost: number
  visible: boolean
  meta?: Record<string, string | number | boolean>
  children?: ProjectBreakdownSubgroup[]
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
  kg450BaselineEssentialCost: number
  kg450UpgradeCost: number
  kg500Subgroups: ProjectBreakdownSubgroup[]
  hvacSelections: Record<string, boolean>
  siteConditionId: string
  kg600Cost: number
  kg600SubgroupCosts: {
    subgroup610Cost: number
    subgroup620Cost: number
  }
  kg620BaselineWardrobeCost: number
  kg620WardrobeDeltaCost: number
  kg620WardrobeTotal: number
  bedroomPackageCost: number
  areaBased610Cost: number
  kitchenFurnitureCost: number
  bathroomWcFurnishingSliceCost: number
  kg700Subgroups: ProjectBreakdownSubgroup[]
}

function createHiddenKg300ThirdLevelChildren(parentCode: string): ProjectBreakdownSubgroup[] | undefined {
  switch (parentCode) {
    case "330":
      return [
        { code: "331", cost: 0, visible: false },
        { code: "332", cost: 0, visible: false },
        { code: "333", cost: 0, visible: false },
        { code: "334", cost: 0, visible: false },
        { code: "335", cost: 0, visible: false },
        { code: "336", cost: 0, visible: false },
      ]
    case "340":
      return [
        { code: "341", cost: 0, visible: false },
        { code: "342", cost: 0, visible: false },
        { code: "343", cost: 0, visible: false },
        { code: "344", cost: 0, visible: false },
        { code: "345", cost: 0, visible: false },
      ]
    case "350":
      return [
        { code: "351", cost: 0, visible: false },
        { code: "353", cost: 0, visible: false },
        { code: "354", cost: 0, visible: false },
      ]
    case "360":
      return [
        { code: "361", cost: 0, visible: false },
        { code: "363", cost: 0, visible: false },
      ]
    default:
      return undefined
  }
}

function createKg300ExternalWallAllocationChildren(subgroup330Cost: number): ProjectBreakdownSubgroup[] {
  const loadBearingExternalWallsCost = Math.round(subgroup330Cost * 0.14)
  const nonLoadBearingExternalWallsCost = Math.round(subgroup330Cost * 0.08)
  const externalColumnsCost = Math.round(subgroup330Cost * 0.04)
  const externalWallOpeningsCost = Math.round(subgroup330Cost * 0.42)
  const externalWallCladdingsExternalSideCost = Math.round(subgroup330Cost * 0.20)
  const externalWallCladdingsInternalSideCost =
    subgroup330Cost
    - loadBearingExternalWallsCost
    - nonLoadBearingExternalWallsCost
    - externalColumnsCost
    - externalWallOpeningsCost
    - externalWallCladdingsExternalSideCost

  return [
    {
      code: "331",
      cost: loadBearingExternalWallsCost,
      visible: true,
      meta: { allocationShare: 0.14, costSource: "allocated" },
    },
    {
      code: "332",
      cost: nonLoadBearingExternalWallsCost,
      visible: true,
      meta: { allocationShare: 0.08, costSource: "allocated" },
    },
    {
      code: "333",
      cost: externalColumnsCost,
      visible: true,
      meta: { allocationShare: 0.04, costSource: "allocated" },
    },
    {
      code: "334",
      cost: externalWallOpeningsCost,
      visible: true,
      meta: { allocationShare: 0.42, costSource: "allocated" },
    },
    {
      code: "335",
      cost: externalWallCladdingsExternalSideCost,
      visible: true,
      meta: { allocationShare: 0.20, costSource: "allocated" },
    },
    {
      code: "336",
      cost: externalWallCladdingsInternalSideCost,
      visible: true,
      meta: { allocationShare: 0.12, costSource: "allocated" },
    },
  ]
}

function createKg300InternalWallAllocationChildren(subgroup340Cost: number): ProjectBreakdownSubgroup[] {
  const loadBearingInternalWallsCost = Math.round(subgroup340Cost * 0.18)
  const nonLoadBearingInternalWallsCost = Math.round(subgroup340Cost * 0.22)
  const internalColumnsCost = Math.round(subgroup340Cost * 0.06)
  const internalWallOpeningsCost = Math.round(subgroup340Cost * 0.14)
  const internalWallCladdingsCost =
    subgroup340Cost
    - loadBearingInternalWallsCost
    - nonLoadBearingInternalWallsCost
    - internalColumnsCost
    - internalWallOpeningsCost

  return [
    {
      code: "341",
      cost: loadBearingInternalWallsCost,
      visible: true,
      meta: { allocationShare: 0.18, costSource: "allocated" },
    },
    {
      code: "342",
      cost: nonLoadBearingInternalWallsCost,
      visible: true,
      meta: { allocationShare: 0.22, costSource: "allocated" },
    },
    {
      code: "343",
      cost: internalColumnsCost,
      visible: true,
      meta: { allocationShare: 0.06, costSource: "allocated" },
    },
    {
      code: "344",
      cost: internalWallOpeningsCost,
      visible: true,
      meta: { allocationShare: 0.14, costSource: "allocated" },
    },
    {
      code: "345",
      cost: internalWallCladdingsCost,
      visible: true,
      meta: { allocationShare: 0.40, costSource: "allocated" },
    },
  ]
}

function createKg300FloorAllocationChildren(subgroup350Cost: number): ProjectBreakdownSubgroup[] {
  const slabFloorStructuresCost = Math.round(subgroup350Cost * 0.58)
  const floorFinishesCost = Math.round(subgroup350Cost * 0.27)
  const ceilingFinishesCost =
    subgroup350Cost
    - slabFloorStructuresCost
    - floorFinishesCost

  return [
    {
      code: "351",
      cost: slabFloorStructuresCost,
      visible: true,
      meta: { allocationShare: 0.58, costSource: "allocated" },
    },
    {
      code: "353",
      cost: floorFinishesCost,
      visible: true,
      meta: { allocationShare: 0.27, costSource: "allocated" },
    },
    {
      code: "354",
      cost: ceilingFinishesCost,
      visible: true,
      meta: { allocationShare: 0.15, costSource: "allocated" },
    },
  ]
}

function createKg300RoofAllocationChildren(subgroup360Cost: number): ProjectBreakdownSubgroup[] {
  const roofStructuresCost = Math.round(subgroup360Cost * 0.46)
  const roofCoveringsCost = subgroup360Cost - roofStructuresCost

  return [
    {
      code: "361",
      cost: roofStructuresCost,
      visible: true,
      meta: { allocationShare: 0.46, costSource: "allocated" },
    },
    {
      code: "363",
      cost: roofCoveringsCost,
      visible: true,
      meta: { allocationShare: 0.54, costSource: "allocated" },
    },
  ]
}

function createKg400WastewaterWaterAllocationChildren(subgroup410Cost: number): ProjectBreakdownSubgroup[] {
  const wastewaterSystemsCost = Math.round(subgroup410Cost * 0.34)
  const waterSystemsCost = subgroup410Cost - wastewaterSystemsCost

  return [
    {
      code: "411",
      cost: wastewaterSystemsCost,
      visible: true,
      meta: { allocationShare: 0.34, costSource: "allocated" },
    },
    {
      code: "412",
      cost: waterSystemsCost,
      visible: true,
      meta: { allocationShare: 0.66, costSource: "allocated" },
    },
  ]
}

function createKg400HeatSupplyAllocationChildren(subgroup420Cost: number): ProjectBreakdownSubgroup[] {
  const heatGenerationSystemsCost = Math.round(subgroup420Cost * 0.33)
  const heatDistributionNetworksCost = Math.round(subgroup420Cost * 0.22)
  const roomHeatingSurfacesCost =
    subgroup420Cost - heatGenerationSystemsCost - heatDistributionNetworksCost

  return [
    {
      code: "421",
      cost: heatGenerationSystemsCost,
      visible: true,
      meta: { allocationShare: 0.33, costSource: "allocated" },
    },
    {
      code: "422",
      cost: heatDistributionNetworksCost,
      visible: true,
      meta: { allocationShare: 0.22, costSource: "allocated" },
    },
    {
      code: "423",
      cost: roomHeatingSurfacesCost,
      visible: true,
      meta: { allocationShare: 0.45, costSource: "allocated" },
    },
  ]
}

function createKg400ElectricalAllocationChildren(subgroup440Cost: number): ProjectBreakdownSubgroup[] {
  const selfGeneratedPowerSupplySystemsCost = Math.round(subgroup440Cost * 0.08)
  const lowVoltageInstallationSystemsCost = subgroup440Cost - selfGeneratedPowerSupplySystemsCost

  return [
    {
      code: "442",
      cost: selfGeneratedPowerSupplySystemsCost,
      visible: true,
      meta: { allocationShare: 0.08, costSource: "allocated" },
    },
    {
      code: "444",
      cost: lowVoltageInstallationSystemsCost,
      visible: true,
      meta: { allocationShare: 0.92, costSource: "allocated" },
    },
  ]
}

function createKg400CommunicationAllocationChildren(subgroup450Cost: number): ProjectBreakdownSubgroup[] {
  const telecommunicationsSystemsCost = Math.round(subgroup450Cost * 0.20)
  const audiovisualMediaAndAntennaSystemsCost = Math.round(subgroup450Cost * 0.10)
  const hazardDetectionAndAlarmSystemsCost = Math.round(subgroup450Cost * 0.28)
  const dataTransmissionNetworksCost =
    subgroup450Cost
    - telecommunicationsSystemsCost
    - audiovisualMediaAndAntennaSystemsCost
    - hazardDetectionAndAlarmSystemsCost

  return [
    {
      code: "451",
      cost: telecommunicationsSystemsCost,
      visible: true,
      meta: { allocationShare: 0.20, costSource: "allocated" },
    },
    {
      code: "455",
      cost: audiovisualMediaAndAntennaSystemsCost,
      visible: true,
      meta: { allocationShare: 0.10, costSource: "allocated" },
    },
    {
      code: "456",
      cost: hazardDetectionAndAlarmSystemsCost,
      visible: true,
      meta: { allocationShare: 0.28, costSource: "allocated" },
    },
    {
      code: "457",
      cost: dataTransmissionNetworksCost,
      visible: true,
      meta: { allocationShare: 0.42, costSource: "allocated" },
    },
  ]
}

function createKg400AutomationAllocationChildren(subgroup480Cost: number): ProjectBreakdownSubgroup[] {
  const automationDevicesCost = Math.round(subgroup480Cost * 0.30)
  const controlCabinetsAndAutomationCentersCost = Math.round(subgroup480Cost * 0.14)
  const automationManagementCost = Math.round(subgroup480Cost * 0.12)
  const cablesLinesAndInstallationSystemsCost = Math.round(subgroup480Cost * 0.28)
  const dataTransmissionNetworksCost =
    subgroup480Cost
    - automationDevicesCost
    - controlCabinetsAndAutomationCentersCost
    - automationManagementCost
    - cablesLinesAndInstallationSystemsCost

  return [
    {
      code: "481",
      cost: automationDevicesCost,
      visible: true,
      meta: { allocationShare: 0.30, costSource: "allocated" },
    },
    {
      code: "482",
      cost: controlCabinetsAndAutomationCentersCost,
      visible: true,
      meta: { allocationShare: 0.14, costSource: "allocated" },
    },
    {
      code: "483",
      cost: automationManagementCost,
      visible: true,
      meta: { allocationShare: 0.12, costSource: "allocated" },
    },
    {
      code: "484",
      cost: cablesLinesAndInstallationSystemsCost,
      visible: true,
      meta: { allocationShare: 0.28, costSource: "allocated" },
    },
    {
      code: "485",
      cost: dataTransmissionNetworksCost,
      visible: true,
      meta: { allocationShare: 0.16, costSource: "allocated" },
    },
  ]
}

function createHiddenKg400ThirdLevelChildren(parentCode: string): ProjectBreakdownSubgroup[] | undefined {
  switch (parentCode) {
    case "410":
      return [
        { code: "411", cost: 0, visible: false },
        { code: "412", cost: 0, visible: false },
      ]
    case "420":
      return [
        { code: "421", cost: 0, visible: false },
        { code: "422", cost: 0, visible: false },
        { code: "423", cost: 0, visible: false },
      ]
    case "430":
      return [
        { code: "433", cost: 0, visible: false },
      ]
    case "440":
      return [
        { code: "442", cost: 0, visible: false },
        { code: "444", cost: 0, visible: false },
      ]
    case "450":
      return [
        { code: "451", cost: 0, visible: false },
        { code: "455", cost: 0, visible: false },
        { code: "456", cost: 0, visible: false },
        { code: "457", cost: 0, visible: false },
      ]
    case "480":
      return [
        { code: "481", cost: 0, visible: false },
        { code: "482", cost: 0, visible: false },
        { code: "483", cost: 0, visible: false },
        { code: "484", cost: 0, visible: false },
        { code: "485", cost: 0, visible: false },
      ]
    default:
      return undefined
  }
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
        {
          code: "330",
          cost: input.kg300SubgroupCosts.subgroup330Cost,
          visible: true,
          // TODO: Current default residential baseline; later rebalance via facade/structural system presets.
          children: createKg300ExternalWallAllocationChildren(input.kg300SubgroupCosts.subgroup330Cost),
        },
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
          // TODO: Current default residential baseline; later rebalance via structural system, roof type, and finish complexity presets.
          children: createKg300InternalWallAllocationChildren(input.kg300SubgroupCosts.subgroup340Cost),
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
          // TODO: Current default residential baseline; later rebalance via structural system, roof type, and finish complexity presets.
          children: createKg300FloorAllocationChildren(input.kg300SubgroupCosts.subgroup350Cost),
        },
        {
          code: "360",
          cost: input.kg300SubgroupCosts.subgroup360Cost,
          visible: true,
          // TODO: Current default residential baseline; later rebalance via structural system, roof type, and finish complexity presets.
          children: createKg300RoofAllocationChildren(input.kg300SubgroupCosts.subgroup360Cost),
        },
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
          // TODO: Current default residential baseline; later rebalance via system presets such as heat pump vs boiler, basic electrical vs PV/battery, and basic networking vs smart-home/security-heavy projects. Keep this split aligned with canonical parent costs to avoid double counting explicit extras and future system add-ons.
          children: createKg400WastewaterWaterAllocationChildren(input.kg400CategoryCostsById.plumbing ?? 0),
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
          // TODO: Current default residential baseline; later rebalance via system presets such as heat pump vs boiler, basic electrical vs PV/battery, and basic networking vs smart-home/security-heavy projects. Keep this split aligned with canonical parent costs to avoid double counting explicit extras and future system add-ons.
          children: createKg400HeatSupplyAllocationChildren(input.kg400CategoryCostsById.heating ?? 0),
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
          // TODO: Replace hidden placeholders with real 430 -> 433 allocation outputs.
          children: createHiddenKg400ThirdLevelChildren("430"),
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
          // TODO: Current default residential baseline; later rebalance via system presets such as heat pump vs boiler, basic electrical vs PV/battery, and basic networking vs smart-home/security-heavy projects. Keep this split aligned with canonical parent costs to avoid double counting explicit extras and future system add-ons.
          children: createKg400ElectricalAllocationChildren(input.kg400CategoryCostsById.electrical ?? 0),
        },
        {
          code: "450",
          cost: input.kg400CategoryCostsById.data_security ?? 0,
          visible: true,
          meta: {
            kg450BaselineEssentialCost: input.kg450BaselineEssentialCost,
            kg450UpgradeCost: input.kg450UpgradeCost,
          },
          // TODO: Current default residential baseline; later rebalance via system presets such as heat pump vs boiler, basic electrical vs PV/battery, and basic networking vs smart-home/security-heavy projects. Keep this split aligned with canonical parent costs to avoid double counting explicit extras and future system add-ons.
          children: createKg400CommunicationAllocationChildren(input.kg400CategoryCostsById.data_security ?? 0),
        },
        {
          code: "480",
          cost: input.kg400CategoryCostsById.automation ?? 0,
          visible: true,
          // TODO: Current default residential baseline; later rebalance via system presets such as heat pump vs boiler, basic electrical vs PV/battery, and basic networking vs smart-home/security-heavy projects. Keep this split aligned with canonical parent costs to avoid double counting explicit extras and future system add-ons.
          children: createKg400AutomationAllocationChildren(input.kg400CategoryCostsById.automation ?? 0),
        },
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
          meta: {
            bathroomWcFurnishingSliceCost: input.bathroomWcFurnishingSliceCost,
            kg620BaselineWardrobeCost: input.kg620BaselineWardrobeCost,
            kg620WardrobeDeltaCost: input.kg620WardrobeDeltaCost,
            kg620WardrobeTotal: input.kg620WardrobeTotal,
          },
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
