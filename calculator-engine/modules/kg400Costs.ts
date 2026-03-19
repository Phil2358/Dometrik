import {
  type AutomationPackageLevel,
  BASE_GROUP_SHARE_KG400,
  COST_CATEGORIES,
  DEFAULT_QUALITY_ID,
  type DataSecurityPackageLevel,
  KG400_AUTOMATION_UPLIFT_PER_SQM,
  KG400_BATHROOM_DELTA_BASE_COST,
  KG400_BEDROOM_DELTA_BASE_COST,
  KG400_DATA_SECURITY_BASELINE_SHARE_PERCENT,
  KG400_DATA_SECURITY_UPLIFT_PER_SQM,
  KG400_OPTION_PACKAGE_QUALITY_FACTORS,
  type Kg400PackageSelection,
  KG400_WC_DELTA_BASE_COST,
  type QualityId,
} from "../../constants/construction"
import { calculateHvacExtras } from "./hvacExtras"

interface Kg400CostsInput {
  mainArea: number
  finalCostPerSqm: number
  qualityId: QualityId
  siteAccessibilityFactor: number
  bedroomDelta: number
  bathroomDelta: number
  wcDelta: number
  dataSecurityPackageLevel?: DataSecurityPackageLevel
  dataSecurityPackageSelection?: Kg400PackageSelection
  dataSecurityManualQuote?: number | null
  automationPackageLevel?: AutomationPackageLevel
  automationPackageSelection?: Kg400PackageSelection
  automationManualQuote?: number | null
  habitableBasementArea?: number
  hvacSelections: Record<string, boolean>
}

interface Kg400PackageCostBreakdown {
  defaultCost: number
  appliedCost: number
  manualOverrideActive: boolean
}

interface Kg400CostsResult {
  categoryCostsById: Record<string, number>
  kg400Total: number
  hvacOptionCosts: Record<string, number>
  hvacExtrasCost: number
  packageCosts: {
    dataSecurity: Kg400PackageCostBreakdown
    automation: Kg400PackageCostBreakdown
  }
}

const KG400_ACCESSIBILITY_WEIGHT = 0.22
const KG400_CATEGORY_PERCENTAGE_DENOMINATOR = 24

function getKg400CategoryPercentage(categoryId: string): number {
  return COST_CATEGORIES.find((category) => category.id === categoryId)?.percentage ?? 0
}

export function calculateKg400Costs(input: Kg400CostsInput): Kg400CostsResult {
  const qualityPackageMultiplier =
    KG400_OPTION_PACKAGE_QUALITY_FACTORS[input.qualityId] ??
    KG400_OPTION_PACKAGE_QUALITY_FACTORS[DEFAULT_QUALITY_ID]
  const kg400AccessibilityMultiplier =
    1 + Math.max(0, input.siteAccessibilityFactor - 1) * KG400_ACCESSIBILITY_WEIGHT

  const mainAreaConstructionCost = input.mainArea * input.finalCostPerSqm
  const mainAreaKg400Envelope = Math.round(mainAreaConstructionCost * BASE_GROUP_SHARE_KG400)

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
      mainArea: input.mainArea,
      habitableBasementArea: input.habitableBasementArea,
      qualityId: input.qualityId,
      hvacSelections: input.hvacSelections,
    })

  const dataSecurityPackageLevel =
    input.dataSecurityPackageLevel
    ?? ((input.dataSecurityPackageSelection ?? "no") === "yes" ? "connected" : "essential")
  const dataSecurityUpliftPerSqm =
    KG400_DATA_SECURITY_UPLIFT_PER_SQM[dataSecurityPackageLevel]
  const dataSecurityManualQuote = input.dataSecurityManualQuote ?? null
  const dataSecurityBaselineCost = Math.round(
    mainAreaKg400Envelope * (KG400_DATA_SECURITY_BASELINE_SHARE_PERCENT / 100)
  )
  const dataSecurityDefaultPackageCost = Math.round(
    Math.max(0, input.mainArea) * dataSecurityUpliftPerSqm
  )
  const dataSecurityExtraCost = dataSecurityPackageLevel === "custom"
    ? Math.max(0, dataSecurityManualQuote ?? 0)
    : dataSecurityDefaultPackageCost
  const dataSecurityCategoryCost = dataSecurityBaselineCost + dataSecurityExtraCost
  const automationPackageLevel =
    input.automationPackageLevel
    ?? ((input.automationPackageSelection ?? "no") === "yes" ? "connected" : "none")
  const automationUpliftPerSqm =
    KG400_AUTOMATION_UPLIFT_PER_SQM[automationPackageLevel]
  const automationDefaultPackageCost = Math.round(
    Math.max(0, input.mainArea) * automationUpliftPerSqm
  )
  const automationManualQuote = input.automationManualQuote ?? null
  const automationExtraCost = automationPackageLevel === "custom"
    ? Math.max(0, automationManualQuote ?? 0)
    : automationDefaultPackageCost
  const automationCategoryCost = automationExtraCost

  const categoryCostsById: Record<string, number> = {
    plumbing: Math.max(
      0,
      Math.round(
        Math.round(
          mainAreaKg400Envelope
          * (getKg400CategoryPercentage("plumbing") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      ) + kg400BathroomPlumbingAdjustment + kg400WcPlumbingAdjustment
    ),
    heating: Math.max(
      0,
      Math.round(
        Math.round(
          mainAreaKg400Envelope
          * (getKg400CategoryPercentage("heating") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      ) + kg400BathroomHeatingAdjustment + (hvacCosts.adjustmentsByCategory.heating ?? 0)
    ),
    ventilation_cooling: Math.max(
      0,
      Math.round(
        Math.round(
          mainAreaKg400Envelope
          * (getKg400CategoryPercentage("ventilation_cooling") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      ) + kg400BedroomVentilationAdjustment
    ),
    electrical: Math.max(
      0,
      Math.round(
        Math.round(
          mainAreaKg400Envelope
          * (getKg400CategoryPercentage("electrical") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      )
      + kg400BedroomElectricalAdjustment
      + kg400BathroomElectricalAdjustment
      + kg400WcElectricalAdjustment
      + (hvacCosts.adjustmentsByCategory.electrical ?? 0)
    ),
    data_security: Math.max(
      0,
      dataSecurityCategoryCost
    ),
    automation: Math.max(0, automationCategoryCost),
  }

  return {
    categoryCostsById,
    kg400Total: Object.values(categoryCostsById).reduce((sum, cost) => sum + cost, 0),
    hvacOptionCosts: hvacCosts.optionCosts,
    hvacExtrasCost: hvacCosts.hvacExtrasCost,
    packageCosts: {
      dataSecurity: {
        defaultCost: dataSecurityBaselineCost + dataSecurityDefaultPackageCost,
        appliedCost: dataSecurityCategoryCost,
        manualOverrideActive: dataSecurityPackageLevel === "custom",
      },
      automation: {
        defaultCost: automationDefaultPackageCost,
        appliedCost: automationCategoryCost,
        manualOverrideActive: automationPackageLevel === "custom",
      },
    },
  }
}
