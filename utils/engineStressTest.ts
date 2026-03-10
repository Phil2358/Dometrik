import { calculateProjectCost } from "@/calculator-engine/calculateProjectCost";

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function runEngineStressTest(iterations: number = 100) {
  console.log("Running engine stress test...");

  const qualityIds = ["standard", "premium", "luxury"];
  const locationIds = [
    "athens",
    "corfu",
    "thessaloniki",
    "crete",
    "mykonos",
  ];

  for (let i = 0; i < iterations; i++) {
    const scenario = {
      mainArea: random(90, 320),
      terraceArea: random(0, 60),
      balconyArea: random(0, 30),
      basementArea: random(0, 120),

      basementTypeId: randomChoice(["storage", "parking", "habitable"]),

      locationId: randomChoice(locationIds),
      qualityId: randomChoice(qualityIds),

      customCostPerSqm: null,

      siteConditionId: randomChoice([
        "flat_normal",
        "flat_rocky",
        "inclined_normal",
      ]),

      groundwaterConditionId: randomChoice(["normal", "high"]),

      accessibilityId: randomChoice([
        "normal",
        "limited",
        "difficult",
      ]),

      utilityConnectionId: randomChoice([
        "standard",
        "difficult",
        "remote",
      ]),

      customUtilityCost: null,

      landscapingArea: random(0, 400),

      includePool: Math.random() > 0.65,

      poolSizeId: randomChoice(["small", "medium", "large"]),
      poolCustomArea: null,
      poolDepth: random(1.2, 1.8),

      poolQualityId: randomChoice(["standard", "enhanced"]),
      poolTypeId: randomChoice(["skimmer", "infinity"]),

      hvacSelections: {
        underfloor_heating: Math.random() > 0.6,
        solar_thermal: Math.random() > 0.7,
        photovoltaic: Math.random() > 0.7,
      },

      bathrooms: Math.floor(random(1, 4)),
      wcs: Math.floor(random(1, 3)),

      contractorPercent: random(8, 20),
    };

    try {
      const result = calculateProjectCost(scenario as any);

      if (!result || isNaN(result.totalCost)) {
        console.error("❌ Engine failed on scenario:", scenario);
        return;
      }

      if (result.totalCost <= 0) {
        console.error("❌ Negative or zero cost detected:", result);
        return;
      }

      const costPerM2 = result.totalCost / scenario.mainArea;

      if (costPerM2 < 600 || costPerM2 > 8000) {
        console.warn(
          `⚠️ Unrealistic €/m² detected: ${costPerM2.toFixed(0)} €/m²`
        );
      }

      console.log(
        `Scenario ${i + 1} OK — Total: €${Math.round(result.totalCost)}`
      );
    } catch (err) {
      console.error("❌ Engine crashed:", err);
      return;
    }
  }

  console.log("✅ Engine stress test finished successfully.");
}