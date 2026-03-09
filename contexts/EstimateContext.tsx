import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LOCATIONS,
  QUALITY_LEVELS,
  COST_CATEGORIES,
  DEFAULT_CONTRACTOR_PERCENTAGE,
  SITE_CONDITIONS,
  BASEMENT_TYPES,
  LANDSCAPING_BASE_COST_PER_SQM,
  INTERIOR_ADJUSTMENTS,
  INTERIOR_BASELINE,
  HVAC_OPTIONS,
  POOL_SIZE_OPTIONS,
  POOL_QUALITY_OPTIONS,
  POOL_TYPE_OPTIONS,
  POOL_TERRAIN_MULTIPLIERS,
  POOL_MINIMUM_COST,
  DEFAULT_POOL_DEPTH,
  PERMIT_DESIGN_BASELINE_FEE,
  PERMIT_DESIGN_BASELINE_AREA_MAX,
  PERMIT_DESIGN_QUALITY_MULTIPLIERS,
  UTILITY_CONNECTION_OPTIONS,
  CONTINGENCY_PERCENTAGES,
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
import type { CostCategory } from '@/constants/construction';

export interface CategoryCost {
  category: CostCategory;
  cost: number;
  costPerSqm: number;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  locationId: string;
  qualityId: string;
  customCostPerSqm: number | null;
  mainArea: number;
  terraceArea: number;
  balconyArea: number;
  basementArea: number;
  basementTypeId: string;
  includePool: boolean;
  poolSizeId: string;
  poolCustomArea: number;
  poolCustomDepth: number;
  poolQualityId: string;
  poolTypeId: string;
  contractorPercent: number;
  siteConditionId: string;
  landscapingArea: number;
  bathrooms: number;
  wcs: number;
  hvacSelections: Record<string, boolean>;
  utilityConnectionId: string;
  customUtilityCost: number;
  groundwaterConditionId: string;
  siteAccessibilityId: string;
}

const MAX_SCENARIOS = 6;
const STORAGE_KEY_SCENARIOS = '@estimate_scenarios';
const STORAGE_KEY_ACTIVE_INDEX = '@estimate_active_index';

function getNextScenarioName(existingNames: string[]): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < letters.length; i++) {
    const candidate = `Scenario ${letters[i]}`;
    if (!existingNames.includes(candidate)) return candidate;
  }
  return `Scenario ${existingNames.length + 1}`;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 6);
}

function createDefaultConfig(name: string): ScenarioConfig {
  return {
    id: generateId(),
    name,
    locationId: 'corfu',
    qualityId: 'premium',
    customCostPerSqm: null,
    mainArea: 150,
    terraceArea: 30,
    balconyArea: 0,
    basementArea: 0,
    basementTypeId: 'storage',
    includePool: false,
    poolSizeId: 'medium',
    poolCustomArea: 35,
    poolCustomDepth: DEFAULT_POOL_DEPTH,
    poolQualityId: 'standard',
    poolTypeId: 'skimmer',
    contractorPercent: DEFAULT_CONTRACTOR_PERCENTAGE,
    siteConditionId: 'flat_normal',
    landscapingArea: 0,
    bathrooms: 1,
    wcs: 1,
    hvacSelections: {
      underfloor_heating: false,
      solar_thermal: false,
      photovoltaic: false,
    },
    utilityConnectionId: 'standard',
    customUtilityCost: 4000,
    groundwaterConditionId: 'normal',
    siteAccessibilityId: 'normal',
  };
}

async function loadSavedScenarios(): Promise<{ scenarios: ScenarioConfig[]; activeIndex: number } | null> {
  try {
    const [scenariosJson, indexJson] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_SCENARIOS),
      AsyncStorage.getItem(STORAGE_KEY_ACTIVE_INDEX),
    ]);
    if (scenariosJson) {
      const parsed = JSON.parse(scenariosJson) as ScenarioConfig[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const activeIndex = indexJson ? Math.min(parseInt(indexJson, 10) || 0, parsed.length - 1) : 0;
        console.log('[Persistence] Loaded', parsed.length, 'scenarios, active index:', activeIndex);
        return { scenarios: parsed, activeIndex };
      }
    }
  } catch (e) {
    console.log('[Persistence] Error loading scenarios:', e);
  }
  return null;
}

async function saveScenarios(scenarios: ScenarioConfig[], activeIndex: number): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(scenarios)),
      AsyncStorage.setItem(STORAGE_KEY_ACTIVE_INDEX, String(activeIndex)),
    ]);
    console.log('[Persistence] Saved', scenarios.length, 'scenarios, active index:', activeIndex);
  } catch (e) {
    console.log('[Persistence] Error saving scenarios:', e);
  }
}

export const [EstimateProvider, useEstimate] = createContextHook(() => {
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([
    createDefaultConfig('Scenario A'),
  ]);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const hydratedRef = useRef<boolean>(false);
  const savePendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [locationId, setLocationId] = useState<string>('corfu');
  const [qualityId, setQualityId] = useState<string>('premium');
  const [customCostPerSqm, setCustomCostPerSqm] = useState<number | null>(null);
  const [mainArea, setMainArea] = useState<number>(150);
  const [terraceArea, setTerraceArea] = useState<number>(30);
  const [balconyArea, setBalconyArea] = useState<number>(0);
  const [basementArea, setBasementArea] = useState<number>(0);
  const [basementTypeId, setBasementTypeId] = useState<string>('storage');
  const [includePool, setIncludePool] = useState<boolean>(false);
  const [poolSizeId, setPoolSizeId] = useState<string>('medium');
  const [poolCustomArea, setPoolCustomArea] = useState<number>(35);
  const [poolCustomDepth, setPoolCustomDepth] = useState<number>(DEFAULT_POOL_DEPTH);
  const [poolQualityId, setPoolQualityId] = useState<string>('standard');
  const [poolTypeId, setPoolTypeId] = useState<string>('skimmer');
  const [contractorPercent, setContractorPercent] = useState<number>(DEFAULT_CONTRACTOR_PERCENTAGE);
  const [siteConditionId, setSiteConditionId] = useState<string>('flat_normal');
  const [landscapingArea, setLandscapingArea] = useState<number>(0);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [wcs, setWcs] = useState<number>(1);
  const [hvacSelections, setHvacSelections] = useState<Record<string, boolean>>({
    underfloor_heating: false,
    solar_thermal: false,
    photovoltaic: false,
  });
  const [utilityConnectionId, setUtilityConnectionId] = useState<string>('standard');
  const [customUtilityCost, setCustomUtilityCost] = useState<number>(4000);
  const [groundwaterConditionId, setGroundwaterConditionId] = useState<string>('normal');
  const [siteAccessibilityId, setSiteAccessibilityId] = useState<string>('normal');

  const snapshotCurrentState = useCallback((): Omit<ScenarioConfig, 'id' | 'name'> => {
    return {
      locationId,
      qualityId,
      customCostPerSqm,
      mainArea,
      terraceArea,
      balconyArea,
      basementArea,
      basementTypeId,
      includePool,
      poolSizeId,
      poolCustomArea,
      poolCustomDepth,
      poolQualityId,
      poolTypeId,
      contractorPercent,
      siteConditionId,
      landscapingArea,
      bathrooms,
      wcs,
      hvacSelections: { ...hvacSelections },
      utilityConnectionId,
      customUtilityCost,
      groundwaterConditionId,
      siteAccessibilityId,
    };
  }, [
    locationId, qualityId, customCostPerSqm, mainArea, terraceArea, balconyArea,
    basementArea, basementTypeId, includePool, poolSizeId, poolCustomArea,
    poolCustomDepth, poolQualityId, poolTypeId, contractorPercent, siteConditionId,
    landscapingArea, bathrooms, wcs, hvacSelections, utilityConnectionId, customUtilityCost,
    groundwaterConditionId, siteAccessibilityId,
  ]);

  const loadConfig = useCallback((config: ScenarioConfig) => {
    setLocationId(config.locationId);
    setQualityId(config.qualityId);
    setCustomCostPerSqm(config.customCostPerSqm);
    setMainArea(config.mainArea);
    setTerraceArea(config.terraceArea);
    setBalconyArea(config.balconyArea);
    setBasementArea(config.basementArea);
    setBasementTypeId(config.basementTypeId);
    setIncludePool(config.includePool);
    setPoolSizeId(config.poolSizeId);
    setPoolCustomArea(config.poolCustomArea);
    setPoolCustomDepth(config.poolCustomDepth);
    setPoolQualityId(config.poolQualityId);
    setPoolTypeId(config.poolTypeId);
    setContractorPercent(config.contractorPercent);
    setSiteConditionId(config.siteConditionId);
    setLandscapingArea(config.landscapingArea);
    setBathrooms(config.bathrooms);
    setWcs(config.wcs);
    setHvacSelections({ ...config.hvacSelections });
    setUtilityConnectionId(config.utilityConnectionId);
    setCustomUtilityCost(config.customUtilityCost);
    setGroundwaterConditionId(config.groundwaterConditionId);
    setSiteAccessibilityId(config.siteAccessibilityId);
  }, []);

  const activeIndexRef = useRef(activeScenarioIndex);
  activeIndexRef.current = activeScenarioIndex;

  const scenariosRef = useRef(scenarios);
  scenariosRef.current = scenarios;

  const scheduleSave = useCallback((updatedScenarios: ScenarioConfig[], updatedIndex: number) => {
    if (savePendingRef.current) {
      clearTimeout(savePendingRef.current);
    }
    savePendingRef.current = setTimeout(() => {
      void saveScenarios(updatedScenarios, updatedIndex);
      savePendingRef.current = null;
    }, 300);
  }, []);

  const persistState = useCallback(() => {
    if (!hydratedRef.current) return;
    const snapshot = snapshotCurrentState();
    const updated = scenariosRef.current.map((s, i) =>
      i === activeIndexRef.current ? { ...s, ...snapshot } : s
    );
    scheduleSave(updated, activeIndexRef.current);
  }, [snapshotCurrentState, scheduleSave]);

  useEffect(() => {
    void loadSavedScenarios().then((saved) => {
      if (saved) {
        setScenarios(saved.scenarios);
        setActiveScenarioIndex(saved.activeIndex);
        activeIndexRef.current = saved.activeIndex;
        scenariosRef.current = saved.scenarios;
        const target = saved.scenarios[saved.activeIndex];
        if (target) {
          loadConfig(target);
        }
      }
      hydratedRef.current = true;
    });
  }, [loadConfig]);

  useEffect(() => {
    persistState();
  }, [
    locationId, qualityId, customCostPerSqm, mainArea, terraceArea, balconyArea,
    basementArea, basementTypeId, includePool, poolSizeId, poolCustomArea,
    poolCustomDepth, poolQualityId, poolTypeId, contractorPercent, siteConditionId,
    landscapingArea, bathrooms, wcs, hvacSelections, utilityConnectionId, customUtilityCost,
    groundwaterConditionId, siteAccessibilityId, persistState,
  ]);

  const switchScenario = useCallback((index: number) => {
    if (index === activeIndexRef.current) return;
    const snapshot = snapshotCurrentState();
    setScenarios((prev) => {
      const updated = [...prev];
      if (updated[activeIndexRef.current]) {
        updated[activeIndexRef.current] = { ...updated[activeIndexRef.current], ...snapshot };
      }
      const target = updated[index];
      if (target) {
        loadConfig(target);
      }
      scheduleSave(updated, index);
      return updated;
    });
    setActiveScenarioIndex(index);
    activeIndexRef.current = index;
  }, [snapshotCurrentState, loadConfig, scheduleSave]);

  const cloneScenario = useCallback((): boolean => {
    if (scenarios.length >= MAX_SCENARIOS) {
      console.log('Maximum scenarios reached:', MAX_SCENARIOS);
      return false;
    }
    const snapshot = snapshotCurrentState();
    const existingNames = scenarios.map((s) => s.name);
    const newName = getNextScenarioName(existingNames);
    const newConfig: ScenarioConfig = {
      ...snapshot,
      id: generateId(),
      name: newName,
    };

    setScenarios((prev) => {
      const updated = [...prev];
      if (updated[activeIndexRef.current]) {
        updated[activeIndexRef.current] = { ...updated[activeIndexRef.current], ...snapshot };
      }
      return [...updated, newConfig];
    });
    const newIndex = scenarios.length;
    setActiveScenarioIndex(newIndex);
    activeIndexRef.current = newIndex;
    return true;
  }, [scenarios, snapshotCurrentState]);

  const duplicateScenario = useCallback((sourceIndex: number): boolean => {
    if (scenarios.length >= MAX_SCENARIOS) {
      console.log('Maximum scenarios reached:', MAX_SCENARIOS);
      return false;
    }
    const snapshot = snapshotCurrentState();
    const source = sourceIndex === activeIndexRef.current
      ? { ...scenarios[sourceIndex], ...snapshot }
      : scenarios[sourceIndex];
    if (!source) return false;
    const existingNames = scenarios.map((s) => s.name);
    const newName = getNextScenarioName(existingNames);
    const newConfig: ScenarioConfig = {
      ...source,
      id: generateId(),
      name: newName,
      hvacSelections: { ...source.hvacSelections },
    };

    setScenarios((prev) => {
      const updated = [...prev];
      if (updated[activeIndexRef.current]) {
        updated[activeIndexRef.current] = { ...updated[activeIndexRef.current], ...snapshot };
      }
      return [...updated, newConfig];
    });
    loadConfig(newConfig);
    const newIndex = scenarios.length;
    setActiveScenarioIndex(newIndex);
    activeIndexRef.current = newIndex;
    return true;
  }, [scenarios, snapshotCurrentState, loadConfig]);

  const renameScenario = useCallback((index: number, newName: string) => {
    setScenarios((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], name: newName };
      }
      scheduleSave(updated, activeIndexRef.current);
      return updated;
    });
  }, [scheduleSave]);

  const deleteScenario = useCallback((index: number) => {
    if (scenarios.length <= 1) return;
    const snapshot = snapshotCurrentState();
    setScenarios((prev) => {
      const updated = [...prev];
      if (updated[activeIndexRef.current]) {
        updated[activeIndexRef.current] = { ...updated[activeIndexRef.current], ...snapshot };
      }
      updated.splice(index, 1);
      let newActiveIndex = activeIndexRef.current;
      if (index === activeIndexRef.current) {
        newActiveIndex = Math.min(index, updated.length - 1);
        loadConfig(updated[newActiveIndex]);
      } else if (index < activeIndexRef.current) {
        newActiveIndex = activeIndexRef.current - 1;
      }
      setActiveScenarioIndex(newActiveIndex);
      activeIndexRef.current = newActiveIndex;
      scheduleSave(updated, newActiveIndex);
      return updated;
    });
  }, [scenarios.length, snapshotCurrentState, loadConfig, scheduleSave]);

  const location = useMemo(
    () => LOCATIONS.find((l) => l.id === locationId) ?? LOCATIONS[0],
    [locationId],
  );

  const quality = useMemo(
    () => QUALITY_LEVELS.find((q) => q.id === qualityId) ?? QUALITY_LEVELS[1],
    [qualityId],
  );

  const basementType = useMemo(
    () => BASEMENT_TYPES.find((b) => b.id === basementTypeId) ?? BASEMENT_TYPES[0],
    [basementTypeId],
  );

  const effectiveArea = useMemo(
    () => mainArea + terraceArea * 0.5 + balconyArea * 0.30 + basementArea * basementType.costFactor,
    [mainArea, terraceArea, balconyArea, basementArea, basementType],
  );

  const siteCondition = useMemo(
    () => SITE_CONDITIONS.find((s) => s.id === siteConditionId) ?? SITE_CONDITIONS[0],
    [siteConditionId],
  );

  const groundwaterCondition = useMemo(
    () => GROUNDWATER_CONDITIONS.find((g) => g.id === groundwaterConditionId) ?? GROUNDWATER_CONDITIONS[0],
    [groundwaterConditionId],
  );

  const siteAccessibility = useMemo(
    () => SITE_ACCESSIBILITY_OPTIONS.find((a) => a.id === siteAccessibilityId) ?? SITE_ACCESSIBILITY_OPTIONS[0],
    [siteAccessibilityId],
  );

  const siteAccessibilityCost = siteAccessibility.fixedCost;

  const baseCostPerSqm = customCostPerSqm ?? quality.baseCostPerSqm;
  const costPerSqm = Math.round(baseCostPerSqm * location.multiplier);

  const sizeCorrectionFactor = useMemo(
    () => getSizeCorrectionFactor(mainArea),
    [mainArea],
  );

  const correctedCostPerSqm = Math.round(baseCostPerSqm * sizeCorrectionFactor);
  const finalCostPerSqm = Math.round(correctedCostPerSqm * location.multiplier);

  const rawBuildingCost = effectiveArea * finalCostPerSqm;

  const deltaBathrooms = bathrooms - INTERIOR_BASELINE.bathrooms;
  const deltaWcs = wcs - INTERIOR_BASELINE.wcs;

  const categoryCosts = useMemo<CategoryCost[]>(() => {
    return COST_CATEGORIES.map((category) => {
      let categoryCost = Math.round(rawBuildingCost * (category.percentage / 100));

      if (category.id === 'interior') {
        const adj = 1
          + deltaBathrooms * INTERIOR_ADJUSTMENTS.bathroom.interior
          + deltaWcs * INTERIOR_ADJUSTMENTS.wc.interior;
        categoryCost = Math.round(categoryCost * adj);
      }

      if (category.id === 'plumbing') {
        const adj = 1
          + deltaBathrooms * INTERIOR_ADJUSTMENTS.bathroom.plumbing
          + deltaWcs * INTERIOR_ADJUSTMENTS.wc.plumbing;
        categoryCost = Math.round(categoryCost * adj);
      }

      if (category.id === 'furnishings') {
        const adj = 1
          + deltaBathrooms * INTERIOR_ADJUSTMENTS.bathroom.furnishings
          + deltaWcs * INTERIOR_ADJUSTMENTS.wc.furnishings;
        categoryCost = Math.round(categoryCost * adj);
      }

      return {
        category,
        cost: categoryCost,
        costPerSqm: Math.round(categoryCost / (effectiveArea || 1)),
      };
    });
  }, [rawBuildingCost, effectiveArea, deltaBathrooms, deltaWcs]);

  const constructionCost = useMemo(
    () => categoryCosts.reduce((sum, c) => sum + c.cost, 0),
    [categoryCosts],
  );

  const kg300Cost = useMemo(
    () => categoryCosts.filter((c) => (KG300_CATEGORY_IDS as readonly string[]).includes(c.category.id)).reduce((s, c) => s + c.cost, 0),
    [categoryCosts],
  );

  const kg400Cost = useMemo(
    () => categoryCosts.filter((c) => (KG400_CATEGORY_IDS as readonly string[]).includes(c.category.id)).reduce((s, c) => s + c.cost, 0),
    [categoryCosts],
  );

  const kg600Cost = useMemo(
    () => categoryCosts.filter((c) => (KG600_CATEGORY_IDS as readonly string[]).includes(c.category.id)).reduce((s, c) => s + c.cost, 0),
    [categoryCosts],
  );

  const utilityConnectionCost = useMemo(() => {
    if (utilityConnectionId === 'custom') return customUtilityCost;
    const opt = UTILITY_CONNECTION_OPTIONS.find((o) => o.id === utilityConnectionId);
    return opt?.cost ?? 4000;
  }, [utilityConnectionId, customUtilityCost]);

  const basementExcavationCost = useMemo(
    () => getBasementExcavationCost(basementArea, siteCondition, groundwaterCondition),
    [basementArea, siteCondition, groundwaterCondition],
  );

  const basementStructureCost = useMemo(
    () => getBasementStructureCost(basementArea, basementType, groundwaterCondition),
    [basementArea, basementType, groundwaterCondition],
  );

  const basementTotalCost = basementExcavationCost + basementStructureCost;

  const siteExcavationCost = useMemo(
    () => Math.round(mainArea * 15 * siteCondition.terrainMultiplier),
    [mainArea, siteCondition],
  );

  const kg200Total = siteExcavationCost + basementExcavationCost + utilityConnectionCost + siteAccessibilityCost;

  const kg300Total = kg300Cost + basementStructureCost;

  const poolSizeOption = useMemo(
    () => POOL_SIZE_OPTIONS.find((p) => p.id === poolSizeId) ?? POOL_SIZE_OPTIONS[1],
    [poolSizeId],
  );
  const poolQualityOption = useMemo(
    () => POOL_QUALITY_OPTIONS.find((p) => p.id === poolQualityId) ?? POOL_QUALITY_OPTIONS[0],
    [poolQualityId],
  );
  const poolTypeOption = useMemo(
    () => POOL_TYPE_OPTIONS.find((p) => p.id === poolTypeId) ?? POOL_TYPE_OPTIONS[0],
    [poolTypeId],
  );

  const poolArea = poolSizeId === 'custom' ? poolCustomArea : poolSizeOption.area;
  const poolDepth = poolSizeId === 'custom' ? poolCustomDepth : DEFAULT_POOL_DEPTH;

  const poolCost = useMemo(() => {
    if (!includePool) return 0;
    const baseCost = poolQualityOption.baseCostPerSqm;
    const depthFactor = getPoolDepthFactor(poolDepth);
    const typeFactor = poolTypeOption.multiplier;
    const terrainFactor = POOL_TERRAIN_MULTIPLIERS[siteConditionId] ?? 1.00;
    const calculated = poolArea * baseCost * depthFactor * typeFactor * terrainFactor;
    return Math.round(Math.max(calculated, POOL_MINIMUM_COST));
  }, [includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption, siteConditionId]);

  const landscapingCost = useMemo(() => {
    if (landscapingArea <= 0) return 0;
    const baseCost = landscapingArea * LANDSCAPING_BASE_COST_PER_SQM;
    const sizeAdj = 1 + getLandscapingSizeAdjustment(landscapingArea);
    const siteAdj = siteCondition.terrainMultiplier;
    return Math.round(baseCost * sizeAdj * siteAdj);
  }, [landscapingArea, siteCondition]);

  const toggleHvacOption = useCallback((id: string) => {
    setHvacSelections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const mainBuildingArea = useMemo(
    () => mainArea + terraceArea * 0.5,
    [mainArea, terraceArea],
  );

  const hvacCosts = useMemo(() => {
    return HVAC_OPTIONS.map((opt) => ({
      option: opt,
      enabled: hvacSelections[opt.id] ?? false,
      cost: (hvacSelections[opt.id] ?? false) ? Math.round(mainBuildingArea * opt.costPerSqm) : 0,
    }));
  }, [hvacSelections, mainBuildingArea]);

  const totalHvacCost = useMemo(
    () => hvacCosts.reduce((sum, h) => sum + h.cost, 0),
    [hvacCosts],
  );

  const permitDesignEffectiveArea = useMemo(
    () => mainBuildingArea + balconyArea * 0.30 + basementArea * basementType.costFactor,
    [mainBuildingArea, balconyArea, basementArea, basementType],
  );

  const permitDesignFee = useMemo(() => {
    const areaFactor = permitDesignEffectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX
      ? permitDesignEffectiveArea / PERMIT_DESIGN_BASELINE_AREA_MAX
      : 1.0;
    const qualityFactor = PERMIT_DESIGN_QUALITY_MULTIPLIERS[qualityId] ?? 1.0;
    return Math.round(PERMIT_DESIGN_BASELINE_FEE * areaFactor * qualityFactor);
  }, [permitDesignEffectiveArea, qualityId]);

  const kg400Total = kg400Cost + totalHvacCost;

  const kg500Total = poolCost + landscapingCost;

  const constructionSubtotal = useMemo(
    () => kg300Total + kg400Total + kg600Cost,
    [kg300Total, kg400Total, kg600Cost],
  );

  const contingencyPercent = CONTINGENCY_PERCENTAGES[qualityId] ?? 0.10;
  const contingencyCost = Math.round(constructionSubtotal * contingencyPercent);

  const contractorCost = Math.round(constructionSubtotal * (contractorPercent / 100));

  const totalCost = kg200Total
    + constructionSubtotal
    + kg500Total
    + permitDesignFee
    + contingencyCost
    + contractorCost;

  const selectQuality = useCallback((id: string) => {
    setQualityId(id);
    setCustomCostPerSqm(null);
  }, []);

  const canCloneScenario = scenarios.length < MAX_SCENARIOS;

  const resetAllData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_SCENARIOS, STORAGE_KEY_ACTIVE_INDEX]);
      const defaultScenario = createDefaultConfig('Scenario A');
      setScenarios([defaultScenario]);
      setActiveScenarioIndex(0);
      activeIndexRef.current = 0;
      loadConfig(defaultScenario);
      console.log('[Persistence] All data reset');
    } catch (e) {
      console.log('[Persistence] Error resetting data:', e);
    }
  }, [loadConfig]);

  const getAllScenarioConfigs = useCallback((): ScenarioConfig[] => {
    const snapshot = snapshotCurrentState();
    return scenarios.map((s, i) => {
      if (i === activeIndexRef.current) {
        return { ...s, ...snapshot };
      }
      return s;
    });
  }, [scenarios, snapshotCurrentState]);

  return useMemo(() => ({
    locationId,
    setLocationId,
    qualityId,
    selectQuality,
    siteConditionId,
    setSiteConditionId,
    siteCondition,
    landscapingArea,
    setLandscapingArea,
    landscapingCost,
    bathrooms,
    setBathrooms,
    wcs,
    setWcs,
    hvacSelections,
    toggleHvacOption,
    hvacCosts,
    totalHvacCost,
    customCostPerSqm,
    setCustomCostPerSqm,
    mainArea,
    setMainArea,
    terraceArea,
    setTerraceArea,
    balconyArea,
    setBalconyArea,
    basementArea,
    setBasementArea,
    basementTypeId,
    setBasementTypeId,
    basementType,
    includePool,
    setIncludePool,
    poolSizeId,
    setPoolSizeId,
    poolSizeOption,
    poolCustomArea,
    setPoolCustomArea,
    poolCustomDepth,
    setPoolCustomDepth,
    poolQualityId,
    setPoolQualityId,
    poolQualityOption,
    poolTypeId,
    setPoolTypeId,
    poolTypeOption,
    poolArea,
    poolDepth,
    contractorPercent,
    setContractorPercent,
    location,
    quality,
    effectiveArea,
    baseCostPerSqm,
    costPerSqm,
    sizeCorrectionFactor,
    correctedCostPerSqm,
    finalCostPerSqm,
    constructionCost,
    categoryCosts,
    contractorCost,
    poolCost,
    permitDesignFee,
    totalCost,
    utilityConnectionId,
    setUtilityConnectionId,
    customUtilityCost,
    setCustomUtilityCost,
    utilityConnectionCost,
    groundwaterConditionId,
    setGroundwaterConditionId,
    groundwaterCondition,
    siteAccessibilityId,
    setSiteAccessibilityId,
    siteAccessibility,
    siteAccessibilityCost,
    kg200Total,
    kg300Cost,
    kg300Total,
    kg400Cost,
    kg400Total,
    kg500Total,
    kg600Cost,
    constructionSubtotal,
    contingencyPercent,
    contingencyCost,
    mainBuildingArea,
    permitDesignEffectiveArea,
    basementExcavationCost,
    basementStructureCost,
    basementTotalCost,
    siteExcavationCost,
    scenarios,
    activeScenarioIndex,
    switchScenario,
    cloneScenario,
    duplicateScenario,
    renameScenario,
    deleteScenario,
    canCloneScenario,
    getAllScenarioConfigs,
    resetAllData,
  }), [
    locationId, setLocationId, qualityId, selectQuality,
    siteConditionId, setSiteConditionId, siteCondition,
    landscapingArea, setLandscapingArea, landscapingCost,
    bathrooms, setBathrooms, wcs, setWcs,
    hvacSelections, toggleHvacOption, hvacCosts, totalHvacCost,
    customCostPerSqm, setCustomCostPerSqm,
    mainArea, setMainArea, terraceArea, setTerraceArea,
    balconyArea, setBalconyArea,
    basementArea, setBasementArea, basementTypeId, setBasementTypeId, basementType,
    includePool, setIncludePool,
    poolSizeId, setPoolSizeId, poolSizeOption,
    poolCustomArea, setPoolCustomArea, poolCustomDepth, setPoolCustomDepth,
    poolQualityId, setPoolQualityId, poolQualityOption,
    poolTypeId, setPoolTypeId, poolTypeOption,
    poolArea, poolDepth,
    contractorPercent, setContractorPercent,
    location, quality, effectiveArea, baseCostPerSqm, costPerSqm,
    sizeCorrectionFactor, correctedCostPerSqm, finalCostPerSqm,
    constructionCost, categoryCosts, contractorCost, poolCost, permitDesignFee, totalCost,
    utilityConnectionId, setUtilityConnectionId, customUtilityCost, setCustomUtilityCost, utilityConnectionCost,
    groundwaterConditionId, setGroundwaterConditionId, groundwaterCondition,
    siteAccessibilityId, setSiteAccessibilityId, siteAccessibility, siteAccessibilityCost,
    kg200Total, kg300Cost, kg300Total, kg400Cost, kg400Total, kg500Total, kg600Cost,
    constructionSubtotal, contingencyPercent, contingencyCost, mainBuildingArea, permitDesignEffectiveArea,
    basementExcavationCost, basementStructureCost, basementTotalCost, siteExcavationCost,
    scenarios, activeScenarioIndex, switchScenario, cloneScenario, duplicateScenario, renameScenario, deleteScenario, canCloneScenario,
    getAllScenarioConfigs, resetAllData,
  ]);
});
