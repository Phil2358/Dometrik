import {
  type AutomationPackageLevel,
  COST_CATEGORIES,
  DEFAULT_QUALITY_ID,
  type DataSecurityPackageLevel,
  KG400_AUTOMATION_UPLIFT_PER_SQM,
  KG400_BATHROOM_DELTA_BASE_COST,
  KG400_BEDROOM_DELTA_BASE_COSTS,
  KG400_DATA_SECURITY_UPLIFT_PER_SQM,
  KG400_OPTION_PACKAGE_QUALITY_FACTORS,
  type Kg400PackageSelection,
  KG400_WC_DELTA_BASE_COST,
  type QualityId,
} from "../../constants/construction"
import { calculateHvacExtras } from "./hvacExtras"

interface Kg400CostsInput {
  benchmarkBucket400: number
  mainArea: number
  qualityId: QualityId
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

const KG400_BENCHMARK_CATEGORY_IDS = [
  "plumbing",
  "heating",
  "ventilation_cooling",
  "electrical",
] as const
const KG400_CATEGORY_PERCENTAGE_DENOMINATOR = COST_CATEGORIES
  .filter((category) =>
    KG400_BENCHMARK_CATEGORY_IDS.includes(
      category.id as typeof KG400_BENCHMARK_CATEGORY_IDS[number]
    )
  )
  .reduce((sum, category) => sum + category.percentage, 0)

function getKg400CategoryPercentage(categoryId: string): number {
  return COST_CATEGORIES.find((category) => category.id === categoryId)?.percentage ?? 0
}

export function calculateKg400BenchmarkCategoryCostsById(
  benchmarkBucket400: number
): Record<string, number> {
  const resolvedBenchmarkBucket400 = Math.max(0, benchmarkBucket400)
  const plumbing = Math.max(
    0,
    Math.round(
      resolvedBenchmarkBucket400
      * (getKg400CategoryPercentage("plumbing") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)
    )
  )
  const heating = Math.max(
    0,
    Math.round(
      resolvedBenchmarkBucket400
      * (getKg400CategoryPercentage("heating") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)
    )
  )
  const ventilation_cooling = Math.max(
    0,
    Math.round(
      resolvedBenchmarkBucket400
      * (getKg400CategoryPercentage("ventilation_cooling") / KG400_CATEGORY_PERCENTAGE_DENOMINATOR)
    )
  )
  const electrical = Math.max(
    0,
    resolvedBenchmarkBucket400 - plumbing - heating - ventilation_cooling
  )

  return {
    plumbing,
    heating,
    ventilation_cooling,
    electrical,
    data_security: 0,
    automation: 0,
  }
}

export function calculateKg400Costs(input: Kg400CostsInput): Kg400CostsResult {
  const qualityPackageMultiplier =
    KG400_OPTION_PACKAGE_QUALITY_FACTORS[input.qualityId] ??
    KG400_OPTION_PACKAGE_QUALITY_FACTORS[DEFAULT_QUALITY_ID]
  const bedroomDeltaBaseCost =
    KG400_BEDROOM_DELTA_BASE_COSTS[input.qualityId] ??
    KG400_BEDROOM_DELTA_BASE_COSTS[DEFAULT_QUALITY_ID]
  const benchmarkBucket400 = Math.max(0, input.benchmarkBucket400)

  const kg400BedroomDeltaCost =
    Math.round(input.bedroomDelta * bedroomDeltaBaseCost)
  const kg400BathroomDeltaCost =
    Math.round(input.bathroomDelta * KG400_BATHROOM_DELTA_BASE_COST * qualityPackageMultiplier)
  const kg400WcDeltaCost =
    Math.round(input.wcDelta * KG400_WC_DELTA_BASE_COST * qualityPackageMultiplier)

  const kg400BedroomHeatingAdjustment = Math.round(kg400BedroomDeltaCost * 0.20)
  const kg400BedroomVentilationAdjustment = Math.round(kg400BedroomDeltaCost * 0.30)
  const kg400BedroomElectricalAdjustment =
    kg400BedroomDeltaCost
    - kg400BedroomHeatingAdjustment
    - kg400BedroomVentilationAdjustment
  const kg400BathroomPlumbingAdjustment = Math.round(kg400BathroomDeltaCost * 0.65)
  const kg400BathroomHeatingAdjustment = Math.round(kg400BathroomDeltaCost * 0.10)
  const kg400BathroomVentilationAdjustment = Math.round(kg400BathroomDeltaCost * 0.05)
  const kg400BathroomElectricalAdjustment =
    kg400BathroomDeltaCost
    - kg400BathroomPlumbingAdjustment
    - kg400BathroomHeatingAdjustment
    - kg400BathroomVentilationAdjustment
  const kg400WcPlumbingAdjustment = Math.round(kg400WcDeltaCost * 0.75)
  const kg400WcHeatingAdjustment = Math.round(kg400WcDeltaCost * 0.05)
  const kg400WcVentilationAdjustment = Math.round(kg400WcDeltaCost * 0.05)
  const kg400WcElectricalAdjustment =
    kg400WcDeltaCost
    - kg400WcPlumbingAdjustment
    - kg400WcHeatingAdjustment
    - kg400WcVentilationAdjustment

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
  const dataSecurityDefaultPackageCost = Math.round(
    Math.max(0, input.mainArea) * dataSecurityUpliftPerSqm
  )
  const dataSecurityExtraCost = dataSecurityPackageLevel === "custom"
    ? Math.max(0, dataSecurityManualQuote ?? 0)
    : dataSecurityDefaultPackageCost
  const dataSecurityCategoryCost = dataSecurityExtraCost
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

  const benchmarkCategoryCostsById =
    calculateKg400BenchmarkCategoryCostsById(benchmarkBucket400)

  const categoryCostsById: Record<string, number> = {
    plumbing: Math.max(
      0,
      Math.round(
        (benchmarkCategoryCostsById.plumbing ?? 0)
        + kg400BathroomPlumbingAdjustment
        + kg400WcPlumbingAdjustment
      )
    ),
    heating: Math.max(
      0,
        Math.round(
          (benchmarkCategoryCostsById.heating ?? 0)
          + kg400BedroomHeatingAdjustment
          + kg400BathroomHeatingAdjustment
          + kg400WcHeatingAdjustment
          + (hvacCosts.adjustmentsByCategory.heating ?? 0)
        )
    ),
    ventilation_cooling: Math.max(
      0,
      Math.round(
        (benchmarkCategoryCostsById.ventilation_cooling ?? 0)
        + kg400BedroomVentilationAdjustment
        + kg400BathroomVentilationAdjustment
        + kg400WcVentilationAdjustment
      )
    ),
    electrical: Math.max(
      0,
      Math.round(
        (benchmarkCategoryCostsById.electrical ?? 0)
        + kg400BedroomElectricalAdjustment
        + kg400BathroomElectricalAdjustment
        + kg400WcElectricalAdjustment
        + (hvacCosts.adjustmentsByCategory.electrical ?? 0)
      )
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
        defaultCost: dataSecurityDefaultPackageCost,
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
