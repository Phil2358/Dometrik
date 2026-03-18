interface Kg100CostsInput {
  landValue?: number
  landAcquisitionCosts?: number
  landAcquisitionCostsMode?: "auto" | "manual"
}

const DEFAULT_LAND_ACQUISITION_PERCENTAGE = 0.06

export function calculateKg100Costs(input: Kg100CostsInput) {
  const landValue = Math.max(0, input.landValue ?? 0)
  const landAcquisitionCostsMode = input.landAcquisitionCostsMode ?? "auto"
  const incidentalLandAcquisitionCosts = landAcquisitionCostsMode === "auto"
    ? landValue * DEFAULT_LAND_ACQUISITION_PERCENTAGE
    : Math.max(0, input.landAcquisitionCosts ?? 0)

  return {
    landValue,
    incidentalLandAcquisitionCosts,
    landAcquisitionCostsMode,
    kg100Total: landValue + incidentalLandAcquisitionCosts,
    subgroupCosts: {
      subgroup110Cost: landValue,
      subgroup120Cost: incidentalLandAcquisitionCosts,
      subgroup130Cost: 0,
    },
  }
}
