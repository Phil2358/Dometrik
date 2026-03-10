import { calculateProjectCost } from "../calculator-engine/calculateProjectCost"

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function runEngineStressTest(iterations = 100) {
  console.log("Running engine stress test...")

  const locationIds = ["standard", "expensive", "cheap"]
  const qualityIds = ["basic", "medium", "high"]
  const basementTypes = ["none", "full", "partial"]

  for (let i = 0; i < iterations; i++) {
    const scenario = {
      mainArea: random(80, 350),
      terraceArea: random(0, 80),
      balconyArea: random(0, 40),
      basementArea: random(0, 120),
      basementTypeId: randomChoice(basementTypes),

      locationId: randomChoice(locationIds),
      qualityId: randomChoice(qualityIds),
      customCostPerSqm: null,

      siteConditionId: "normal",
      groundwaterConditionId: "normal",
      accessibilityId: "normal",

      utilityConnectionId: "standard",
      customUtilityCost: null,

      landscapingArea: random(0, 400),

      includePool: Math.random() > 0.6,
      poolSizeId: "medium",
      poolCustomArea: null,
      poolDepth: null,
      poolQualityId: "standard",
      poolTypeId: "skimmer",

      hvacSelections: {
        cooling: Math.random() > 0.5,
        heating: true,
        ventilation: Math.random() > 0.5
      }
    }

    const result = calculateProjectCost(scenario)

    if (!result || isNaN(result.totalCost)) {
      console.error("❌ Calculation failed:", scenario)
      return
    }

    if (result.totalCost <= 0) {
      console.error("❌ Negative or zero cost:", result)
      return
    }

    if (result.totalCost > 10000000) {
      console.warn("⚠️ Suspiciously high cost:", result.totalCost)
    }
  }

  console.log("✅ Engine stress test passed")
}