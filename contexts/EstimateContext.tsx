import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Kg300SubgroupCosts } from '@/calculator-engine/modules/categoryCosts';
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
  BASE_GROUP_SHARE_KG200,
  BASE_GROUP_SHARE_KG300,
  BASE_GROUP_SHARE_KG400,
  PREMIUM_BENCHMARK_BASE_COST_PER_SQM,
  KG300_CATEGORY_IDS,
  KG400_CATEGORY_IDS,
  KG600_CATEGORY_IDS,
  clampSitePreparationMultiplier,
  getSizeCorrectionFactor,
  getBasementExcavationCost,
  getLandscapingSizeAdjustment,
  getPoolDepthFactor,
  getPlotSizeFactor,
  getUtilityConnectionGroupCosts,
  KG600_KITCHEN_PACKAGE_BASE_COST,
  KG600_WARDROBE_PACKAGE_BASE_COST,
  KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT,
  KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST,
  KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST,
  KG400_BEDROOM_DELTA_BASE_COST,
  KG400_BATHROOM_DELTA_BASE_COST,
  KG400_WC_DELTA_BASE_COST,
  getKitchenAreaFactor,
  getResidentialProgramBaseline,
  getSuggestedGeneralFurnitureBaseAmount,
} from '@/constants/construction';
import type { CostCategory } from '@/constants/construction';

export interface CategoryCost {
  category: CostCategory;
  cost: number;
  costPerSqm: number;
}

type ProgramCountMode = 'auto' | 'manual';

export interface ScenarioConfig {
  id: string;
  name: string;
  locationId: string;
  qualityId: string;
  customCostPerSqm: number | null;
  plotSize: number;
  mainArea: number;
  terraceArea: number;
  balconyArea: number;
  basementArea?: number;
  basementTypeId?: string;
  storageBasementArea: number;
  parkingBasementArea: number;
  habitableBasementArea: number;
  includePool: boolean;
  poolSizeId: string;
  poolCustomArea: number;
  poolCustomDepth: number;
  poolQualityId: string;
  poolTypeId: string;
  contractorPercent: number;
  siteConditionId: string;
  landscapingArea: number;
  landValue: number;
  landAcquisitionCosts: number;
  landAcquisitionCostsMode: 'auto' | 'manual';
  bathrooms?: number;
  wcs?: number;
  bedroomCount?: number;
  bathroomsMode?: ProgramCountMode;
  bathroomsManualValue?: number | null;
  wcsMode?: ProgramCountMode;
  wcsManualValue?: number | null;
  bedroomCountMode?: ProgramCountMode;
  bedroomCountManualValue?: number | null;
  kitchenCount: number;
  kitchenCountCustomized?: boolean;
  customKitchenUnitCost: number | null;
  generalFurnitureBaseAmount: number;
  generalFurnitureBaseAmountCustomized?: boolean;
  hvacSelections: Record<string, boolean>;
  utilityConnectionId: string;
  customUtilityCost: number;
  groundwaterConditionId: string;
  siteAccessibilityId: string;
}

const DEFAULT_LAND_ACQUISITION_PERCENTAGE = 0.06;
const KG300_PLUS_KG400_BASE_SHARE = BASE_GROUP_SHARE_KG300 + BASE_GROUP_SHARE_KG400;

const KG300_BASE_FLEXIBLE_SHARES: Record<string, {
  subgroup330Share: number;
  subgroup340Share: number;
  subgroup350Share: number;
  subgroup360Share: number;
  subgroup390Share: number;
}> = {
  standard: {
    subgroup330Share: 0.495,
    subgroup340Share: 0.243,
    subgroup350Share: 0.10,
    subgroup360Share: 0.117,
    subgroup390Share: 0.045,
  },
  premium: {
    subgroup330Share: 0.54,
    subgroup340Share: 0.216,
    subgroup350Share: 0.10,
    subgroup360Share: 0.099,
    subgroup390Share: 0.045,
  },
  luxury: {
    subgroup330Share: 0.567,
    subgroup340Share: 0.189,
    subgroup350Share: 0.10,
    subgroup360Share: 0.099,
    subgroup390Share: 0.045,
  },
};

const KG300_ACCESSIBILITY_WEIGHTS = {
  subgroup310: 0.60,
  subgroup320: 1.00,
  subgroup330: 0.45,
  subgroup340: 0.60,
  subgroup350: 0.60,
  subgroup360: 0.25,
  subgroup390: 0.20,
} as const;

const BASE_SITE_CONDITION_FACTORS_310: Record<string, number> = {
  flat_normal: 1.00,
  flat_rocky: 1.08,
  inclined_normal: 1.06,
  inclined_rocky: 1.15,
  inclined_sandy: 1.18,
};

const BASE_SITE_CONDITION_FACTORS_320: Record<string, number> = {
  flat_normal: 1.00,
  flat_rocky: 1.03,
  inclined_normal: 1.02,
  inclined_rocky: 1.08,
  inclined_sandy: 1.10,
};

const BASE_GROUNDWATER_FACTORS_310: Record<string, number> = {
  normal: 1.00,
  moderate: 1.02,
  high: 1.05,
};

const BASE_GROUNDWATER_FACTORS_320: Record<string, number> = {
  normal: 1.00,
  moderate: 1.06,
  high: 1.15,
};

const BASEMENT_SITE_CONDITION_FACTORS: Record<string, number> = {
  flat_normal: 1.00,
  flat_rocky: 1.05,
  inclined_normal: 1.10,
  inclined_rocky: 1.12,
  inclined_sandy: 1.15,
};

const BASEMENT_GROUNDWATER_FACTORS: Record<string, number> = {
  normal: 1.00,
  moderate: 1.04,
  high: 1.10,
};

const BASEMENT_GROUNDWATER_FACTORS_320: Record<string, number> = {
  normal: 1.00,
  moderate: 1.08,
  high: 1.18,
};

const HVAC_HEATING_QUALITY_MULTIPLIERS: Record<string, number> = {
  standard: 1.00,
  premium: 1.12,
  luxury: 1.25,
};

const HVAC_PV_QUALITY_MULTIPLIERS: Record<string, number> = {
  standard: 1.00,
  premium: 1.07,
  luxury: 1.12,
};

function getAdjustedKg300Share(weightedBasementRatio: number): number {
  if (weightedBasementRatio <= 0) return BASE_GROUP_SHARE_KG300;
  if (weightedBasementRatio <= 0.15) return 0.645;
  if (weightedBasementRatio <= 0.30) return 0.65;
  if (weightedBasementRatio <= 0.50) return 0.66;
  return 0.675;
}

function getAutoEstimatedLandAcquisitionCosts(landValue: number): number {
  return landValue * DEFAULT_LAND_ACQUISITION_PERCENTAGE;
}

function getWeightedBasementAreaForProgramDefaults(
  storageBasementArea: number,
  parkingBasementArea: number,
  habitableBasementArea: number,
): number {
  const storageBasementType = BASEMENT_TYPES.find((b) => b.id === 'storage') ?? BASEMENT_TYPES[0];
  const parkingBasementType = BASEMENT_TYPES.find((b) => b.id === 'parking') ?? BASEMENT_TYPES[0];
  const habitableBasementType = BASEMENT_TYPES.find((b) => b.id === 'habitable') ?? BASEMENT_TYPES[0];

  return storageBasementArea * storageBasementType.costFactor
    + parkingBasementArea * parkingBasementType.costFactor
    + habitableBasementArea * habitableBasementType.costFactor;
}

function getProgramDefaultEffectiveArea(config: Partial<ScenarioConfig>): number {
  return (config.mainArea ?? 0)
    + (config.terraceArea ?? 0) * 0.5
    + (config.balconyArea ?? 0) * 0.30
    + getWeightedBasementAreaForProgramDefaults(
      config.storageBasementArea ?? 0,
      config.parkingBasementArea ?? 0,
      config.habitableBasementArea ?? 0,
    );
}

function normalizeScenarioConfig(config: ScenarioConfig): ScenarioConfig {
  const landValue = config.landValue ?? 0;
  const plotSize = config.plotSize ?? 4000;
  const legacyBasementArea = config.basementArea ?? 0;
  const legacyBasementTypeId = config.basementTypeId ?? 'storage';
  const hasMixedBasementAreas =
    config.storageBasementArea !== undefined ||
    config.parkingBasementArea !== undefined ||
    config.habitableBasementArea !== undefined;
  const storageBasementArea = hasMixedBasementAreas
    ? (config.storageBasementArea ?? 0)
    : (legacyBasementTypeId === 'storage' ? legacyBasementArea : 0);
  const parkingBasementArea = hasMixedBasementAreas
    ? (config.parkingBasementArea ?? 0)
    : (legacyBasementTypeId === 'parking' ? legacyBasementArea : 0);
  const habitableBasementArea = hasMixedBasementAreas
    ? (config.habitableBasementArea ?? 0)
    : (legacyBasementTypeId === 'habitable' ? legacyBasementArea : 0);
  const basementArea = storageBasementArea + parkingBasementArea + habitableBasementArea;
  const landAcquisitionCostsMode = config.landAcquisitionCostsMode ?? 'auto';
  const landAcquisitionCosts = landAcquisitionCostsMode === 'auto'
    ? getAutoEstimatedLandAcquisitionCosts(landValue)
    : (config.landAcquisitionCosts ?? 0);
  const defaultEffectiveArea = getProgramDefaultEffectiveArea({
    ...config,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
  });
  const defaultProgramBaseline = getResidentialProgramBaseline(defaultEffectiveArea);
  const bathroomsMode = config.bathroomsMode ?? 'auto';
  const bathroomsManualValue = bathroomsMode === 'manual'
    ? Math.max(0, config.bathroomsManualValue ?? config.bathrooms ?? defaultProgramBaseline.bathrooms)
    : null;
  const wcsMode = config.wcsMode ?? 'auto';
  const wcsManualValue = wcsMode === 'manual'
    ? Math.max(0, config.wcsManualValue ?? config.wcs ?? defaultProgramBaseline.wcs)
    : null;
  const bedroomCountMode = config.bedroomCountMode ?? 'auto';
  const bedroomCountManualValue = bedroomCountMode === 'manual'
    ? Math.max(1, config.bedroomCountManualValue ?? config.bedroomCount ?? defaultProgramBaseline.bedrooms)
    : null;
  const kitchenCountCustomized = config.kitchenCountCustomized ?? (
    config.kitchenCount !== undefined && config.kitchenCount !== 1
  );
  const bathrooms = bathroomsMode === 'manual'
    ? (bathroomsManualValue ?? defaultProgramBaseline.bathrooms)
    : defaultProgramBaseline.bathrooms;
  const wcs = wcsMode === 'manual'
    ? (wcsManualValue ?? defaultProgramBaseline.wcs)
    : defaultProgramBaseline.wcs;
  const bedroomCount = bedroomCountMode === 'manual'
    ? (bedroomCountManualValue ?? defaultProgramBaseline.bedrooms)
    : defaultProgramBaseline.bedrooms;
  const kitchenCount = kitchenCountCustomized
    ? (config.kitchenCount ?? 0)
    : 0;
  const customKitchenUnitCost = config.customKitchenUnitCost ?? null;
  const suggestedGeneralFurnitureBaseAmount = getSuggestedGeneralFurnitureBaseAmount(defaultEffectiveArea, bedroomCount);
  const generalFurnitureBaseAmountCustomized = config.generalFurnitureBaseAmountCustomized ?? (
    config.generalFurnitureBaseAmount !== undefined &&
    config.generalFurnitureBaseAmount !== 0 &&
    config.generalFurnitureBaseAmount !== 5000
  );
  const generalFurnitureBaseAmount = generalFurnitureBaseAmountCustomized
    ? (config.generalFurnitureBaseAmount ?? suggestedGeneralFurnitureBaseAmount)
    : suggestedGeneralFurnitureBaseAmount;

  return {
    ...config,
    plotSize,
    basementArea,
    basementTypeId: basementArea > 0 ? legacyBasementTypeId : 'storage',
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    landValue,
    landAcquisitionCosts,
    landAcquisitionCostsMode,
    bathrooms,
    wcs,
    bedroomCount,
    bathroomsMode,
    bathroomsManualValue,
    wcsMode,
    wcsManualValue,
    bedroomCountMode,
    bedroomCountManualValue,
    kitchenCount,
    kitchenCountCustomized,
    customKitchenUnitCost,
    generalFurnitureBaseAmount,
    generalFurnitureBaseAmountCustomized,
  };
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
  const defaultEffectiveArea = getProgramDefaultEffectiveArea({
    mainArea: 150,
    terraceArea: 30,
    balconyArea: 0,
    storageBasementArea: 0,
    parkingBasementArea: 0,
    habitableBasementArea: 0,
  });
  const defaultProgramBaseline = getResidentialProgramBaseline(defaultEffectiveArea);
  return {
    id: generateId(),
    name,
    locationId: 'corfu',
    qualityId: 'premium',
    customCostPerSqm: null,
    plotSize: 4000,
    mainArea: 150,
    terraceArea: 30,
    balconyArea: 0,
    basementArea: 0,
    basementTypeId: 'storage',
    storageBasementArea: 0,
    parkingBasementArea: 0,
    habitableBasementArea: 0,
    includePool: false,
    poolSizeId: 'medium',
    poolCustomArea: 35,
    poolCustomDepth: DEFAULT_POOL_DEPTH,
    poolQualityId: 'standard',
    poolTypeId: 'skimmer',
    contractorPercent: DEFAULT_CONTRACTOR_PERCENTAGE,
    siteConditionId: 'flat_normal',
    landscapingArea: 0,
    landValue: 0,
    landAcquisitionCosts: 0,
    landAcquisitionCostsMode: 'auto',
    bathrooms: defaultProgramBaseline.bathrooms,
    wcs: defaultProgramBaseline.wcs,
    bedroomCount: defaultProgramBaseline.bedrooms,
    bathroomsMode: 'auto',
    bathroomsManualValue: null,
    wcsMode: 'auto',
    wcsManualValue: null,
    bedroomCountMode: 'auto',
    bedroomCountManualValue: null,
    kitchenCount: 0,
    kitchenCountCustomized: false,
    customKitchenUnitCost: null,
    generalFurnitureBaseAmount: getSuggestedGeneralFurnitureBaseAmount(defaultEffectiveArea, defaultProgramBaseline.bedrooms),
    generalFurnitureBaseAmountCustomized: false,
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
      const parsed = (JSON.parse(scenariosJson) as ScenarioConfig[]).map(normalizeScenarioConfig);
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
  const initialProgramDefaultEffectiveArea = getProgramDefaultEffectiveArea({
    mainArea: 150,
    terraceArea: 30,
    balconyArea: 0,
    storageBasementArea: 0,
    parkingBasementArea: 0,
    habitableBasementArea: 0,
  });
  const initialResidentialProgramBaseline = getResidentialProgramBaseline(initialProgramDefaultEffectiveArea);
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([
    createDefaultConfig('Scenario A'),
  ]);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const hydratedRef = useRef<boolean>(false);
  const savePendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [locationId, setLocationId] = useState<string>('corfu');
  const [qualityId, setQualityId] = useState<string>('premium');
  const [customCostPerSqm, setCustomCostPerSqm] = useState<number | null>(null);
  const [plotSize, setPlotSize] = useState<number>(4000);
  const [mainArea, setMainArea] = useState<number>(150);
  const [terraceArea, setTerraceArea] = useState<number>(30);
  const [balconyArea, setBalconyArea] = useState<number>(0);
  const [storageBasementArea, setStorageBasementArea] = useState<number>(0);
  const [parkingBasementArea, setParkingBasementArea] = useState<number>(0);
  const [habitableBasementArea, setHabitableBasementArea] = useState<number>(0);
  const [includePool, setIncludePool] = useState<boolean>(false);
  const [poolSizeId, setPoolSizeId] = useState<string>('medium');
  const [poolCustomArea, setPoolCustomArea] = useState<number>(35);
  const [poolCustomDepth, setPoolCustomDepth] = useState<number>(DEFAULT_POOL_DEPTH);
  const [poolQualityId, setPoolQualityId] = useState<string>('standard');
  const [poolTypeId, setPoolTypeId] = useState<string>('skimmer');
  const [contractorPercent, setContractorPercent] = useState<number>(DEFAULT_CONTRACTOR_PERCENTAGE);
  const [siteConditionId, setSiteConditionId] = useState<string>('flat_normal');
  const [landscapingArea, setLandscapingArea] = useState<number>(0);
  const [landValue, setLandValue] = useState<number>(0);
  const [landAcquisitionCosts, setLandAcquisitionCosts] = useState<number>(0);
  const [landAcquisitionCostsMode, setLandAcquisitionCostsMode] = useState<'auto' | 'manual'>('auto');
  const [bathroomsMode, setBathroomsMode] = useState<ProgramCountMode>('auto');
  const [bathroomsManualValue, setBathroomsManualValue] = useState<number | null>(null);
  const [wcsMode, setWcsMode] = useState<ProgramCountMode>('auto');
  const [wcsManualValue, setWcsManualValue] = useState<number | null>(null);
  const [bedroomCountMode, setBedroomCountMode] = useState<ProgramCountMode>('auto');
  const [bedroomCountManualValue, setBedroomCountManualValue] = useState<number | null>(null);
  const [kitchenCount, setKitchenCountState] = useState<number>(0);
  const [kitchenCountCustomized, setKitchenCountCustomized] = useState<boolean>(false);
  const [customKitchenUnitCost, setCustomKitchenUnitCost] = useState<number | null>(null);
  const [generalFurnitureBaseAmount, setGeneralFurnitureBaseAmountState] = useState<number>(
    getSuggestedGeneralFurnitureBaseAmount(initialProgramDefaultEffectiveArea, initialResidentialProgramBaseline.bedrooms)
  );
  const [generalFurnitureBaseAmountCustomized, setGeneralFurnitureBaseAmountCustomized] = useState<boolean>(false);
  const [hvacSelections, setHvacSelections] = useState<Record<string, boolean>>({
    underfloor_heating: false,
    solar_thermal: false,
    photovoltaic: false,
  });
  const [utilityConnectionId, setUtilityConnectionId] = useState<string>('standard');
  const [customUtilityCost, setCustomUtilityCost] = useState<number>(4000);
  const [groundwaterConditionId, setGroundwaterConditionId] = useState<string>('normal');
  const [siteAccessibilityId, setSiteAccessibilityId] = useState<string>('normal');
  const effectiveArea = useMemo(
    () => mainArea + terraceArea * 0.5 + balconyArea * 0.30 + getWeightedBasementAreaForProgramDefaults(
      storageBasementArea,
      parkingBasementArea,
      habitableBasementArea,
    ),
    [mainArea, terraceArea, balconyArea, storageBasementArea, parkingBasementArea, habitableBasementArea],
  );
  const residentialProgramBaseline = getResidentialProgramBaseline(effectiveArea);
  const bathrooms = bathroomsMode === 'manual'
    ? Math.max(0, bathroomsManualValue ?? residentialProgramBaseline.bathrooms)
    : residentialProgramBaseline.bathrooms;
  const wcs = wcsMode === 'manual'
    ? Math.max(0, wcsManualValue ?? residentialProgramBaseline.wcs)
    : residentialProgramBaseline.wcs;
  const bedroomCount = bedroomCountMode === 'manual'
    ? Math.max(1, bedroomCountManualValue ?? residentialProgramBaseline.bedrooms)
    : residentialProgramBaseline.bedrooms;

  const snapshotCurrentState = useCallback((): Omit<ScenarioConfig, 'id' | 'name'> => {
    return {
      locationId,
      qualityId,
      customCostPerSqm,
      plotSize,
      mainArea,
      terraceArea,
      balconyArea,
      basementArea: storageBasementArea + parkingBasementArea + habitableBasementArea,
      basementTypeId: 'storage',
      storageBasementArea,
      parkingBasementArea,
      habitableBasementArea,
      includePool,
      poolSizeId,
      poolCustomArea,
      poolCustomDepth,
      poolQualityId,
      poolTypeId,
      contractorPercent,
      siteConditionId,
      landscapingArea,
      landValue,
      landAcquisitionCosts: landAcquisitionCostsMode === 'auto'
        ? getAutoEstimatedLandAcquisitionCosts(landValue)
        : landAcquisitionCosts,
      landAcquisitionCostsMode,
      bathrooms: bathroomsMode === 'manual' ? bathrooms : undefined,
      wcs: wcsMode === 'manual' ? wcs : undefined,
      bedroomCount: bedroomCountMode === 'manual' ? bedroomCount : undefined,
      bathroomsMode,
      bathroomsManualValue: bathroomsMode === 'manual' ? bathrooms : null,
      wcsMode,
      wcsManualValue: wcsMode === 'manual' ? wcs : null,
      bedroomCountMode,
      bedroomCountManualValue: bedroomCountMode === 'manual' ? bedroomCount : null,
      kitchenCount,
      kitchenCountCustomized,
      customKitchenUnitCost,
      generalFurnitureBaseAmount,
      generalFurnitureBaseAmountCustomized,
      hvacSelections: { ...hvacSelections },
      utilityConnectionId,
      customUtilityCost,
      groundwaterConditionId,
      siteAccessibilityId,
    };
  }, [
    locationId, qualityId, customCostPerSqm, plotSize, mainArea, terraceArea, balconyArea,
    storageBasementArea, parkingBasementArea, habitableBasementArea, includePool, poolSizeId, poolCustomArea,
    poolCustomDepth, poolQualityId, poolTypeId, contractorPercent, siteConditionId,
    landscapingArea, landValue, landAcquisitionCosts, landAcquisitionCostsMode,
    bathrooms, wcs, bedroomCount, bathroomsMode, bathroomsManualValue, wcsMode, wcsManualValue, bedroomCountMode, bedroomCountManualValue,
    kitchenCount, kitchenCountCustomized, customKitchenUnitCost, generalFurnitureBaseAmount, generalFurnitureBaseAmountCustomized,
    hvacSelections, utilityConnectionId, customUtilityCost,
    groundwaterConditionId, siteAccessibilityId,
  ]);

  const loadConfig = useCallback((config: ScenarioConfig) => {
    const normalizedConfig = normalizeScenarioConfig(config);
    setLocationId(config.locationId);
    setQualityId(config.qualityId);
    setCustomCostPerSqm(config.customCostPerSqm);
    setPlotSize(config.plotSize ?? 4000);
    setMainArea(config.mainArea);
    setTerraceArea(config.terraceArea);
    setBalconyArea(config.balconyArea);
    setStorageBasementArea(normalizedConfig.storageBasementArea);
    setParkingBasementArea(normalizedConfig.parkingBasementArea);
    setHabitableBasementArea(normalizedConfig.habitableBasementArea);
    setIncludePool(config.includePool);
    setPoolSizeId(config.poolSizeId);
    setPoolCustomArea(config.poolCustomArea);
    setPoolCustomDepth(config.poolCustomDepth);
    setPoolQualityId(config.poolQualityId);
    setPoolTypeId(config.poolTypeId);
    setContractorPercent(config.contractorPercent);
    setSiteConditionId(config.siteConditionId);
    setLandscapingArea(config.landscapingArea);
    setLandValue(normalizedConfig.landValue);
    setLandAcquisitionCosts(normalizedConfig.landAcquisitionCosts);
    setLandAcquisitionCostsMode(normalizedConfig.landAcquisitionCostsMode);
    setBathroomsMode(normalizedConfig.bathroomsMode ?? 'auto');
    setBathroomsManualValue(normalizedConfig.bathroomsManualValue ?? null);
    setWcsMode(normalizedConfig.wcsMode ?? 'auto');
    setWcsManualValue(normalizedConfig.wcsManualValue ?? null);
    setBedroomCountMode(normalizedConfig.bedroomCountMode ?? 'auto');
    setBedroomCountManualValue(normalizedConfig.bedroomCountManualValue ?? null);
    setKitchenCountState(normalizedConfig.kitchenCount);
    setKitchenCountCustomized(normalizedConfig.kitchenCountCustomized ?? false);
    setCustomKitchenUnitCost(normalizedConfig.customKitchenUnitCost);
    setGeneralFurnitureBaseAmountState(normalizedConfig.generalFurnitureBaseAmount);
    setGeneralFurnitureBaseAmountCustomized(normalizedConfig.generalFurnitureBaseAmountCustomized ?? false);
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
    if (landAcquisitionCostsMode !== 'auto') return;
    setLandAcquisitionCosts(getAutoEstimatedLandAcquisitionCosts(landValue));
  }, [landValue, landAcquisitionCostsMode]);

  useEffect(() => {
    persistState();
  }, [
    locationId, qualityId, customCostPerSqm, plotSize, mainArea, terraceArea, balconyArea,
    storageBasementArea, parkingBasementArea, habitableBasementArea, includePool, poolSizeId, poolCustomArea,
    poolCustomDepth, poolQualityId, poolTypeId, contractorPercent, siteConditionId,
    landscapingArea, landValue, landAcquisitionCosts, landAcquisitionCostsMode,
    bathrooms, wcs, bedroomCount, kitchenCount, customKitchenUnitCost, generalFurnitureBaseAmount,
    hvacSelections, utilityConnectionId, customUtilityCost,
    groundwaterConditionId, siteAccessibilityId, persistState,
  ]);

  const switchScenario = useCallback((index: number) => {
    if (index === activeIndexRef.current) return;
    const snapshot = snapshotCurrentState();
    setScenarios((prev) => {
      const updated = [...prev];
      if (updated[activeIndexRef.current]) {
        updated[activeIndexRef.current] = normalizeScenarioConfig({ ...updated[activeIndexRef.current], ...snapshot });
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
        updated[activeIndexRef.current] = normalizeScenarioConfig({ ...updated[activeIndexRef.current], ...snapshot });
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
      ? normalizeScenarioConfig({ ...scenarios[sourceIndex], ...snapshot })
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
        updated[activeIndexRef.current] = normalizeScenarioConfig({ ...updated[activeIndexRef.current], ...snapshot });
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
        updated[activeIndexRef.current] = normalizeScenarioConfig({ ...updated[activeIndexRef.current], ...snapshot });
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

  const basementArea = storageBasementArea + parkingBasementArea + habitableBasementArea;

  const weightedBasementArea = useMemo(() => {
    const storageBasementType = BASEMENT_TYPES.find((b) => b.id === 'storage') ?? BASEMENT_TYPES[0];
    const parkingBasementType = BASEMENT_TYPES.find((b) => b.id === 'parking') ?? BASEMENT_TYPES[0];
    const habitableBasementType = BASEMENT_TYPES.find((b) => b.id === 'habitable') ?? BASEMENT_TYPES[0];
    return storageBasementArea * storageBasementType.costFactor
      + parkingBasementArea * parkingBasementType.costFactor
      + habitableBasementArea * habitableBasementType.costFactor;
  }, [storageBasementArea, parkingBasementArea, habitableBasementArea]);

  const basementType = useMemo(() => {
    const activeTypes = [
      storageBasementArea > 0 ? 'storage' : null,
      parkingBasementArea > 0 ? 'parking' : null,
      habitableBasementArea > 0 ? 'habitable' : null,
    ].filter(Boolean) as string[];

    if (activeTypes.length === 1) {
      return BASEMENT_TYPES.find((b) => b.id === activeTypes[0]) ?? BASEMENT_TYPES[0];
    }

    const weightedCostFactor = basementArea > 0 ? weightedBasementArea / basementArea : 0.50;
    return {
      id: 'mixed',
      name: activeTypes.length > 1 ? 'Mixed basement' : 'Storage / technical',
      description: activeTypes.length > 1
        ? 'Combination of storage, parking, and/or habitable basement areas'
        : 'Storage, technical rooms, or utility spaces',
      costFactor: weightedCostFactor,
      structureCostPerSqm: 0,
    };
  }, [storageBasementArea, parkingBasementArea, habitableBasementArea, basementArea, weightedBasementArea]);

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

  const group240Cost = 0;
  const group250Cost = 0;
  const siteAccessibilityCost = group250Cost;

  const baseCostPerSqm = customCostPerSqm ?? quality.baseCostPerSqm;
  const costPerSqm = Math.round(baseCostPerSqm * location.multiplier);
  const benchmarkBaseCostPerSqm = customCostPerSqm ?? PREMIUM_BENCHMARK_BASE_COST_PER_SQM;

  const sizeCorrectionFactor = useMemo(
    () => getSizeCorrectionFactor(mainArea),
    [mainArea],
  );

  const correctedCostPerSqm = Math.round(baseCostPerSqm * sizeCorrectionFactor);
  const finalCostPerSqm = Math.round(correctedCostPerSqm * location.multiplier);
  const premiumReferenceCorrectedCostPerSqm = Math.round(PREMIUM_BENCHMARK_BASE_COST_PER_SQM * sizeCorrectionFactor);
  const premiumReferenceFinalCostPerSqm = Math.round(premiumReferenceCorrectedCostPerSqm * location.multiplier);
  const benchmarkCorrectedCostPerSqm = Math.round(benchmarkBaseCostPerSqm * sizeCorrectionFactor);
  const benchmarkFinalCostPerSqm = Math.round(benchmarkCorrectedCostPerSqm * location.multiplier);
  const noBasementEffectiveArea = mainArea + terraceArea * 0.5 + balconyArea * 0.30;

  const baseConstructionCost = effectiveArea * finalCostPerSqm;
  const benchmarkConstructionCost = effectiveArea * benchmarkFinalCostPerSqm;
  const noBasementConstructionCost = noBasementEffectiveArea * finalCostPerSqm;
  const premiumReferenceConstructionCost = effectiveArea * premiumReferenceFinalCostPerSqm;
  const weightedBasementRatio = weightedBasementArea / Math.max(mainArea, 1);
  const adjustedKg300Share = BASE_GROUP_SHARE_KG300;
  const adjustedKg400Share = BASE_GROUP_SHARE_KG400;
  const kg200Base = Math.round(baseConstructionCost * BASE_GROUP_SHARE_KG200);
  const kg300Base = Math.round(baseConstructionCost * adjustedKg300Share);
  const kg400Base = Math.round(baseConstructionCost * adjustedKg400Share);
  const accessibilityExecutionDelta = Math.max(0, siteAccessibility.sitePreparationFactor - 1);
  const kg300AccessibilityMultiplier = 1 + accessibilityExecutionDelta * 0.35;
  const kg400AccessibilityMultiplier = 1 + accessibilityExecutionDelta * 0.22;
  const interiorDeltaBathrooms = bathrooms - INTERIOR_BASELINE.bathrooms;
  const interiorDeltaWcs = wcs - INTERIOR_BASELINE.wcs;
  const qualityPackageMultiplier = quality.benchmarkFactor;
  const bedroomDelta = bedroomCount - residentialProgramBaseline.bedrooms;
  const bathroomDelta = bathrooms - residentialProgramBaseline.bathrooms;
  const wcDelta = wcs - residentialProgramBaseline.wcs;
  const kg400BedroomDeltaCost = Math.round(bedroomDelta * KG400_BEDROOM_DELTA_BASE_COST * qualityPackageMultiplier);
  const kg400BathroomDeltaCost = Math.round(bathroomDelta * KG400_BATHROOM_DELTA_BASE_COST * qualityPackageMultiplier);
  const kg400WcDeltaCost = Math.round(wcDelta * KG400_WC_DELTA_BASE_COST * qualityPackageMultiplier);
  const kg400BedroomVentilationAdjustment = Math.round(kg400BedroomDeltaCost * 0.45);
  const kg400BedroomElectricalAdjustment = Math.round(kg400BedroomDeltaCost * 0.35);
  const kg400BedroomDataAdjustment =
    kg400BedroomDeltaCost - kg400BedroomVentilationAdjustment - kg400BedroomElectricalAdjustment;
  const kg400BathroomPlumbingAdjustment = Math.round(kg400BathroomDeltaCost * 0.75);
  const kg400BathroomHeatingAdjustment = Math.round(kg400BathroomDeltaCost * 0.15);
  const kg400BathroomElectricalAdjustment =
    kg400BathroomDeltaCost - kg400BathroomPlumbingAdjustment - kg400BathroomHeatingAdjustment;
  const kg400WcPlumbingAdjustment = Math.round(kg400WcDeltaCost * 0.70);
  const kg400WcElectricalAdjustment = Math.round(kg400WcDeltaCost * 0.20);
  const kg400WcDataAdjustment =
    kg400WcDeltaCost - kg400WcPlumbingAdjustment - kg400WcElectricalAdjustment;
  const kg400ProgramAdjustmentsByCategory: Record<string, number> = {
    plumbing: kg400BathroomPlumbingAdjustment + kg400WcPlumbingAdjustment,
    heating: kg400BathroomHeatingAdjustment,
    ventilation_cooling: kg400BedroomVentilationAdjustment,
    electrical: kg400BedroomElectricalAdjustment + kg400BathroomElectricalAdjustment + kg400WcElectricalAdjustment,
    data_security: kg400BedroomDataAdjustment + kg400WcDataAdjustment,
    automation: 0,
  };
  const includedWardrobes = bedroomCount;
  const totalWardrobeCount = bedroomCount;
  const heatedInternalArea = Math.max(0, mainArea + habitableBasementArea);
  const heatingOptionQualityMultiplier = HVAC_HEATING_QUALITY_MULTIPLIERS[qualityId] ?? 1.12;
  const photovoltaicQualityMultiplier = HVAC_PV_QUALITY_MULTIPLIERS[qualityId] ?? 1.07;
  const underfloorHeatingBaseCost = Math.max(9000, heatedInternalArea * 85);
  const underfloorHeatingCost = hvacSelections.underfloor_heating
    ? Math.round(underfloorHeatingBaseCost * heatingOptionQualityMultiplier)
    : 0;
  const solarThermalBaseCost = effectiveArea <= 120 ? 2500 : effectiveArea <= 220 ? 3500 : 4500;
  const solarThermalCostCap = qualityId === 'luxury' ? 6500 : qualityId === 'premium' ? 6000 : 5500;
  const solarThermalCost = hvacSelections.solar_thermal
    ? Math.min(
      solarThermalCostCap,
      Math.round(solarThermalBaseCost * heatingOptionQualityMultiplier),
    )
    : 0;
  const photovoltaicBaseCost = effectiveArea <= 120 ? 6000 : effectiveArea <= 220 ? 9000 : 11500;
  const photovoltaicCostCap = qualityId === 'luxury' ? 14000 : qualityId === 'premium' ? 13250 : 12500;
  const photovoltaicCost = hvacSelections.photovoltaic
    ? Math.min(
      photovoltaicCostCap,
      Math.round(photovoltaicBaseCost * photovoltaicQualityMultiplier),
    )
    : 0;
  const hvacOptionAdjustmentsByCategory: Record<string, number> = {
    plumbing: 0,
    heating: underfloorHeatingCost + solarThermalCost,
    ventilation_cooling: 0,
    electrical: photovoltaicCost,
    data_security: 0,
    automation: 0,
  };
  const kitchenAreaFactor = getKitchenAreaFactor(effectiveArea);
  const suggestedKitchenUnitCost = Math.round(
    KG600_KITCHEN_PACKAGE_BASE_COST * kitchenAreaFactor * qualityPackageMultiplier
  );
  const suggestedGeneralFurnitureBaseAmount = getSuggestedGeneralFurnitureBaseAmount(
    effectiveArea,
    bedroomCount,
  );
  const kitchenUnitCost = customKitchenUnitCost ?? suggestedKitchenUnitCost;
  const wardrobeUnitCost = Math.round(KG600_WARDROBE_PACKAGE_BASE_COST * qualityPackageMultiplier);
  const generalFurnitureBedroomIncrement = Math.max(0, bedroomCount - 1) * KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT;
  const generalFurniturePackageCost = generalFurnitureBaseAmount + generalFurnitureBedroomIncrement;
  const extraBathroomFurnishingSliceCost = Math.max(0, bathroomDelta)
    * Math.round(KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST * qualityPackageMultiplier);
  const extraWcFurnishingSliceCost = Math.max(0, wcDelta)
    * Math.round(KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST * qualityPackageMultiplier);
  const kitchenPackageCost = kitchenCount * kitchenUnitCost;
  const wardrobePackageCost = totalWardrobeCount * wardrobeUnitCost;
  const bathroomWcFurnishingSliceCost = extraBathroomFurnishingSliceCost + extraWcFurnishingSliceCost;
  const kg600SpecialFurnishingsCost = kitchenPackageCost + wardrobePackageCost + bathroomWcFurnishingSliceCost;
  const kg600GeneralFurnishingsCost = generalFurniturePackageCost;
  const kg600SubgroupCosts = {
    subgroup610Cost: kg600GeneralFurnishingsCost,
    subgroup620Cost: kg600SpecialFurnishingsCost,
  };

  useEffect(() => {
    if (!kitchenCountCustomized && kitchenCount !== 0) {
      setKitchenCountState(0);
    }
  }, [kitchenCount, kitchenCountCustomized]);

  useEffect(() => {
    if (!generalFurnitureBaseAmountCustomized && generalFurnitureBaseAmount !== suggestedGeneralFurnitureBaseAmount) {
      setGeneralFurnitureBaseAmountState(suggestedGeneralFurnitureBaseAmount);
    }
  }, [
    generalFurnitureBaseAmount,
    generalFurnitureBaseAmountCustomized,
    suggestedGeneralFurnitureBaseAmount,
  ]);

  const setBathrooms = useCallback((value: number) => {
    setBathroomsMode('manual');
    setBathroomsManualValue(Math.max(0, value));
  }, []);

  const setWcs = useCallback((value: number) => {
    setWcsMode('manual');
    setWcsManualValue(Math.max(0, value));
  }, []);

  const setBedroomCount = useCallback((value: number) => {
    setBedroomCountMode('manual');
    setBedroomCountManualValue(Math.max(1, value));
  }, []);

  const setKitchenCount = useCallback((value: number) => {
    setKitchenCountCustomized(true);
    setKitchenCountState(value);
  }, []);

  const setGeneralFurnitureBaseAmount = useCallback((value: number) => {
    setGeneralFurnitureBaseAmountCustomized(true);
    setGeneralFurnitureBaseAmountState(value);
  }, []);

  const categoryCosts = useMemo<CategoryCost[]>(() => {
    return COST_CATEGORIES.map((category) => {
      let categoryCost = 0;

      if (category.din276 === 'KG 300') {
        categoryCost = Math.round(kg300Base * (category.percentage / 67));
        categoryCost = Math.round(categoryCost * kg300AccessibilityMultiplier);
      }

      if (category.din276 === 'KG 400') {
        categoryCost = Math.round(kg400Base * (category.percentage / 24));
        categoryCost = Math.round(categoryCost * kg400AccessibilityMultiplier);
        categoryCost = Math.max(
          0,
          categoryCost
          + (kg400ProgramAdjustmentsByCategory[category.id] ?? 0)
          + (hvacOptionAdjustmentsByCategory[category.id] ?? 0),
        );
      }

      if (category.din276 === 'KG 600') {
        categoryCost = category.id === 'furnishings'
          ? kg600GeneralFurnishingsCost + kg600SpecialFurnishingsCost
          : 0;
      } else if (category.id === 'interior') {
        const adj = 1
          + interiorDeltaBathrooms * INTERIOR_ADJUSTMENTS.bathroom.interior
          + interiorDeltaWcs * INTERIOR_ADJUSTMENTS.wc.interior;
        categoryCost = Math.round(categoryCost * adj);
      }

      return {
        category,
        cost: categoryCost,
        costPerSqm: Math.round(categoryCost / (effectiveArea || 1)),
      };
    });
  }, [
    kg300Base,
    kg400Base,
    benchmarkConstructionCost,
    effectiveArea,
    interiorDeltaBathrooms,
    interiorDeltaWcs,
    kg300AccessibilityMultiplier,
    kg400AccessibilityMultiplier,
    kg400ProgramAdjustmentsByCategory,
    hvacOptionAdjustmentsByCategory,
    kg600GeneralFurnishingsCost,
    kg600SpecialFurnishingsCost,
  ]);

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

  const selectedUtilityConnectionCost = useMemo(() => {
    if (utilityConnectionId === 'custom') return customUtilityCost;
    const opt = UTILITY_CONNECTION_OPTIONS.find((o) => o.id === utilityConnectionId);
    return opt?.cost ?? 4000;
  }, [utilityConnectionId, customUtilityCost]);

  const utilityGroupCosts = useMemo(
    () => getUtilityConnectionGroupCosts(utilityConnectionId, selectedUtilityConnectionCost),
    [utilityConnectionId, selectedUtilityConnectionCost],
  );

  const plotSizeFactor = useMemo(
    () => getPlotSizeFactor(plotSize),
    [plotSize],
  );

  const basementExcavationCost = useMemo(
    () => getBasementExcavationCost(basementArea, siteCondition, groundwaterCondition),
    [basementArea, siteCondition, groundwaterCondition],
  );

  const basementStructureCost = useMemo(() => {
    const storageBasementType = BASEMENT_TYPES.find((b) => b.id === 'storage') ?? BASEMENT_TYPES[0];
    const parkingBasementType = BASEMENT_TYPES.find((b) => b.id === 'parking') ?? BASEMENT_TYPES[0];
    const habitableBasementType = BASEMENT_TYPES.find((b) => b.id === 'habitable') ?? BASEMENT_TYPES[0];

    let cost =
      storageBasementArea * storageBasementType.structureCostPerSqm +
      parkingBasementArea * parkingBasementType.structureCostPerSqm +
      habitableBasementArea * habitableBasementType.structureCostPerSqm;

    if (groundwaterCondition.basementCostMultiplier > 1) {
      cost *= 1.08;
    }

    return Math.round(cost);
  }, [storageBasementArea, parkingBasementArea, habitableBasementArea, groundwaterCondition]);

  const basementTotalCost = basementExcavationCost + basementStructureCost;

  const sitePreparationMultiplier = useMemo(
    () => clampSitePreparationMultiplier(
      plotSizeFactor * siteCondition.sitePreparationFactor * siteAccessibility.sitePreparationFactor
    ),
    [plotSizeFactor, siteCondition, siteAccessibility],
  );

  const siteExcavationCost = useMemo(
    () => Math.round(kg200Base * sitePreparationMultiplier),
    [kg200Base, sitePreparationMultiplier],
  );

  const kg200Total = siteExcavationCost + selectedUtilityConnectionCost + group240Cost + group250Cost;

  const premiumReferenceKg300Base = Math.round(premiumReferenceConstructionCost * BASE_GROUP_SHARE_KG300);
  const noBasementKg300Base = Math.round(noBasementConstructionCost * BASE_GROUP_SHARE_KG300);
  const rawBaseSubgroup310Cost = Math.round(premiumReferenceKg300Base * 0.02);
  const rawBaseSubgroup320Cost = Math.round(premiumReferenceKg300Base * 0.12);
  const structuralBaseSubgroup350Cost = Math.round(premiumReferenceKg300Base * 0.10);
  const baseSiteFactor310 = BASE_SITE_CONDITION_FACTORS_310[siteConditionId] ?? 1.00;
  const baseSiteFactor320 = BASE_SITE_CONDITION_FACTORS_320[siteConditionId] ?? 1.00;
  const baseGroundwaterFactor310 = BASE_GROUNDWATER_FACTORS_310[groundwaterConditionId] ?? 1.00;
  const baseGroundwaterFactor320 = BASE_GROUNDWATER_FACTORS_320[groundwaterConditionId] ?? 1.00;
  const adjustedBaseSubgroup310Cost = Math.round(
    rawBaseSubgroup310Cost * baseSiteFactor310 * baseGroundwaterFactor310
  );
  const adjustedBaseSubgroup320Cost = Math.round(
    rawBaseSubgroup320Cost * baseSiteFactor320 * baseGroundwaterFactor320
  );
  const baseStructuralAdjustment =
    (adjustedBaseSubgroup310Cost - rawBaseSubgroup310Cost) +
    (adjustedBaseSubgroup320Cost - rawBaseSubgroup320Cost);
  const kg300Total = kg300Cost + baseStructuralAdjustment;

  const kg300SubgroupCosts = useMemo<Kg300SubgroupCosts>(() => {
    const noBasementAdjustedKg300 = noBasementKg300Base + baseStructuralAdjustment;
    const totalBasementDrivenKg300 = Math.max(0, kg300Total - noBasementAdjustedKg300);
    const basementSiteConditionFactor =
      basementArea > 0
        ? (BASEMENT_SITE_CONDITION_FACTORS[siteConditionId] ?? 1.00)
        : 1.00;
    const basementGroundwaterFactor310 =
      basementArea > 0
        ? (BASEMENT_GROUNDWATER_FACTORS[groundwaterConditionId] ?? 1.00)
        : 1.00;
    const basementGroundwaterFactor320 =
      basementArea > 0
        ? (BASEMENT_GROUNDWATER_FACTORS_320[groundwaterConditionId] ?? 1.00)
        : 1.00;
    const basementFactor310 = basementArea > 0
      ? basementSiteConditionFactor * basementGroundwaterFactor310
      : 1.00;
    const basementFactor320 = basementArea > 0
      ? basementSiteConditionFactor * basementGroundwaterFactor320
      : 1.00;
    const rawBasementStructuralPool = basementArea > 0
      ? Math.min(
        totalBasementDrivenKg300,
        Math.round(basementArea * premiumReferenceFinalCostPerSqm * 0.10)
      )
      : 0;
    const rawStructuralWeight310 = 0.25 * basementFactor310;
    const rawStructuralWeight320 = 0.75 * basementFactor320;
    const structuralWeightTotal = rawStructuralWeight310 + rawStructuralWeight320 || 1;
    const subgroup310BasementStructural = Math.round(
      rawBasementStructuralPool * (rawStructuralWeight310 / structuralWeightTotal)
    );
    const subgroup320BasementStructural = Math.round(
      rawBasementStructuralPool - subgroup310BasementStructural
    );
    const basementTypePremiumPool = Math.max(0, totalBasementDrivenKg300 - rawBasementStructuralPool);

    const baseSubgroup350Cost = structuralBaseSubgroup350Cost;
    const baseSubgroup310Cost = adjustedBaseSubgroup310Cost;
    const baseSubgroup320Cost = adjustedBaseSubgroup320Cost;

    const baseStructuralCore =
      baseSubgroup310Cost +
      baseSubgroup320Cost +
      baseSubgroup350Cost;
    const baseFlexibleKg300 = Math.max(0, noBasementAdjustedKg300 - baseStructuralCore);

    const flexibleShares =
      KG300_BASE_FLEXIBLE_SHARES[qualityId] ??
      KG300_BASE_FLEXIBLE_SHARES.premium;

    const subgroup330Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup330Share);
    const subgroup340Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup340Share);
    const subgroup350QualityCost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup350Share);
    const subgroup360Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup360Share);
    const subgroup390BaseCost = Math.round(
      baseFlexibleKg300
      - subgroup330Cost
      - subgroup340Cost
      - subgroup350QualityCost
      - subgroup360Cost
    );
    const basementTypePremium330 = Math.round(basementTypePremiumPool * 0.15);
    const basementTypePremium340 = Math.round(basementTypePremiumPool * 0.55);
    const basementTypePremium350 = Math.round(
      basementTypePremiumPool - basementTypePremium330 - basementTypePremium340
    );

    const subgroup310BaseCost = baseSubgroup310Cost + subgroup310BasementStructural;
    const subgroup320BaseCost = baseSubgroup320Cost + subgroup320BasementStructural;
    const subgroup330BaseCost = subgroup330Cost + basementTypePremium330;
    const subgroup340BaseCost = subgroup340Cost + basementTypePremium340;
    const subgroup350BaseCost = baseSubgroup350Cost + subgroup350QualityCost + basementTypePremium350;
    const subgroup360BaseCost = subgroup360Cost;
    const subgroup390Cost = subgroup390BaseCost;

    const subgroup310AccessibilityCost = Math.round(
      subgroup310BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup310)
    );
    const subgroup320AccessibilityCost = Math.round(
      subgroup320BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup320)
    );
    const subgroup330AccessibilityCost = Math.round(
      subgroup330BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup330)
    );
    const subgroup340AccessibilityCost = Math.round(
      subgroup340BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup340)
    );
    const subgroup350AccessibilityCost = Math.round(
      subgroup350BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup350)
    );
    const subgroup360AccessibilityCost = Math.round(
      subgroup360BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup360)
    );
    const subgroup390AccessibilityCost = Math.round(
      subgroup390Cost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup390)
    );
    const rawKg300SubgroupTotal =
      subgroup310AccessibilityCost +
      subgroup320AccessibilityCost +
      subgroup330AccessibilityCost +
      subgroup340AccessibilityCost +
      subgroup350AccessibilityCost +
      subgroup360AccessibilityCost +
      subgroup390AccessibilityCost;
    const kg300NormalizationFactor = rawKg300SubgroupTotal > 0
      ? kg300Total / rawKg300SubgroupTotal
      : 1;
    const normalizedSubgroup310Cost = Math.round(subgroup310AccessibilityCost * kg300NormalizationFactor);
    const normalizedSubgroup320Cost = Math.round(subgroup320AccessibilityCost * kg300NormalizationFactor);
    const normalizedSubgroup330Cost = Math.round(subgroup330AccessibilityCost * kg300NormalizationFactor);
    const normalizedSubgroup340Cost = Math.round(subgroup340AccessibilityCost * kg300NormalizationFactor);
    const normalizedSubgroup350Cost = Math.round(subgroup350AccessibilityCost * kg300NormalizationFactor);
    const normalizedSubgroup360Cost = Math.round(subgroup360AccessibilityCost * kg300NormalizationFactor);
    const normalizedSubgroup390Cost =
      kg300Total
      - normalizedSubgroup310Cost
      - normalizedSubgroup320Cost
      - normalizedSubgroup330Cost
      - normalizedSubgroup340Cost
      - normalizedSubgroup350Cost
      - normalizedSubgroup360Cost;

    return {
      subgroup310Cost: normalizedSubgroup310Cost,
      subgroup320Cost: normalizedSubgroup320Cost,
      subgroup330Cost: normalizedSubgroup330Cost,
      subgroup340Cost: normalizedSubgroup340Cost,
      subgroup350Cost: normalizedSubgroup350Cost,
      subgroup360Cost: normalizedSubgroup360Cost,
      subgroup370Cost: 0,
      subgroup380Cost: 0,
      subgroup390Cost: normalizedSubgroup390Cost,
    };
  }, [
    accessibilityExecutionDelta,
    adjustedBaseSubgroup310Cost,
    adjustedBaseSubgroup320Cost,
    baseStructuralAdjustment,
    basementArea,
    groundwaterConditionId,
    kg300Total,
    noBasementKg300Base,
    premiumReferenceKg300Base,
    premiumReferenceFinalCostPerSqm,
    qualityId,
    siteConditionId,
    structuralBaseSubgroup350Cost,
  ]);

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
      cost: opt.id === 'underfloor_heating'
        ? underfloorHeatingCost
        : opt.id === 'solar_thermal'
          ? solarThermalCost
          : opt.id === 'photovoltaic'
            ? photovoltaicCost
            : 0,
    }));
  }, [hvacSelections, photovoltaicCost, solarThermalCost, underfloorHeatingCost]);

  const totalHvacCost = useMemo(
    () => hvacCosts.reduce((sum, h) => sum + h.cost, 0),
    [hvacCosts],
  );

  const permitDesignEffectiveArea = useMemo(
    () => mainBuildingArea + balconyArea * 0.30 + weightedBasementArea,
    [mainBuildingArea, balconyArea, weightedBasementArea],
  );

  const permitDesignFee = useMemo(() => {
    const areaFactor = permitDesignEffectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX
      ? permitDesignEffectiveArea / PERMIT_DESIGN_BASELINE_AREA_MAX
      : 1.0;
    const qualityFactor = PERMIT_DESIGN_QUALITY_MULTIPLIERS[qualityId] ?? 1.0;
    return Math.round(PERMIT_DESIGN_BASELINE_FEE * areaFactor * qualityFactor);
  }, [permitDesignEffectiveArea, qualityId]);

  const kg400Total = kg400Cost;

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
        return normalizeScenarioConfig({ ...s, ...snapshot });
      }
      return normalizeScenarioConfig(s);
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
    landValue,
    setLandValue,
    landAcquisitionCosts,
    setLandAcquisitionCosts,
    landAcquisitionCostsMode,
    setLandAcquisitionCostsMode,
    bathrooms,
    setBathrooms,
    wcs,
    setWcs,
    bedroomCount,
    setBedroomCount,
    kitchenCount,
    setKitchenCount,
    customKitchenUnitCost,
    setCustomKitchenUnitCost,
    generalFurnitureBaseAmount,
    setGeneralFurnitureBaseAmount,
    hvacSelections,
    toggleHvacOption,
    hvacCosts,
    totalHvacCost,
    customCostPerSqm,
    setCustomCostPerSqm,
    plotSize,
    setPlotSize,
    mainArea,
    setMainArea,
    terraceArea,
    setTerraceArea,
    balconyArea,
    setBalconyArea,
    storageBasementArea,
    setStorageBasementArea,
    parkingBasementArea,
    setParkingBasementArea,
    habitableBasementArea,
    setHabitableBasementArea,
    basementArea,
    basementTypeId: basementType.id,
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
    utilityConnectionCost: selectedUtilityConnectionCost,
    utilityGroup220Cost: utilityGroupCosts.group220Cost,
    utilityGroup230Cost: utilityGroupCosts.group230Cost,
    groundwaterConditionId,
    setGroundwaterConditionId,
    groundwaterCondition,
    siteAccessibilityId,
    setSiteAccessibilityId,
    siteAccessibility,
    siteAccessibilityCost,
    group240Cost,
    group250Cost,
    kg200Total,
    kg300Cost,
    kg300Total,
    kg300SubgroupCosts,
    kg400Cost,
    kg400Total,
    kg500Total,
    kg600Cost,
    kg600SubgroupCosts,
    residentialProgramBaseline,
    bedroomDelta,
    bathroomDelta,
    wcDelta,
    suggestedKitchenUnitCost,
    suggestedGeneralFurnitureBaseAmount,
    kitchenUnitCost,
    kitchenPackageCost,
    wardrobePackageCost,
    generalFurniturePackageCost,
    generalFurnitureBedroomIncrement,
    bathroomWcFurnishingSliceCost,
    includedWardrobes,
    totalWardrobeCount,
    constructionSubtotal,
    contingencyPercent,
    contingencyCost,
    mainBuildingArea,
    permitDesignEffectiveArea,
    basementExcavationCost,
    basementStructureCost,
    basementTotalCost,
    siteExcavationCost,
    plotSizeFactor,
    sitePreparationMultiplier,
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
    landValue, setLandValue, landAcquisitionCosts, setLandAcquisitionCosts,
    landAcquisitionCostsMode, setLandAcquisitionCostsMode,
    bathrooms, setBathrooms, wcs, setWcs,
    bedroomCount, setBedroomCount, kitchenCount, setKitchenCount,
    customKitchenUnitCost, setCustomKitchenUnitCost, generalFurnitureBaseAmount, setGeneralFurnitureBaseAmount,
    hvacSelections, toggleHvacOption, hvacCosts, totalHvacCost,
    customCostPerSqm, setCustomCostPerSqm, plotSize, setPlotSize,
    mainArea, setMainArea, terraceArea, setTerraceArea,
    balconyArea, setBalconyArea,
    storageBasementArea, setStorageBasementArea,
    parkingBasementArea, setParkingBasementArea,
    habitableBasementArea, setHabitableBasementArea,
    basementArea, basementType,
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
    utilityConnectionId, setUtilityConnectionId, customUtilityCost, setCustomUtilityCost, selectedUtilityConnectionCost, utilityGroupCosts,
    groundwaterConditionId, setGroundwaterConditionId, groundwaterCondition,
    siteAccessibilityId, setSiteAccessibilityId, siteAccessibility, siteAccessibilityCost, group240Cost, group250Cost,
    kg200Total, kg300Cost, kg300Total, kg300SubgroupCosts, kg400Cost, kg400Total, kg500Total, kg600Cost,
    kg600SubgroupCosts, residentialProgramBaseline, bedroomDelta, bathroomDelta, wcDelta,
    suggestedKitchenUnitCost, suggestedGeneralFurnitureBaseAmount, kitchenUnitCost, kitchenPackageCost, wardrobePackageCost, generalFurniturePackageCost,
    generalFurnitureBedroomIncrement, bathroomWcFurnishingSliceCost, includedWardrobes, totalWardrobeCount,
    constructionSubtotal, contingencyPercent, contingencyCost, mainBuildingArea, permitDesignEffectiveArea,
    basementExcavationCost, basementStructureCost, basementTotalCost, siteExcavationCost, plotSizeFactor, sitePreparationMultiplier,
    scenarios, activeScenarioIndex, switchScenario, cloneScenario, duplicateScenario, renameScenario, deleteScenario, canCloneScenario,
    getAllScenarioConfigs, resetAllData,
  ]);
});
