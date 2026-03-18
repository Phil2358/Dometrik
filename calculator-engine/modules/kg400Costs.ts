import {
  BASE_GROUP_SHARE_KG400,
  COST_CATEGORIES,
  getKg400OptionalPackageAreaFactor,
  KG400_AUTOMATION_PACKAGE_BASE_COST,
  KG400_BATHROOM_DELTA_BASE_COST,
  KG400_BEDROOM_DELTA_BASE_COST,
  KG400_DATA_SECURITY_BASELINE_COST_PER_SQM,
  KG400_DATA_SECURITY_PACKAGE_BASE_COST,
  KG400_OPTION_PACKAGE_QUALITY_FACTORS,
  type Kg400PackageSelection,
  KG400_WC_DELTA_BASE_COST,
} from "../../constants/construction"
import { calculateHvacExtras } from "./hvacExtras"

interface Kg400CostsInput {
  mainArea: number
  finalCostPerSqm: number
  qualityId: string
  siteAccessibilityFactor: number
  bedroomDelta: number
  bathroomDelta: number
  wcDelta: number
  dataSecurityPackageSelection?: Kg400PackageSelection
  dataSecurityManualQuote?: number | null
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
const KG400_PERCENTAGE_DENOMINATOR = 24

function getKg400CategoryPercentage(categoryId: string): number {
  return COST_CATEGORIES.find((category) => category.id === categoryId)?.percentage ?? 0
}

export function calculateKg400Costs(input: Kg400CostsInput): Kg400CostsResult {
  const qualityPackageMultiplier =
    KG400_OPTION_PACKAGE_QUALITY_FACTORS[input.qualityId] ?? 1
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

  // 450 = small main-area-based baseline for minimal weak-current/security infrastructure.
  const optionalPackageAreaFactor = getKg400OptionalPackageAreaFactor(input.mainArea)
  const dataSecurityPackageEnabled = (input.dataSecurityPackageSelection ?? "no") === "yes"
  const dataSecurityDefaultPackageCost = dataSecurityPackageEnabled
    ? Math.round(
      KG400_DATA_SECURITY_PACKAGE_BASE_COST
      * qualityPackageMultiplier
      * optionalPackageAreaFactor
    )
    : 0
  const dataSecurityManualQuote = input.dataSecurityManualQuote ?? null
  const dataSecurityOptionalExtrasCost =
    dataSecurityPackageEnabled && dataSecurityManualQuote !== null && dataSecurityManualQuote > 0
      ? dataSecurityManualQuote
      : dataSecurityDefaultPackageCost
  const dataSecurityBaselineCost =
    Math.round(Math.max(0, input.mainArea) * KG400_DATA_SECURITY_BASELINE_COST_PER_SQM)
  // 480 = automation only via explicit optional package / extras.
  const automationPackageEnabled = (input.automationPackageSelection ?? "no") === "yes"
  const automationDefaultPackageCost = automationPackageEnabled
    ? Math.round(
      KG400_AUTOMATION_PACKAGE_BASE_COST
      * qualityPackageMultiplier
      * optionalPackageAreaFactor
    )
    : 0
  const automationManualQuote = input.automationManualQuote ?? null
  const automationCategoryCost =
    automationPackageEnabled && automationManualQuote !== null && automationManualQuote > 0
      ? automationManualQuote
      : automationDefaultPackageCost

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
          mainAreaKg400Envelope
          * (getKg400CategoryPercentage("heating") / KG400_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      ) + kg400BathroomHeatingAdjustment + (hvacCosts.adjustmentsByCategory.heating ?? 0)
    ),
    ventilation_cooling: Math.max(
      0,
      Math.round(
        Math.round(
          mainAreaKg400Envelope
          * (getKg400CategoryPercentage("ventilation_cooling") / KG400_PERCENTAGE_DENOMINATOR)
        ) * kg400AccessibilityMultiplier
      ) + kg400BedroomVentilationAdjustment
    ),
    electrical: Math.max(
      0,
      Math.round(
        Math.round(
          mainAreaKg400Envelope
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
      dataSecurityBaselineCost + dataSecurityOptionalExtrasCost
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
        defaultCost: dataSecurityDefaultPackageCost,
        appliedCost: dataSecurityOptionalExtrasCost,
        manualOverrideActive: dataSecurityPackageEnabled && dataSecurityManualQuote !== null && dataSecurityManualQuote > 0,
      },
      automation: {
        defaultCost: automationDefaultPackageCost,
        appliedCost: automationCategoryCost,
        manualOverrideActive: automationPackageEnabled && automationManualQuote !== null && automationManualQuote > 0,
      },
    },
  }
}
