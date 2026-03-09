import type { ScenarioConfig } from '@/contexts/EstimateContext';
import {
  LOCATIONS,
  QUALITY_LEVELS,
  BASEMENT_TYPES,
  SITE_CONDITIONS,
  COST_CATEGORIES,
  HVAC_OPTIONS,
  POOL_SIZE_OPTIONS,
  POOL_QUALITY_OPTIONS,
  POOL_TYPE_OPTIONS,
  POOL_TERRAIN_MULTIPLIERS,
  POOL_MINIMUM_COST,
  DEFAULT_POOL_DEPTH,
  UTILITY_CONNECTION_OPTIONS,
  CONTINGENCY_PERCENTAGES,
  LANDSCAPING_BASE_COST_PER_SQM,
  INTERIOR_ADJUSTMENTS,
  INTERIOR_BASELINE,
  PERMIT_DESIGN_BASELINE_FEE,
  PERMIT_DESIGN_BASELINE_AREA_MAX,
  PERMIT_DESIGN_QUALITY_MULTIPLIERS,
  GROUNDWATER_CONDITIONS,
  SITE_ACCESSIBILITY_OPTIONS,
  KG300_CATEGORY_IDS,
  KG400_CATEGORY_IDS,
  KG600_CATEGORY_IDS,
  getSizeCorrectionFactor,
  getBasementExcavationCost,
  getBasementStructureCost,
  getLandscapingSizeAdjustment,
  getPoolDepthFactor,
} from '@/constants/construction';

export interface ComputedScenarioCosts {
  name: string;
  locationName: string;
  qualityName: string;
  effectiveArea: number;
  costPerSqm: number;
  sizeCorrectionFactor: number;
  correctedCostPerSqm: number;
  baseBuildingCost: number;
  kg200Total: number;
  kg300Cost: number;
  kg400Total: number;
  kg500Total: number;
  kg600Cost: number;
  basementExcavationCost: number;
  basementStructureCost: number;
  basementTotalCost: number;
  siteExcavationCost: number;
  permitDesignFee: number;
  contingencyCost: number;
  contractorCost: number;
  constructionSubtotal: number;
  totalCost: number;
  mainArea: number;
  terraceArea: number;
  balconyArea: number;
  basementArea: number;
  basementTypeName: string;
  includePool: boolean;
  poolSizeName: string;
  poolArea: number;
  poolCost: number;
  siteConditionName: string;
  groundwaterConditionName: string;
  siteAccessibilityName: string;
  landscapingArea: number;
  landscapingCost: number;
  hvacNames: string[];
  totalHvacCost: number;
  contingencyPercent: number;
  contractorPercent: number;
  utilityConnectionCost: number;
}

export function computeScenarioCosts(config: ScenarioConfig): ComputedScenarioCosts {
  const location = LOCATIONS.find((l) => l.id === config.locationId) ?? LOCATIONS[0];
  const quality = QUALITY_LEVELS.find((q) => q.id === config.qualityId) ?? QUALITY_LEVELS[1];
  const basementType = BASEMENT_TYPES.find((b) => b.id === config.basementTypeId) ?? BASEMENT_TYPES[0];
  const siteCondition = SITE_CONDITIONS.find((s) => s.id === config.siteConditionId) ?? SITE_CONDITIONS[0];
  const groundwaterCondition = GROUNDWATER_CONDITIONS.find((g) => g.id === config.groundwaterConditionId) ?? GROUNDWATER_CONDITIONS[0];
  const siteAccessibility = SITE_ACCESSIBILITY_OPTIONS.find((a) => a.id === config.siteAccessibilityId) ?? SITE_ACCESSIBILITY_OPTIONS[0];

  const effectiveArea =
    config.mainArea +
    config.terraceArea * 0.5 +
    config.balconyArea * 0.3 +
    config.basementArea * basementType.costFactor;

  const baseCostPerSqm = config.customCostPerSqm ?? quality.baseCostPerSqm;
  const costPerSqm = Math.round(baseCostPerSqm * location.multiplier);

  const sizeCorrectionFactor = getSizeCorrectionFactor(config.mainArea);
  const correctedCostPerSqm = Math.round(baseCostPerSqm * sizeCorrectionFactor);
  const finalCostPerSqm = Math.round(correctedCostPerSqm * location.multiplier);

  const rawBuildingCost = effectiveArea * finalCostPerSqm;

  const deltaBathrooms = config.bathrooms - INTERIOR_BASELINE.bathrooms;
  const deltaWcs = config.wcs - INTERIOR_BASELINE.wcs;

  const siteAccessibilityCost = siteAccessibility.fixedCost;

  const categoryCosts = COST_CATEGORIES.map((category) => {
    let categoryCost = Math.round(rawBuildingCost * (category.percentage / 100));

    if (category.id === 'interior') {
      const adj = 1 + deltaBathrooms * INTERIOR_ADJUSTMENTS.bathroom.interior + deltaWcs * INTERIOR_ADJUSTMENTS.wc.interior;
      categoryCost = Math.round(categoryCost * adj);
    }

    if (category.id === 'plumbing') {
      const adj = 1 + deltaBathrooms * INTERIOR_ADJUSTMENTS.bathroom.plumbing + deltaWcs * INTERIOR_ADJUSTMENTS.wc.plumbing;
      categoryCost = Math.round(categoryCost * adj);
    }

    if (category.id === 'furnishings') {
      const adj = 1 + deltaBathrooms * INTERIOR_ADJUSTMENTS.bathroom.furnishings + deltaWcs * INTERIOR_ADJUSTMENTS.wc.furnishings;
      categoryCost = Math.round(categoryCost * adj);
    }

    return { category, cost: categoryCost };
  });

  const utilityConnectionCost = config.utilityConnectionId === 'custom'
    ? config.customUtilityCost
    : (UTILITY_CONNECTION_OPTIONS.find((o) => o.id === config.utilityConnectionId)?.cost ?? 4000);

  const basementExcavationCost = getBasementExcavationCost(
    config.basementArea,
    siteCondition,
    groundwaterCondition,
  );

  const basementStructureCost = getBasementStructureCost(
    config.basementArea,
    basementType,
    groundwaterCondition,
  );

  const basementTotalCost = basementExcavationCost + basementStructureCost;

  const siteExcavationCost = Math.round(
    config.mainArea * 15 * siteCondition.terrainMultiplier
  );

  const kg200Total = siteExcavationCost + basementExcavationCost + utilityConnectionCost + siteAccessibilityCost;

  const kg300Cost = categoryCosts
    .filter((c) => (KG300_CATEGORY_IDS as readonly string[]).includes(c.category.id))
    .reduce((s, c) => s + c.cost, 0) + basementStructureCost;

  const kg400Cost = categoryCosts
    .filter((c) => (KG400_CATEGORY_IDS as readonly string[]).includes(c.category.id))
    .reduce((s, c) => s + c.cost, 0);

  const kg600Cost = categoryCosts
    .filter((c) => (KG600_CATEGORY_IDS as readonly string[]).includes(c.category.id))
    .reduce((s, c) => s + c.cost, 0);

  const mainBuildingArea = config.mainArea + config.terraceArea * 0.5;

  const hvacNames: string[] = [];
  let totalHvacCost = 0;
  for (const opt of HVAC_OPTIONS) {
    if (config.hvacSelections[opt.id]) {
      hvacNames.push(opt.name);
      totalHvacCost += Math.round(mainBuildingArea * opt.costPerSqm);
    }
  }

  const kg400Total = kg400Cost + totalHvacCost;

  const poolSizeOption = POOL_SIZE_OPTIONS.find((p) => p.id === config.poolSizeId) ?? POOL_SIZE_OPTIONS[1];
  const poolQualityOption = POOL_QUALITY_OPTIONS.find((p) => p.id === config.poolQualityId) ?? POOL_QUALITY_OPTIONS[0];
  const poolTypeOption = POOL_TYPE_OPTIONS.find((p) => p.id === config.poolTypeId) ?? POOL_TYPE_OPTIONS[0];
  const poolArea = config.poolSizeId === 'custom' ? config.poolCustomArea : poolSizeOption.area;
  const poolDepth = config.poolSizeId === 'custom' ? config.poolCustomDepth : DEFAULT_POOL_DEPTH;

  let poolCost = 0;
  if (config.includePool) {
    const baseCost = poolQualityOption.baseCostPerSqm;
    const depthFactor = getPoolDepthFactor(poolDepth);
    const typeFactor = poolTypeOption.multiplier;
    const terrainFactor = POOL_TERRAIN_MULTIPLIERS[config.siteConditionId] ?? 1.0;
    const calculated = poolArea * baseCost * depthFactor * typeFactor * terrainFactor;
    poolCost = Math.round(Math.max(calculated, POOL_MINIMUM_COST));
  }

  let landscapingCost = 0;
  if (config.landscapingArea > 0) {
    const baseCost = config.landscapingArea * LANDSCAPING_BASE_COST_PER_SQM;
    const sizeAdj = 1 + getLandscapingSizeAdjustment(config.landscapingArea);
    const siteAdj = siteCondition.terrainMultiplier;
    landscapingCost = Math.round(baseCost * sizeAdj * siteAdj);
  }

  const kg500Total = poolCost + landscapingCost;

  const baseBuildingCost = kg300Cost + kg400Total + kg600Cost;
  const constructionSubtotal = baseBuildingCost;

  const contingencyPercent = CONTINGENCY_PERCENTAGES[config.qualityId] ?? 0.10;
  const contingencyCost = Math.round(constructionSubtotal * contingencyPercent);

  const contractorCost = Math.round(constructionSubtotal * (config.contractorPercent / 100));

  const permitDesignEffectiveArea = mainBuildingArea + config.balconyArea * 0.3 + config.basementArea * basementType.costFactor;
  const areaFactor = permitDesignEffectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX
    ? permitDesignEffectiveArea / PERMIT_DESIGN_BASELINE_AREA_MAX
    : 1.0;
  const qualityFactor = PERMIT_DESIGN_QUALITY_MULTIPLIERS[config.qualityId] ?? 1.0;
  const permitDesignFee = Math.round(PERMIT_DESIGN_BASELINE_FEE * areaFactor * qualityFactor);

  const totalCost = kg200Total + constructionSubtotal + kg500Total + permitDesignFee + contingencyCost + contractorCost;

  return {
    name: config.name,
    locationName: location.name,
    qualityName: quality.name,
    effectiveArea,
    costPerSqm,
    sizeCorrectionFactor,
    correctedCostPerSqm,
    baseBuildingCost,
    kg200Total,
    kg300Cost,
    kg400Total,
    kg500Total,
    kg600Cost,
    basementExcavationCost,
    basementStructureCost,
    basementTotalCost,
    siteExcavationCost,
    permitDesignFee,
    contingencyCost,
    contractorCost,
    constructionSubtotal,
    totalCost,
    mainArea: config.mainArea,
    terraceArea: config.terraceArea,
    balconyArea: config.balconyArea,
    basementArea: config.basementArea,
    basementTypeName: config.basementArea > 0 ? basementType.name : 'None',
    includePool: config.includePool,
    poolSizeName: config.includePool ? poolSizeOption.name : 'None',
    poolArea,
    poolCost,
    siteConditionName: siteCondition.name,
    groundwaterConditionName: groundwaterCondition.name,
    siteAccessibilityName: siteAccessibility.name,
    landscapingArea: config.landscapingArea,
    landscapingCost,
    hvacNames,
    totalHvacCost,
    contingencyPercent,
    contractorPercent: config.contractorPercent,
    utilityConnectionCost,
  };
}
