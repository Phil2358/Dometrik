import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateProjectCost } from '@/calculator-engine/calculateProjectCost';
import {
  DEFAULT_QUALITY_ID,
  LOCATIONS,
  QUALITY_LEVELS,
  DEFAULT_CONTRACTOR_PERCENTAGE,
  SITE_CONDITIONS,
  BASEMENT_TYPE_NAMES,
  BASEMENT_TYPES,
  HVAC_OPTIONS,
  POOL_SIZE_OPTIONS,
  POOL_QUALITY_OPTIONS,
  POOL_TYPE_OPTIONS,
  DEFAULT_POOL_DEPTH,
  UTILITY_CONNECTION_OPTIONS,
  GROUNDWATER_CONDITIONS,
  SITE_ACCESSIBILITY_OPTIONS,
  type AutomationPackageLevel,
  type CompatibleQualityId,
  type DataSecurityPackageLevel,
  type QualityId,
  getResidentialProgramBaseline,
  getSuggestedGeneralFurniture,
  normalizeQualityId,
} from '@/constants/construction';

type ProgramCountMode = 'auto' | 'manual';

export interface ScenarioConfig {
  id: string;
  name: string;
  locationId: string;
  qualityId: QualityId;
  benchmarkOverridePerSqm: number | null;
  vatPercent?: number;
  // Deprecated compatibility bridge for older saved scenarios. Live e-EFKA
  // calculations now use efkaInsuranceManualCost plus engine defaults.
  efkaInsuranceRatePerSqm?: number;
  efkaInsuranceManualCost?: number | null;
  manualContingencyPercent?: number | null;
  manualContingencyCost?: number | null;
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
  kitchenCountMode?: ProgramCountMode;
  kitchenCountManualValue?: number | null;
  customKitchenUnitCost: number | null;
  generalFurniture: number;
  generalFurnitureCustomized?: boolean;
  dataSecurityManualQuote?: number | null;
  automationManualQuote?: number | null;
  dataSecurityPackageLevel?: DataSecurityPackageLevel;
  automationPackageLevel?: AutomationPackageLevel;
  hvacSelections: Record<string, boolean>;
  utilityConnectionId: string;
  customUtilityCost: number;
  groundwaterConditionId: string;
  siteAccessibilityId: string;
}

type PersistedScenarioConfig = Omit<ScenarioConfig, 'qualityId'> & {
  qualityId?: CompatibleQualityId | string;
  buildingArea?: number;
  effectiveArea?: number;
  customCostPerSqm?: number | null;
  generalFurnitureBaseAmount?: number;
  generalFurnitureBaseAmountCustomized?: boolean;
  kitchenCountCustomized?: boolean;
  dataSecurityPackageSelection?: 'yes' | 'no';
  automationPackageSelection?: 'yes' | 'no';
};

function getProgramDefaultBuildingArea(config: {
  mainArea?: number;
  terraceArea?: number;
  balconyArea?: number;
  storageBasementArea?: number;
  parkingBasementArea?: number;
  habitableBasementArea?: number;
}): number {
  return config.mainArea ?? 0;
}

function getProgramBaselineBuildingArea(config: {
  mainArea?: number;
}): number {
  return config.mainArea ?? 0;
}

function normalizeDataSecurityPackageLevel(
  level: PersistedScenarioConfig['dataSecurityPackageLevel'] | 'basic' | 'advanced' | 'essential' | undefined,
  selection: PersistedScenarioConfig['dataSecurityPackageSelection'],
): DataSecurityPackageLevel {
  switch (level) {
    case 'essential':
      return 'essential';
    case 'connected':
    case 'basic':
      return 'connected';
    case 'integrated':
    case 'advanced':
      return 'integrated';
    case 'custom':
      return 'custom';
    default:
      return selection === 'yes' ? 'connected' : 'essential';
  }
}

function normalizeAutomationPackageLevel(
  level: PersistedScenarioConfig['automationPackageLevel'] | 'basic' | 'advanced' | undefined,
  selection: PersistedScenarioConfig['automationPackageSelection'],
): AutomationPackageLevel {
  switch (level) {
    case 'none':
      return 'none';
    case 'connected':
    case 'basic':
      return 'connected';
    case 'integrated':
    case 'advanced':
      return 'integrated';
    case 'custom':
      return 'custom';
    default:
      return selection === 'yes' ? 'connected' : 'none';
  }
}

function normalizeScenarioConfig(config: PersistedScenarioConfig): ScenarioConfig {
  const landValue = config.landValue ?? 0;
  const qualityId = normalizeQualityId(config.qualityId);
  const benchmarkOverridePerSqm = config.benchmarkOverridePerSqm ?? config.customCostPerSqm ?? null;
  const persistedBuildingArea =
    config.buildingArea ??
    config.effectiveArea ??
    config.mainArea;
  const buildingArea = getProgramDefaultBuildingArea({
    mainArea: persistedBuildingArea,
    terraceArea: config.terraceArea,
    balconyArea: config.balconyArea,
    storageBasementArea: config.storageBasementArea ?? 0,
    parkingBasementArea: config.parkingBasementArea ?? 0,
    habitableBasementArea: config.habitableBasementArea ?? 0,
  });
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
  const landAcquisitionCosts = config.landAcquisitionCosts ?? 0;
  const vatPercent = Math.max(0, config.vatPercent ?? 24);
  const efkaInsuranceManualCost = config.efkaInsuranceManualCost === null || config.efkaInsuranceManualCost === undefined
    ? null
    : Math.max(0, config.efkaInsuranceManualCost);
  const manualContingencyPercent = config.manualContingencyPercent === null || config.manualContingencyPercent === undefined
    ? null
    : Math.max(0, config.manualContingencyPercent);
  const manualContingencyCost = config.manualContingencyCost === null || config.manualContingencyCost === undefined
    ? null
    : Math.max(0, config.manualContingencyCost);
  const defaultBuildingArea = getProgramDefaultBuildingArea({
    ...config,
    mainArea: persistedBuildingArea,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
  });
  const defaultProgramBaseline = getResidentialProgramBaseline(
    getProgramBaselineBuildingArea({
      mainArea: persistedBuildingArea,
    })
  );
  const recommendedKitchens = 1;
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
  const kitchenCountMode = config.kitchenCountMode ?? (
    config.kitchenCountCustomized
      ? 'manual'
      : 'auto'
  );
  const kitchenCountManualValue = kitchenCountMode === 'manual'
    ? Math.max(0, config.kitchenCountManualValue ?? config.kitchenCount ?? recommendedKitchens)
    : null;
  const bathrooms = bathroomsMode === 'manual'
    ? (bathroomsManualValue ?? defaultProgramBaseline.bathrooms)
    : defaultProgramBaseline.bathrooms;
  const wcs = wcsMode === 'manual'
    ? (wcsManualValue ?? defaultProgramBaseline.wcs)
    : defaultProgramBaseline.wcs;
  const bedroomCount = bedroomCountMode === 'manual'
    ? (bedroomCountManualValue ?? defaultProgramBaseline.bedrooms)
    : defaultProgramBaseline.bedrooms;
  const kitchenCount = kitchenCountMode === 'manual'
    ? (kitchenCountManualValue ?? recommendedKitchens)
    : recommendedKitchens;
  const customKitchenUnitCost = config.customKitchenUnitCost ?? null;
  const suggestedGeneralFurniture = getSuggestedGeneralFurniture(defaultBuildingArea, bedroomCount);
  const generalFurnitureCustomized = config.generalFurnitureCustomized ?? config.generalFurnitureBaseAmountCustomized ?? (
    (config.generalFurniture ?? config.generalFurnitureBaseAmount) !== undefined &&
    (config.generalFurniture ?? config.generalFurnitureBaseAmount) !== suggestedGeneralFurniture
  );
  const generalFurniture = generalFurnitureCustomized
    ? (config.generalFurniture ?? config.generalFurnitureBaseAmount ?? suggestedGeneralFurniture)
    : suggestedGeneralFurniture;
  const dataSecurityPackageLevel = normalizeDataSecurityPackageLevel(
    config.dataSecurityPackageLevel,
    config.dataSecurityPackageSelection,
  );
  const dataSecurityManualQuote = config.dataSecurityManualQuote ?? null;
  const automationPackageLevel = normalizeAutomationPackageLevel(
    config.automationPackageLevel,
    config.automationPackageSelection,
  );
  const automationManualQuote = config.automationManualQuote ?? null;

  return {
    ...config,
    qualityId,
    benchmarkOverridePerSqm,
    vatPercent,
    efkaInsuranceManualCost,
    manualContingencyPercent,
    manualContingencyCost,
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
    kitchenCountMode,
    kitchenCountManualValue,
    customKitchenUnitCost,
    generalFurniture,
    generalFurnitureCustomized,
    dataSecurityPackageLevel,
    dataSecurityManualQuote,
    automationPackageLevel,
    automationManualQuote,
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
  const defaultBuildingArea = getProgramDefaultBuildingArea({
    mainArea: 150,
    terraceArea: 30,
    balconyArea: 0,
    storageBasementArea: 0,
    parkingBasementArea: 0,
    habitableBasementArea: 0,
  });
  const defaultProgramBaseline = getResidentialProgramBaseline(150);
  return {
    id: generateId(),
    name,
    locationId: 'corfu',
    qualityId: DEFAULT_QUALITY_ID,
    benchmarkOverridePerSqm: null,
    vatPercent: 24,
    efkaInsuranceManualCost: null,
    manualContingencyPercent: null,
    manualContingencyCost: null,
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
    kitchenCount: 1,
    kitchenCountMode: 'auto',
    kitchenCountManualValue: null,
    customKitchenUnitCost: null,
    generalFurniture: getSuggestedGeneralFurniture(defaultBuildingArea, defaultProgramBaseline.bedrooms),
    generalFurnitureCustomized: false,
    dataSecurityManualQuote: null,
    automationManualQuote: null,
    dataSecurityPackageLevel: 'essential',
    automationPackageLevel: 'none',
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
      const parsed = (JSON.parse(scenariosJson) as PersistedScenarioConfig[]).map(normalizeScenarioConfig);
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
  const initialProgramDefaultBuildingArea = getProgramDefaultBuildingArea({
    mainArea: 150,
    terraceArea: 30,
    balconyArea: 0,
    storageBasementArea: 0,
    parkingBasementArea: 0,
    habitableBasementArea: 0,
  });
  const initialResidentialProgramBaseline = getResidentialProgramBaseline(150);
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([
    createDefaultConfig('Scenario A'),
  ]);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const hydratedRef = useRef<boolean>(false);
  const savePendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [locationId, setLocationId] = useState<string>('corfu');
  const [qualityId, setQualityId] = useState<QualityId>(DEFAULT_QUALITY_ID);
  const [benchmarkOverridePerSqm, setBenchmarkOverridePerSqm] = useState<number | null>(null);
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
  const [vatPercent, setVatPercent] = useState<number>(24);
  const [efkaInsuranceManualCost, setEfkaInsuranceManualCost] = useState<number | null>(null);
  const [manualContingencyPercent, setManualContingencyPercent] = useState<number | null>(null);
  const [manualContingencyCost, setManualContingencyCost] = useState<number | null>(null);
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
  const [kitchenCountMode, setKitchenCountMode] = useState<ProgramCountMode>('auto');
  const [kitchenCountManualValue, setKitchenCountManualValue] = useState<number | null>(null);
  const [customKitchenUnitCost, setCustomKitchenUnitCost] = useState<number | null>(null);
  const [generalFurniture, setGeneralFurnitureState] = useState<number>(
    getSuggestedGeneralFurniture(initialProgramDefaultBuildingArea, initialResidentialProgramBaseline.bedrooms)
  );
  const [generalFurnitureCustomized, setGeneralFurnitureCustomized] = useState<boolean>(false);
  const [dataSecurityPackageLevel, setDataSecurityPackageLevel] = useState<DataSecurityPackageLevel>('essential');
  const [dataSecurityManualQuote, setDataSecurityManualQuote] = useState<number | null>(null);
  const [automationPackageLevel, setAutomationPackageLevel] = useState<AutomationPackageLevel>('none');
  const [automationManualQuote, setAutomationManualQuote] = useState<number | null>(null);
  const [hvacSelections, setHvacSelections] = useState<Record<string, boolean>>({
    underfloor_heating: false,
    solar_thermal: false,
    photovoltaic: false,
  });
  const [utilityConnectionId, setUtilityConnectionId] = useState<string>('standard');
  const [customUtilityCost, setCustomUtilityCost] = useState<number>(4000);
  const [groundwaterConditionId, setGroundwaterConditionId] = useState<string>('normal');
  const [siteAccessibilityId, setSiteAccessibilityId] = useState<string>('normal');

  const serializeCurrentState = useCallback((): Omit<ScenarioConfig, 'id' | 'name'> => {
    return {
      locationId,
      qualityId,
      benchmarkOverridePerSqm,
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
      vatPercent,
      efkaInsuranceManualCost,
      manualContingencyPercent,
      manualContingencyCost,
      siteConditionId,
      landscapingArea,
      landValue,
      landAcquisitionCosts: landAcquisitionCostsMode === 'manual' ? landAcquisitionCosts : 0,
      landAcquisitionCostsMode,
      bathrooms: bathroomsMode === 'manual' ? bathroomsManualValue : undefined,
      wcs: wcsMode === 'manual' ? wcsManualValue : undefined,
      bedroomCount: bedroomCountMode === 'manual' ? bedroomCountManualValue : undefined,
      bathroomsMode,
      bathroomsManualValue: bathroomsMode === 'manual' ? bathroomsManualValue : null,
      wcsMode,
      wcsManualValue: wcsMode === 'manual' ? wcsManualValue : null,
      bedroomCountMode,
      bedroomCountManualValue: bedroomCountMode === 'manual' ? bedroomCountManualValue : null,
      kitchenCount: kitchenCountMode === 'manual' ? kitchenCountManualValue ?? 1 : undefined,
      kitchenCountMode,
      kitchenCountManualValue: kitchenCountMode === 'manual' ? kitchenCountManualValue : null,
      customKitchenUnitCost,
      generalFurniture,
      generalFurnitureCustomized,
      dataSecurityPackageLevel,
      dataSecurityManualQuote,
      automationPackageLevel,
      automationManualQuote,
      hvacSelections: { ...hvacSelections },
      utilityConnectionId,
      customUtilityCost,
      groundwaterConditionId,
      siteAccessibilityId,
    };
  }, [
    locationId, qualityId, benchmarkOverridePerSqm, plotSize, mainArea, terraceArea, balconyArea,
    storageBasementArea, parkingBasementArea, habitableBasementArea, includePool, poolSizeId, poolCustomArea,
    poolCustomDepth, poolQualityId, poolTypeId, contractorPercent, siteConditionId,
    landscapingArea, landValue, landAcquisitionCosts, landAcquisitionCostsMode,
    bathroomsMode, bathroomsManualValue, wcsMode, wcsManualValue, bedroomCountMode, bedroomCountManualValue,
    kitchenCountMode, kitchenCountManualValue, customKitchenUnitCost, generalFurniture, generalFurnitureCustomized,
    dataSecurityPackageLevel, dataSecurityManualQuote, automationPackageLevel, automationManualQuote,
    hvacSelections, utilityConnectionId, customUtilityCost,
    groundwaterConditionId, siteAccessibilityId,
  ]);

  const loadConfig = useCallback((config: ScenarioConfig) => {
    setLocationId(config.locationId);
    setQualityId(config.qualityId);
    setBenchmarkOverridePerSqm(config.benchmarkOverridePerSqm);
    setPlotSize(config.plotSize ?? 4000);
    setMainArea(config.mainArea);
    setTerraceArea(config.terraceArea);
    setBalconyArea(config.balconyArea);
    setStorageBasementArea(config.storageBasementArea);
    setParkingBasementArea(config.parkingBasementArea);
    setHabitableBasementArea(config.habitableBasementArea);
    setIncludePool(config.includePool);
    setPoolSizeId(config.poolSizeId);
    setPoolCustomArea(config.poolCustomArea);
    setPoolCustomDepth(config.poolCustomDepth);
    setPoolQualityId(config.poolQualityId);
    setPoolTypeId(config.poolTypeId);
    setContractorPercent(config.contractorPercent);
    setVatPercent(config.vatPercent ?? 24);
    setEfkaInsuranceManualCost(config.efkaInsuranceManualCost ?? null);
    setManualContingencyPercent(config.manualContingencyPercent ?? null);
    setManualContingencyCost(config.manualContingencyCost ?? null);
    setSiteConditionId(config.siteConditionId);
    setLandscapingArea(config.landscapingArea);
    setLandValue(config.landValue);
    setLandAcquisitionCosts(config.landAcquisitionCosts);
    setLandAcquisitionCostsMode(config.landAcquisitionCostsMode);
    setBathroomsMode(config.bathroomsMode ?? 'auto');
    setBathroomsManualValue(config.bathroomsManualValue ?? null);
    setWcsMode(config.wcsMode ?? 'auto');
    setWcsManualValue(config.wcsManualValue ?? null);
    setBedroomCountMode(config.bedroomCountMode ?? 'auto');
    setBedroomCountManualValue(config.bedroomCountManualValue ?? null);
    setKitchenCountMode(config.kitchenCountMode ?? 'auto');
    setKitchenCountManualValue(config.kitchenCountManualValue ?? null);
    setCustomKitchenUnitCost(config.customKitchenUnitCost);
    setGeneralFurnitureState(config.generalFurniture);
    setGeneralFurnitureCustomized(config.generalFurnitureCustomized ?? false);
    setDataSecurityPackageLevel(config.dataSecurityPackageLevel ?? 'essential');
    setDataSecurityManualQuote(config.dataSecurityManualQuote ?? null);
    setAutomationPackageLevel(config.automationPackageLevel ?? 'none');
    setAutomationManualQuote(config.automationManualQuote ?? null);
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
    const snapshot = serializeCurrentState();
    setScenarios((prev) => {
      const updated = prev.map((s, i) =>
        i === activeIndexRef.current ? { ...s, ...snapshot } : s
      );
      scenariosRef.current = updated;
      scheduleSave(updated, activeIndexRef.current);
      return updated;
    });
  }, [serializeCurrentState, scheduleSave]);

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
    locationId, qualityId, benchmarkOverridePerSqm, plotSize, mainArea, terraceArea, balconyArea,
    storageBasementArea, parkingBasementArea, habitableBasementArea, includePool, poolSizeId, poolCustomArea,
    poolCustomDepth, poolQualityId, poolTypeId, contractorPercent, vatPercent,
    efkaInsuranceManualCost, manualContingencyPercent, manualContingencyCost, siteConditionId,
    landscapingArea, landValue, landAcquisitionCosts, landAcquisitionCostsMode,
    bathroomsMode, bathroomsManualValue, wcsMode, wcsManualValue, bedroomCountMode, bedroomCountManualValue,
    kitchenCountMode, kitchenCountManualValue, customKitchenUnitCost, generalFurniture,
    dataSecurityPackageLevel, dataSecurityManualQuote, automationPackageLevel, automationManualQuote,
    hvacSelections, utilityConnectionId, customUtilityCost,
    groundwaterConditionId, siteAccessibilityId, persistState,
  ]);

  const switchScenario = useCallback((index: number) => {
    if (index === activeIndexRef.current) return;
    const snapshot = serializeCurrentState();
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
  }, [serializeCurrentState, loadConfig, scheduleSave]);

  const cloneScenario = useCallback((): boolean => {
    if (scenarios.length >= MAX_SCENARIOS) {
      console.log('Maximum scenarios reached:', MAX_SCENARIOS);
      return false;
    }
    const snapshot = serializeCurrentState();
    const existingNames = scenarios.map((s) => s.name);
    const newName = getNextScenarioName(existingNames);
    const newConfig: ScenarioConfig = {
      ...snapshot,
      manualContingencyPercent: null,
      manualContingencyCost: null,
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
  }, [scenarios, serializeCurrentState]);

  const duplicateScenario = useCallback((sourceIndex: number): boolean => {
    if (scenarios.length >= MAX_SCENARIOS) {
      console.log('Maximum scenarios reached:', MAX_SCENARIOS);
      return false;
    }
    const snapshot = serializeCurrentState();
    const source = sourceIndex === activeIndexRef.current
      ? { ...scenarios[sourceIndex], ...snapshot }
      : scenarios[sourceIndex];
    if (!source) return false;
    const existingNames = scenarios.map((s) => s.name);
    const newName = getNextScenarioName(existingNames);
    const newConfig: ScenarioConfig = {
      ...source,
      manualContingencyPercent: null,
      manualContingencyCost: null,
      id: generateId(),
      name: newName,
      hvacSelections: { ...source.hvacSelections },
    };
    const newIndex = scenarios.length;

    setScenarios((prev) => {
      const updated = [...prev];
      if (updated[activeIndexRef.current]) {
        updated[activeIndexRef.current] = { ...updated[activeIndexRef.current], ...snapshot };
      }
      const updatedWithDuplicate = [...updated, newConfig];
      scheduleSave(updatedWithDuplicate, newIndex);
      return updatedWithDuplicate;
    });
    loadConfig(newConfig);
    setActiveScenarioIndex(newIndex);
    activeIndexRef.current = newIndex;
    return true;
  }, [scenarios, serializeCurrentState, loadConfig, scheduleSave]);

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
    const snapshot = serializeCurrentState();
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
  }, [scenarios.length, serializeCurrentState, loadConfig, scheduleSave]);

  const location = useMemo(
    () => LOCATIONS.find((l) => l.id === locationId) ?? LOCATIONS[0],
    [locationId],
  );

  const quality = useMemo(
    () => QUALITY_LEVELS.find((q) => q.id === qualityId) ?? QUALITY_LEVELS.find((q) => q.id === DEFAULT_QUALITY_ID) ?? QUALITY_LEVELS[0],
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
    const activeTypeNames = activeTypes.map((typeId) =>
      BASEMENT_TYPES.find((b) => b.id === typeId)?.name ?? BASEMENT_TYPE_NAMES.storage
    );

    if (activeTypes.length === 1) {
      return BASEMENT_TYPES.find((b) => b.id === activeTypes[0]) ?? BASEMENT_TYPES[0];
    }

    const weightedCostFactor = basementArea > 0 ? weightedBasementArea / basementArea : 0.50;
    return {
      id: 'mixed',
      name: activeTypes.length > 1 ? activeTypeNames.join(' + ') : BASEMENT_TYPE_NAMES.storage,
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
  const manualBathrooms = bathroomsMode === 'manual'
    ? Math.max(0, bathroomsManualValue ?? 0)
    : undefined;
  const manualWcs = wcsMode === 'manual'
    ? Math.max(0, wcsManualValue ?? 0)
    : undefined;
  const manualBedroomCount = bedroomCountMode === 'manual'
    ? Math.max(1, bedroomCountManualValue ?? 1)
    : undefined;
  const manualKitchenCount = kitchenCountMode === 'manual'
    ? Math.max(0, kitchenCountManualValue ?? 1)
    : undefined;
  const setBathrooms = useCallback((value: number) => {
    setBathroomsMode('manual');
    setBathroomsManualValue(Math.max(0, value));
  }, []);
  const resetBathrooms = useCallback(() => {
    setBathroomsMode('auto');
    setBathroomsManualValue(null);
  }, []);

  const setWcs = useCallback((value: number) => {
    setWcsMode('manual');
    setWcsManualValue(Math.max(0, value));
  }, []);
  const resetWcs = useCallback(() => {
    setWcsMode('auto');
    setWcsManualValue(null);
  }, []);

  const setBedroomCount = useCallback((value: number) => {
    setBedroomCountMode('manual');
    setBedroomCountManualValue(Math.max(1, value));
  }, []);
  const resetBedroomCount = useCallback(() => {
    setBedroomCountMode('auto');
    setBedroomCountManualValue(null);
  }, []);

  const setKitchenCount = useCallback((value: number) => {
    setKitchenCountMode('manual');
    setKitchenCountManualValue(Math.max(0, value));
  }, []);
  const resetKitchenCount = useCallback(() => {
    setKitchenCountMode('auto');
    setKitchenCountManualValue(null);
  }, []);

  const setGeneralFurniture = useCallback((value: number) => {
    setGeneralFurnitureCustomized(true);
    setGeneralFurnitureState(value);
  }, []);
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

  const toggleHvacOption = useCallback((id: string) => {
    setHvacSelections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const projectRollupResult = useMemo(() => calculateProjectCost({
    plotSize,
    mainArea,
    terraceArea,
    balconyArea,
    basementArea,
    basementTypeId: basementType.id,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    locationId,
    qualityId,
    benchmarkOverridePerSqm,
    siteConditionId,
    groundwaterConditionId,
    siteAccessibilityId,
    utilityConnectionId,
    customUtilityCost,
    landscapingArea,
    includePool,
    poolSizeId,
    poolCustomArea,
    poolCustomDepth,
    poolQualityId,
    poolTypeId,
    bedroomCount: manualBedroomCount,
    bathrooms: manualBathrooms,
    wcs: manualWcs,
    kitchenCount: manualKitchenCount,
    customKitchenUnitCost,
    generalFurniture,
    dataSecurityPackageLevel,
    dataSecurityManualQuote,
    automationPackageLevel,
    automationManualQuote,
    contractorPercent,
    vatPercent,
    efkaInsuranceManualCost,
    manualContingencyPercent,
    manualContingencyCost,
    landValue,
    landAcquisitionCosts,
    landAcquisitionCostsMode,
    hvacSelections,
  }), [
    plotSize,
    mainArea,
    terraceArea,
    balconyArea,
    basementArea,
    basementType,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    locationId,
    qualityId,
    benchmarkOverridePerSqm,
    siteConditionId,
    groundwaterConditionId,
    siteAccessibilityId,
    utilityConnectionId,
    customUtilityCost,
    landscapingArea,
    includePool,
    poolSizeId,
    poolCustomArea,
    poolCustomDepth,
    poolQualityId,
    poolTypeId,
    manualBedroomCount,
    manualBathrooms,
    manualWcs,
    manualKitchenCount,
    customKitchenUnitCost,
    generalFurniture,
    dataSecurityPackageLevel,
    dataSecurityManualQuote,
    automationPackageLevel,
    automationManualQuote,
    contractorPercent,
    vatPercent,
    efkaInsuranceManualCost,
    manualContingencyPercent,
    manualContingencyCost,
    landValue,
    landAcquisitionCosts,
    landAcquisitionCostsMode,
    hvacSelections,
  ]);

  const buildingArea = projectRollupResult.buildingArea;
  const baseCostPerSqm = projectRollupResult.baseCostPerSqm;
  const costPerSqm = projectRollupResult.locationAdjustedBaseCostPerSqm;
  const sizeCorrectionFactor = projectRollupResult.sizeCorrectionFactor;
  const correctedCostPerSqm = projectRollupResult.sizeAdjustedCostPerSqm;
  const finalCostPerSqm = projectRollupResult.correctedCostPerSqm;
  const benchmarkPreviewPerQuality = projectRollupResult.benchmarkPreviewPerQuality;
  const residentialProgramBaseline = projectRollupResult.residentialProgramBaseline;
  const recommendedBedrooms = projectRollupResult.recommendedBedrooms;
  const recommendedBathrooms = projectRollupResult.recommendedBathrooms;
  const recommendedWcs = projectRollupResult.recommendedWcs;
  const recommendedKitchens = projectRollupResult.recommendedKitchens;
  const bedroomCount = projectRollupResult.bedroomCount;
  const bathrooms = projectRollupResult.bathrooms;
  const wcs = projectRollupResult.wcs;
  const kitchenCount = projectRollupResult.kitchenCount;
  const bedroomDelta = projectRollupResult.bedroomDelta;
  const bathroomDelta = projectRollupResult.bathroomDelta;
  const wcDelta = projectRollupResult.wcDelta;
  const hvacCosts = useMemo(() => {
    return HVAC_OPTIONS.map((opt) => ({
      option: opt,
      enabled: hvacSelections[opt.id] ?? false,
      cost: projectRollupResult.hvacOptionCosts[opt.id] ?? 0,
    }));
  }, [hvacSelections, projectRollupResult.hvacOptionCosts]);
  const totalHvacCost = projectRollupResult.hvacExtrasCost;
  const dataSecurityDefaultPackageCost = projectRollupResult.packageCosts.dataSecurity.defaultCost;
  const dataSecurityAppliedPackageCost = projectRollupResult.packageCosts.dataSecurity.appliedCost;
  const dataSecurityManualOverrideActive = projectRollupResult.packageCosts.dataSecurity.manualOverrideActive;
  const automationDefaultPackageCost = projectRollupResult.packageCosts.automation.defaultCost;
  const automationAppliedPackageCost = projectRollupResult.packageCosts.automation.appliedCost;
  const automationManualOverrideActive = projectRollupResult.packageCosts.automation.manualOverrideActive;
  const suggestedKitchenUnitCost = projectRollupResult.suggestedKitchenUnitCost;
  const suggestedGeneralFurniture = projectRollupResult.suggestedGeneralFurniture;
  const kitchenUnitCost = projectRollupResult.kitchenUnitCost;
  const kitchenPackageCost = projectRollupResult.kitchenPackageCost;
  const wardrobePackageCost = projectRollupResult.wardrobePackageCost;
  const bathroomWcFurnishingSliceCost = projectRollupResult.bathroomWcFurnishingSliceCost;
  const includedWardrobes = projectRollupResult.includedWardrobes;
  const totalWardrobeCount = projectRollupResult.totalWardrobeCount;
  const poolCost = projectRollupResult.poolCost;
  const landAcquisitionAmount = projectRollupResult.landAcquisitionAmount;
  const permitDesignBuildingArea = buildingArea;

  useEffect(() => {
    if (!generalFurnitureCustomized && generalFurniture !== suggestedGeneralFurniture) {
      setGeneralFurnitureState(suggestedGeneralFurniture);
    }
  }, [
    generalFurniture,
    generalFurnitureCustomized,
    suggestedGeneralFurniture,
  ]);

  const setGeneralFurnitureMode = useCallback((isManual: boolean) => {
    setGeneralFurnitureCustomized(isManual);
    if (!isManual) {
      setGeneralFurnitureState(suggestedGeneralFurniture);
    }
  }, [suggestedGeneralFurniture]);

  const breakdownGroups = projectRollupResult.breakdownGroups;
  const landscapingCost = projectRollupResult.landscapingCost;
  const utilityConnectionCost = projectRollupResult.utilityConnectionCost;
  const utilityGroup220Cost = projectRollupResult.utilityGroup220Cost;
  const utilityGroup230Cost = projectRollupResult.utilityGroup230Cost;
  const siteExcavationCost = projectRollupResult.siteExcavationCost;
  const kg200Total = projectRollupResult.kg200Total;
  const kg300Cost = projectRollupResult.kg300Total;
  const kg300Total = projectRollupResult.kg300Total;
  const kg300SubgroupCosts = projectRollupResult.kg300SubgroupCosts;
  const kg400Cost = projectRollupResult.kg400Total;
  const kg400Total = projectRollupResult.kg400Total;
  const kg500Total = projectRollupResult.kg500Total;
  const kg600Cost = projectRollupResult.kg600Cost;
  const kg600SubgroupCosts = projectRollupResult.kg600SubgroupCosts;
  const baseBuildingAreaBenchmarkContribution = projectRollupResult.baseBuildingAreaBenchmarkContribution;
  const coveredTerracesBenchmarkContribution = projectRollupResult.coveredTerracesBenchmarkContribution;
  const balconyAreaBenchmarkContribution = projectRollupResult.balconyAreaBenchmarkContribution;
  const totalBenchmarkContributionBeforeGroupAllocation = projectRollupResult.totalBenchmarkContributionBeforeGroupAllocation;
  const constructionSubtotal = projectRollupResult.constructionSubtotal;
  const basementBenchmarkRate = projectRollupResult.basementBenchmarkRate;
  const storageTechnicalBasementCost = projectRollupResult.storageTechnicalBasementCost;
  const parkingBasementCost = projectRollupResult.parkingBasementCost;
  const habitableBasementCost = projectRollupResult.habitableBasementCost;
  const basementBaseCost = projectRollupResult.basementBaseCost;
  const basementBucket300 = projectRollupResult.basementBucket300;
  const basementBucket400 = projectRollupResult.basementBucket400;
  const basementKg300Total = projectRollupResult.basementKg300Total;
  const basementKg300ModifierCost = projectRollupResult.basementKg300ModifierCost;
  const basementKg300CategoryCostsById = projectRollupResult.basementKg300CategoryCostsById;
  const basementKg400CategoryCostsById = projectRollupResult.basementKg400CategoryCostsById;
  const basementKg300BaseSubgroupCosts = projectRollupResult.basementKg300BaseSubgroupCosts;
  const basementKg300SubgroupCosts = projectRollupResult.basementKg300SubgroupCosts;
  const basementKg300ModifierDetails = projectRollupResult.basementKg300ModifierDetails;
  const basementTotalCost = basementBaseCost;
  const constructionCost = constructionSubtotal;
  const permitDesignFee = projectRollupResult.permitFee;
  const contingencyPercent = projectRollupResult.contingencyRecommendedPercent;
  const appliedContingencyPercent = projectRollupResult.appliedContingencyPercent;
  const contingencyManualOverrideActive = projectRollupResult.contingencyManualOverrideActive;
  const recommendedContingencyCost = projectRollupResult.recommendedContingencyCost;
  const contingencyCost = projectRollupResult.contingencyCost;
  const contractorCost = projectRollupResult.contractorCost;
  const efkaInsuranceAutoCost = projectRollupResult.efkaInsuranceAutoCost;
  const efkaInsuranceAmount = projectRollupResult.efkaInsuranceAmount;
  const efkaInsuranceManualOverrideActive = projectRollupResult.efkaInsuranceManualOverrideActive;
  const totalCost = projectRollupResult.preVatTotal;
  const group100Total = projectRollupResult.group100Total;
  const projectTotalBeforeVat = projectRollupResult.preVatTotal;
  const vatAmount = projectRollupResult.vatAmount;
  const totalCostInclVat = projectRollupResult.finalTotal;

  const selectQuality = useCallback((id: QualityId) => {
    setQualityId(id);
    setManualContingencyPercent(null);
    setManualContingencyCost(null);
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
    const snapshot = serializeCurrentState();
    return scenarios.map((s, i) => {
      if (i === activeIndexRef.current) {
        return { ...s, ...snapshot };
      }
      return s;
    });
  }, [scenarios, serializeCurrentState]);

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
    landAcquisitionAmount,
    landAcquisitionCostsMode,
    setLandAcquisitionCostsMode,
    bathrooms,
    recommendedBathrooms,
    bathroomsMode,
    setBathrooms,
    resetBathrooms,
    wcs,
    recommendedWcs,
    wcsMode,
    setWcs,
    resetWcs,
    bedroomCount,
    recommendedBedrooms,
    bedroomCountMode,
    setBedroomCount,
    resetBedroomCount,
    kitchenCount,
    recommendedKitchens,
    kitchenCountMode,
    setKitchenCount,
    resetKitchenCount,
    customKitchenUnitCost,
    setCustomKitchenUnitCost,
    generalFurniture,
    setGeneralFurniture,
    generalFurnitureCustomized,
    setGeneralFurnitureMode,
    dataSecurityPackageLevel,
    setDataSecurityPackageLevel,
    dataSecurityManualQuote,
    setDataSecurityManualQuote,
    dataSecurityDefaultPackageCost,
    dataSecurityAppliedPackageCost,
    dataSecurityManualOverrideActive,
    automationPackageLevel,
    setAutomationPackageLevel,
    automationManualQuote,
    setAutomationManualQuote,
    automationDefaultPackageCost,
    automationAppliedPackageCost,
    automationManualOverrideActive,
    hvacSelections,
    toggleHvacOption,
    hvacCosts,
    totalHvacCost,
    benchmarkOverridePerSqm,
    setBenchmarkOverridePerSqm,
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
    vatPercent,
    setVatPercent,
    vatAmount,
    totalCostInclVat,
    efkaInsuranceManualCost,
    setEfkaInsuranceManualCost,
    efkaInsuranceAutoCost,
    efkaInsuranceAmount,
    efkaInsuranceManualOverrideActive,
    manualContingencyPercent,
    setManualContingencyPercent,
    manualContingencyCost,
    setManualContingencyCost,
    contingencyManualOverrideActive,
    appliedContingencyPercent,
    location,
    quality,
    buildingArea,
    baseCostPerSqm,
    costPerSqm,
    sizeCorrectionFactor,
    correctedCostPerSqm,
    finalCostPerSqm,
    benchmarkPreviewPerQuality,
    constructionCost,
    contractorCost,
    poolCost,
    permitDesignFee,
    totalCost,
    group100Total,
    projectTotalBeforeVat,
    utilityConnectionId,
    setUtilityConnectionId,
    customUtilityCost,
    setCustomUtilityCost,
    utilityConnectionCost,
    utilityGroup220Cost,
    utilityGroup230Cost,
    groundwaterConditionId,
    setGroundwaterConditionId,
    groundwaterCondition,
    siteAccessibilityId,
    setSiteAccessibilityId,
    siteAccessibility,
    kg200Total,
    kg300Cost,
    kg300Total,
    kg300SubgroupCosts,
    kg400Cost,
    kg400Total,
    kg500Total,
    kg600Cost,
    kg600SubgroupCosts,
    baseBuildingAreaBenchmarkContribution,
    coveredTerracesBenchmarkContribution,
    balconyAreaBenchmarkContribution,
    totalBenchmarkContributionBeforeGroupAllocation,
    residentialProgramBaseline,
    bedroomDelta,
    bathroomDelta,
    wcDelta,
    suggestedKitchenUnitCost,
    suggestedGeneralFurniture,
    kitchenUnitCost,
    kitchenPackageCost,
    wardrobePackageCost,
    bathroomWcFurnishingSliceCost,
    includedWardrobes,
    totalWardrobeCount,
    constructionSubtotal,
    basementBenchmarkRate,
    storageTechnicalBasementCost,
    parkingBasementCost,
    habitableBasementCost,
    basementBaseCost,
    basementBucket300,
    basementBucket400,
    basementKg300Total,
    basementKg300ModifierCost,
    basementKg300CategoryCostsById,
    basementKg400CategoryCostsById,
    basementKg300BaseSubgroupCosts,
    basementKg300SubgroupCosts,
    basementKg300ModifierDetails,
    contingencyPercent,
    recommendedContingencyCost,
    contingencyCost,
    permitDesignBuildingArea,
    basementTotalCost,
    siteExcavationCost,
    breakdownGroups,
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
    landValue, setLandValue, landAcquisitionCosts, setLandAcquisitionCosts, landAcquisitionAmount,
    landAcquisitionCostsMode, setLandAcquisitionCostsMode,
    bathrooms, recommendedBathrooms, bathroomsMode, setBathrooms, resetBathrooms, wcs, recommendedWcs, wcsMode, setWcs, resetWcs,
    bedroomCount, recommendedBedrooms, bedroomCountMode, setBedroomCount, resetBedroomCount, kitchenCount, recommendedKitchens, kitchenCountMode, setKitchenCount, resetKitchenCount,
    customKitchenUnitCost, setCustomKitchenUnitCost,
    generalFurniture, setGeneralFurniture,
    generalFurnitureCustomized, setGeneralFurnitureMode,
    dataSecurityPackageLevel, setDataSecurityPackageLevel,
    dataSecurityManualQuote, setDataSecurityManualQuote,
    dataSecurityDefaultPackageCost, dataSecurityAppliedPackageCost, dataSecurityManualOverrideActive,
    automationPackageLevel, setAutomationPackageLevel,
    automationManualQuote, setAutomationManualQuote,
    automationDefaultPackageCost, automationAppliedPackageCost, automationManualOverrideActive,
    hvacSelections, toggleHvacOption, hvacCosts, totalHvacCost,
    benchmarkOverridePerSqm, setBenchmarkOverridePerSqm, plotSize, setPlotSize,
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
    vatPercent, setVatPercent, vatAmount, totalCostInclVat,
    efkaInsuranceManualCost, setEfkaInsuranceManualCost, efkaInsuranceAutoCost, efkaInsuranceAmount, efkaInsuranceManualOverrideActive,
    manualContingencyPercent, setManualContingencyPercent,
    manualContingencyCost, setManualContingencyCost, contingencyManualOverrideActive, appliedContingencyPercent,
    location, quality, buildingArea, baseCostPerSqm, costPerSqm,
    sizeCorrectionFactor, correctedCostPerSqm, finalCostPerSqm, benchmarkPreviewPerQuality,
    constructionCost, contractorCost, poolCost, permitDesignFee, totalCost, group100Total, projectTotalBeforeVat,
    utilityConnectionId, setUtilityConnectionId, customUtilityCost, setCustomUtilityCost, utilityConnectionCost, utilityGroup220Cost, utilityGroup230Cost,
    groundwaterConditionId, setGroundwaterConditionId, groundwaterCondition,
    siteAccessibilityId, setSiteAccessibilityId, siteAccessibility,
    kg200Total, kg300Cost, kg300Total, kg300SubgroupCosts, kg400Cost, kg400Total, kg500Total, kg600Cost,
    baseBuildingAreaBenchmarkContribution, coveredTerracesBenchmarkContribution, balconyAreaBenchmarkContribution, totalBenchmarkContributionBeforeGroupAllocation,
    kg600SubgroupCosts, residentialProgramBaseline, bedroomDelta, bathroomDelta, wcDelta,
    suggestedKitchenUnitCost, suggestedGeneralFurniture, kitchenUnitCost, kitchenPackageCost, wardrobePackageCost,
    bathroomWcFurnishingSliceCost, includedWardrobes, totalWardrobeCount,
    constructionSubtotal, basementBenchmarkRate, storageTechnicalBasementCost, parkingBasementCost, habitableBasementCost, basementBaseCost,
    basementBucket300, basementBucket400, basementKg300Total, basementKg300ModifierCost, basementKg300CategoryCostsById, basementKg400CategoryCostsById, basementKg300BaseSubgroupCosts, basementKg300SubgroupCosts, basementKg300ModifierDetails,
    contingencyPercent, recommendedContingencyCost, contingencyCost, permitDesignBuildingArea,
    basementTotalCost, siteExcavationCost, breakdownGroups,
    scenarios, activeScenarioIndex, switchScenario, cloneScenario, duplicateScenario, renameScenario, deleteScenario, canCloneScenario,
    getAllScenarioConfigs, resetAllData,
  ]);
});
