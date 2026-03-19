import { calculateProjectCost } from "@/calculator-engine/calculateProjectCost";

export function runEngineStressTest(iterations: number = 100) {

  console.log("🚀 ENGINE STRESS TEST STARTED");

  for (let i = 0; i < iterations; i++) {

    const scenario = {
      mainArea: 180,
      terraceArea: 20,
      balconyArea: 0,
      basementArea: 60,

      basementTypeId: "storage",

      locationId: "athens",
      qualityId: "economy",

      customCostPerSqm: null,

      siteConditionId: "flat_normal",
      groundwaterConditionId: "normal",
      accessibilityId: "normal",

      utilityConnectionId: "standard",
      customUtilityCost: null,

      landscapingArea: 150,

      includePool: false,

      poolSizeId: "medium",
      poolCustomArea: null,
      poolDepth: 1.4,

      poolQualityId: "standard",
      poolTypeId: "skimmer",

      hvacSelections: {
        underfloor_heating: false,
        solar_thermal: false,
        photovoltaic: false,
      },

      bathrooms: 2,
      wcs: 1,

      contractorPercent: 12,
    };

    try {

      const result = calculateProjectCost(scenario as any);

      console.log(`Scenario ${i + 1}: €${Math.round(result.totalCost)}`);

    } catch (err) {

      console.error("❌ ENGINE CRASHED", err);
      return;

    }
  }

  console.log("✅ ENGINE STRESS TEST FINISHED");
}
