import {
  BASE_GROUP_SHARE_KG400,
  COST_CATEGORIES,
  KG400_AUTOMATION_PACKAGE_COSTS,
  KG400_BATHROOM_DELTA_BASE_COST,
  KG400_BEDROOM_DELTA_BASE_COST,
  KG400_DATA_SECURITY_BASELINE_ALLOWANCE,
  KG400_WC_DELTA_BASE_COST,
  QUALITY_LEVELS,
} from "../../constants/construction"
import { calculateHvacExtras } from "./hvacExtras"

interface Kg400CostsInput {
  mainArea: number
  effectiveArea: number
  finalCostPerSqm: number
  qualityId: string
  siteAccessibilityFactor: number
  bedroomDelta: number
  bathroomDelta: number
  wcDelta: number
  habitableBasementArea?: number
  hvacSelections: Record<string, boolean>
}

interface Kg400CostsResult {
  categoryCostsById: Record<string, number>
  kg400Total: number
  hvacOptionCosts: Record<string, number>
  hvacExtrasCost: number
}

const KG400_ACCESSIBILITY_WEIGHT = 0.22
const KG400_PERCENTAGE_DENOMINATOR = 24

function getKg400CategoryPercentage(categoryId: string): number {
  return COST_CATEGORIES.find((category) => category.id === categoryId)?.percentage ?? 0
}

export function calculateKg400Costs(input: Kg400CostsInput): Kg400CostsResult {
  const qualityPackageMultiplier =
    QUALITY_LEVELS.find((quality) => quality.id === input.qualityId)?.benchmarkFactor ?? 1
  const kg400AccessibilityMultiplier =
    1 + Math.max(0, input.siteAccessibilityFactor - 1) * KG400_ACCESSIBILITY_WEIGHT

  const mainAreaConstructionCost = input.mainArea * input.finalCostPerSqm
  const effectiveAreaConstructionCost = input.effectiveArea * input.finalCostPerSqm
  const mainAreaKg400Envelope = Math.round(mainAreaConstructionCost * BASE_GROUP_SHARE_KG400)
  const effectiveAreaKg400Envelope = Math.round(effectiveAreaConstructionCost * BASE_GROUP_SHARE_KG400)

  const kg400BedroomDeltaCost =
    Math.round(input.bedroomDelta * KG400_BEDROOM_DELTA_BASE_COST * qualityPackageMultiplier)
  const kg400BathroomDeltaCost =
    Math.round(input.bathroomDelta * KG400_BATHROOM_DELTA_BASE_COST * qualityPackageMultiplier)
  const kg400WcDeltaCost =
    Math.round(input.wcDelta * KG400_WC_DELTA_BASE_COST * qualityPackageMultiplier)

  const kg400BedroomVentilationAdjustment = Math.round(kg400BedroomDeltaCost * 0.45)
  const kg400BedroomElectricalAdjustment = Math.round(kg400BedroomDeltaCost * 0.35)
  const kg400BathroomPlumbingAdjustment = Math.round(kg400BathroomDeltaCost * 0.75)
  const kg400BathroomHeatingAdjustment = Math.round(kg400BathroomDeltaCost * 0.15)
  const kg400BathroomElectricalAdjustment =
    kg400BathroomDeltaCost - kg400BathroomPlumbingAdjustment - kg400BathroomHeatingAdjustment
  const kg400WcPlumbingAdjustment = Math.round(kg400WcDeltaCost * 0.70)
  const kg400WcElectricalAdjustment = Math.round(kg400WcDeltaCost * 0.20)

  const hvacCosts =
    calculateHvacExtras({
      effectiveArea: input.effectiveArea,
      mainArea: input.mainArea,
      habitableBasementArea: input.habitableBasementArea,
      qualityId: input.qualityId,
      hvacSelections: input.hvacSelections,
    })

  // 450 = minimal baseline weak-current allowance + optional extras.
  const dataSecurityOptionalExtrasCost = 0
  // 480 = automation only via explicit optional package / extras.
  const automationPackageId: keyof typeof KG400_AUTOMATION_PACKAGE_COSTS = "none"
  const automationCategoryCost =
    KG400_AUTOMATION_PACKAGE_COSTS[automationPackageId]

  const categoryCostsById: Record<string, number> = {
    plumbing: Math.max(
      0,
      Math.round(
        Math.round(
          mainAreaKg400Envelope
          * (getKg400CategoryPercentage("plumbing") / KG400_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      ) + kg400BathroomPlumbingAdjustment + kg400WcPlumbingAdjustment
    ),
    heating: Math.max(
      0,
      Math.round(
        Math.round(
          effectiveAreaKg400Envelope
          * (getKg400CategoryPercentage("heating") / KG400_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      ) + kg400BathroomHeatingAdjustment + (hvacCosts.adjustmentsByCategory.heating ?? 0)
    ),
    ventilation_cooling: Math.max(
      0,
      Math.round(
        Math.round(
          effectiveAreaKg400Envelope
          * (getKg400CategoryPercentage("ventilation_cooling") / KG400_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      ) + kg400BedroomVentilationAdjustment
    ),
    electrical: Math.max(
      0,
      Math.round(
        Math.round(
          effectiveAreaKg400Envelope
          * (getKg400CategoryPercentage("electrical") / KG400_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      )
      + kg400BedroomElectricalAdjustment
      + kg400BathroomElectricalAdjustment
      + kg400WcElectricalAdjustment
      + (hvacCosts.adjustmentsByCategory.electrical ?? 0)
    ),
    data_security: Math.max(
      0,
      KG400_DATA_SECURITY_BASELINE_ALLOWANCE + dataSecurityOptionalExtrasCost
    ),
    automation: Math.max(0, automationCategoryCost),
  }

  return {
    categoryCostsById,
    kg400Total: Object.values(categoryCostsById).reduce((sum, cost) => sum + cost, 0),
    hvacOptionCosts: hvacCosts.optionCosts,
    hvacExtrasCost: hvacCosts.hvacExtrasCost,
  }
}
