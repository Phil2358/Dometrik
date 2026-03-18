interface HvacExtrasInput {
  effectiveArea: number
  mainArea: number
  habitableBasementArea?: number
  qualityId: string
  hvacSelections: Record<string, boolean>
}

const HVAC_HEATING_QUALITY_MULTIPLIERS: Record<string, number> = {
  standard: 1.00,
  premium: 1.12,
  luxury: 1.25
}

const HVAC_PV_QUALITY_MULTIPLIERS: Record<string, number> = {
  standard: 1.00,
  premium: 1.07,
  luxury: 1.12
}

export function calculateHvacExtras(input: HvacExtrasInput) {
  const heatingQualityMultiplier =
    HVAC_HEATING_QUALITY_MULTIPLIERS[input.qualityId] ?? 1.12
  const photovoltaicQualityMultiplier =
    HVAC_PV_QUALITY_MULTIPLIERS[input.qualityId] ?? 1.07

  const heatedInternalArea =
    Math.max(0, input.mainArea + (input.habitableBasementArea ?? 0))

  const underfloorHeatingBaseCost =
    Math.max(9000, heatedInternalArea * 85)
  const underfloorHeatingCost =
    input.hvacSelections.underfloor_heating
      ? Math.round(underfloorHeatingBaseCost * heatingQualityMultiplier)
      : 0

  const solarThermalBaseCost =
    input.effectiveArea <= 120
      ? 2500
      : input.effectiveArea <= 220
        ? 3500
        : 4500
  const solarThermalCostCap =
    input.qualityId === "luxury"
      ? 6500
      : input.qualityId === "premium"
        ? 6000
        : 5500
  const solarThermalCost =
    input.hvacSelections.solar_thermal
      ? Math.min(
        solarThermalCostCap,
        Math.round(solarThermalBaseCost * heatingQualityMultiplier)
      )
      : 0

  const photovoltaicBaseCost =
    input.effectiveArea <= 120
      ? 6000
      : input.effectiveArea <= 220
        ? 9000
        : 11500
  const photovoltaicCostCap =
    input.qualityId === "luxury"
      ? 14000
      : input.qualityId === "premium"
        ? 13250
        : 12500
  const photovoltaicCost =
    input.hvacSelections.photovoltaic
      ? Math.min(
        photovoltaicCostCap,
        Math.round(photovoltaicBaseCost * photovoltaicQualityMultiplier)
      )
      : 0

  const optionCosts = {
    underfloor_heating: underfloorHeatingCost,
    solar_thermal: solarThermalCost,
    photovoltaic: photovoltaicCost
  }

  return {
    optionCosts,
    adjustmentsByCategory: {
      heating: underfloorHeatingCost + solarThermalCost,
      electrical: photovoltaicCost
    },
    hvacExtrasCost: underfloorHeatingCost + solarThermalCost + photovoltaicCost
  }
}
