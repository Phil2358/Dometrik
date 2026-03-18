import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateKg400Costs } from '@/calculator-engine/modules/kg400Costs';
import { LOCATIONS, QUALITY_LEVELS, COST_CATEGORIES, DEFAULT_CONTRACTOR_PERCENTAGE, SITE_CONDITIONS, BASEMENT_TYPES, LANDSCAPING_BASE_COST_PER_SQM, INTERIOR_ADJUSTMENTS, INTERIOR_BASELINE, HVAC_OPTIONS, POOL_SIZE_OPTIONS, POOL_QUALITY_OPTIONS, POOL_TYPE_OPTIONS, POOL_TERRAIN_MULTIPLIERS, POOL_MINIMUM_COST, DEFAULT_POOL_DEPTH, PERMIT_DESIGN_BASELINE_FEE, PERMIT_DESIGN_BASELINE_AREA_MAX, PERMIT_DESIGN_QUALITY_MULTIPLIERS, UTILITY_CONNECTION_OPTIONS, CONTINGENCY_PERCENTAGES, GROUNDWATER_CONDITIONS, SITE_ACCESSIBILITY_OPTIONS, BASE_GROUP_SHARE_KG200, BASE_GROUP_SHARE_KG300, BASE_GROUP_SHARE_KG400, PREMIUM_BENCHMARK_BASE_COST_PER_SQM, KG300_CATEGORY_IDS, KG600_CATEGORY_IDS, clampSitePreparationMultiplier, getSizeCorrectionFactor, getBasementExcavationCost, getLandscapingSizeAdjustment, getPoolDepthFactor, getPlotSizeFactor, getUtilityConnectionGroupCosts, KG600_KITCHEN_PACKAGE_BASE_COST, KG600_WARDROBE_PACKAGE_BASE_COST, KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT, KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST, KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST, getKitchenAreaFactor, getResidentialProgramBaseline, getSuggestedGeneralFurnitureBaseAmount, } from '@/constants/construction';
const DEFAULT_LAND_ACQUISITION_PERCENTAGE = 0.06;
const KG300_PLUS_KG400_BASE_SHARE = BASE_GROUP_SHARE_KG300 + BASE_GROUP_SHARE_KG400;
const KG300_BASE_FLEXIBLE_SHARES = {
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
};
const BASE_SITE_CONDITION_FACTORS_310 = {
    flat_normal: 1.00,
    flat_rocky: 1.08,
    inclined_normal: 1.06,
    inclined_rocky: 1.15,
    inclined_sandy: 1.18,
};
const BASE_SITE_CONDITION_FACTORS_320 = {
    flat_normal: 1.00,
    flat_rocky: 1.03,
    inclined_normal: 1.02,
    inclined_rocky: 1.08,
    inclined_sandy: 1.10,
};
const BASE_GROUNDWATER_FACTORS_310 = {
    normal: 1.00,
    moderate: 1.02,
    high: 1.05,
};
const BASE_GROUNDWATER_FACTORS_320 = {
    normal: 1.00,
    moderate: 1.06,
    high: 1.15,
};
const BASEMENT_SITE_CONDITION_FACTORS = {
    flat_normal: 1.00,
    flat_rocky: 1.05,
    inclined_normal: 1.10,
    inclined_rocky: 1.12,
    inclined_sandy: 1.15,
};
const BASEMENT_GROUNDWATER_FACTORS = {
    normal: 1.00,
    moderate: 1.04,
    high: 1.10,
};
const BASEMENT_GROUNDWATER_FACTORS_320 = {
    normal: 1.00,
    moderate: 1.08,
    high: 1.18,
};
function getAdjustedKg300Share(weightedBasementRatio) {
    if (weightedBasementRatio <= 0)
        return BASE_GROUP_SHARE_KG300;
    if (weightedBasementRatio <= 0.15)
        return 0.645;
    if (weightedBasementRatio <= 0.30)
        return 0.65;
    if (weightedBasementRatio <= 0.50)
        return 0.66;
    return 0.675;
}
function getAutoEstimatedLandAcquisitionCosts(landValue) {
    return landValue * DEFAULT_LAND_ACQUISITION_PERCENTAGE;
}
function getWeightedBasementAreaForProgramDefaults(storageBasementArea, parkingBasementArea, habitableBasementArea) {
    var _a, _b, _c;
    const storageBasementType = (_a = BASEMENT_TYPES.find((b) => b.id === 'storage')) !== null && _a !== void 0 ? _a : BASEMENT_TYPES[0];
    const parkingBasementType = (_b = BASEMENT_TYPES.find((b) => b.id === 'parking')) !== null && _b !== void 0 ? _b : BASEMENT_TYPES[0];
    const habitableBasementType = (_c = BASEMENT_TYPES.find((b) => b.id === 'habitable')) !== null && _c !== void 0 ? _c : BASEMENT_TYPES[0];
    return storageBasementArea * storageBasementType.costFactor
        + parkingBasementArea * parkingBasementType.costFactor
        + habitableBasementArea * habitableBasementType.costFactor;
}
function getProgramDefaultEffectiveArea(config) {
    var _a, _b, _c, _d, _e, _f;
    return ((_a = config.mainArea) !== null && _a !== void 0 ? _a : 0)
        + ((_b = config.terraceArea) !== null && _b !== void 0 ? _b : 0) * 0.5
        + ((_c = config.balconyArea) !== null && _c !== void 0 ? _c : 0) * 0.30
        + getWeightedBasementAreaForProgramDefaults((_d = config.storageBasementArea) !== null && _d !== void 0 ? _d : 0, (_e = config.parkingBasementArea) !== null && _e !== void 0 ? _e : 0, (_f = config.habitableBasementArea) !== null && _f !== void 0 ? _f : 0);
}
function getProgramBaselineLivingArea(config) {
    var _a;
    return (_a = config.mainArea) !== null && _a !== void 0 ? _a : 0;
}
function normalizeScenarioConfig(config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    const landValue = (_a = config.landValue) !== null && _a !== void 0 ? _a : 0;
    const plotSize = (_b = config.plotSize) !== null && _b !== void 0 ? _b : 4000;
    const legacyBasementArea = (_c = config.basementArea) !== null && _c !== void 0 ? _c : 0;
    const legacyBasementTypeId = (_d = config.basementTypeId) !== null && _d !== void 0 ? _d : 'storage';
    const hasMixedBasementAreas = config.storageBasementArea !== undefined ||
        config.parkingBasementArea !== undefined ||
        config.habitableBasementArea !== undefined;
    const storageBasementArea = hasMixedBasementAreas
        ? ((_e = config.storageBasementArea) !== null && _e !== void 0 ? _e : 0)
        : (legacyBasementTypeId === 'storage' ? legacyBasementArea : 0);
    const parkingBasementArea = hasMixedBasementAreas
        ? ((_f = config.parkingBasementArea) !== null && _f !== void 0 ? _f : 0)
        : (legacyBasementTypeId === 'parking' ? legacyBasementArea : 0);
    const habitableBasementArea = hasMixedBasementAreas
        ? ((_g = config.habitableBasementArea) !== null && _g !== void 0 ? _g : 0)
        : (legacyBasementTypeId === 'habitable' ? legacyBasementArea : 0);
    const basementArea = storageBasementArea + parkingBasementArea + habitableBasementArea;
    const landAcquisitionCostsMode = (_h = config.landAcquisitionCostsMode) !== null && _h !== void 0 ? _h : 'auto';
    const landAcquisitionCosts = landAcquisitionCostsMode === 'auto'
        ? getAutoEstimatedLandAcquisitionCosts(landValue)
        : ((_j = config.landAcquisitionCosts) !== null && _j !== void 0 ? _j : 0);
    const defaultEffectiveArea = getProgramDefaultEffectiveArea(Object.assign(Object.assign({}, config), { storageBasementArea,
        parkingBasementArea,
        habitableBasementArea }));
    const defaultProgramBaseline = getResidentialProgramBaseline(getProgramBaselineLivingArea(config));
    const bathroomsMode = (_k = config.bathroomsMode) !== null && _k !== void 0 ? _k : 'auto';
    const bathroomsManualValue = bathroomsMode === 'manual'
        ? Math.max(0, (_m = (_l = config.bathroomsManualValue) !== null && _l !== void 0 ? _l : config.bathrooms) !== null && _m !== void 0 ? _m : defaultProgramBaseline.bathrooms)
        : null;
    const wcsMode = (_o = config.wcsMode) !== null && _o !== void 0 ? _o : 'auto';
    const wcsManualValue = wcsMode === 'manual'
        ? Math.max(0, (_q = (_p = config.wcsManualValue) !== null && _p !== void 0 ? _p : config.wcs) !== null && _q !== void 0 ? _q : defaultProgramBaseline.wcs)
        : null;
    const bedroomCountMode = (_r = config.bedroomCountMode) !== null && _r !== void 0 ? _r : 'auto';
    const bedroomCountManualValue = bedroomCountMode === 'manual'
        ? Math.max(1, (_t = (_s = config.bedroomCountManualValue) !== null && _s !== void 0 ? _s : config.bedroomCount) !== null && _t !== void 0 ? _t : defaultProgramBaseline.bedrooms)
        : null;
    const kitchenCountCustomized = (_u = config.kitchenCountCustomized) !== null && _u !== void 0 ? _u : (config.kitchenCount !== undefined && config.kitchenCount !== 1);
    const bathrooms = bathroomsMode === 'manual'
        ? (bathroomsManualValue !== null && bathroomsManualValue !== void 0 ? bathroomsManualValue : defaultProgramBaseline.bathrooms)
        : defaultProgramBaseline.bathrooms;
    const wcs = wcsMode === 'manual'
        ? (wcsManualValue !== null && wcsManualValue !== void 0 ? wcsManualValue : defaultProgramBaseline.wcs)
        : defaultProgramBaseline.wcs;
    const bedroomCount = bedroomCountMode === 'manual'
        ? (bedroomCountManualValue !== null && bedroomCountManualValue !== void 0 ? bedroomCountManualValue : defaultProgramBaseline.bedrooms)
        : defaultProgramBaseline.bedrooms;
    const kitchenCount = kitchenCountCustomized
        ? ((_v = config.kitchenCount) !== null && _v !== void 0 ? _v : 0)
        : 0;
    const customKitchenUnitCost = (_w = config.customKitchenUnitCost) !== null && _w !== void 0 ? _w : null;
    const suggestedGeneralFurnitureBaseAmount = getSuggestedGeneralFurnitureBaseAmount(defaultEffectiveArea, bedroomCount);
    const generalFurnitureBaseAmountCustomized = (_x = config.generalFurnitureBaseAmountCustomized) !== null && _x !== void 0 ? _x : (config.generalFurnitureBaseAmount !== undefined &&
        config.generalFurnitureBaseAmount !== 0 &&
        config.generalFurnitureBaseAmount !== 5000);
    const generalFurnitureBaseAmount = generalFurnitureBaseAmountCustomized
        ? ((_y = config.generalFurnitureBaseAmount) !== null && _y !== void 0 ? _y : suggestedGeneralFurnitureBaseAmount)
        : suggestedGeneralFurnitureBaseAmount;
    return Object.assign(Object.assign({}, config), { plotSize,
        basementArea, basementTypeId: basementArea > 0 ? legacyBasementTypeId : 'storage', storageBasementArea,
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
        generalFurnitureBaseAmountCustomized });
}
const MAX_SCENARIOS = 6;
const STORAGE_KEY_SCENARIOS = '@estimate_scenarios';
const STORAGE_KEY_ACTIVE_INDEX = '@estimate_active_index';
function getNextScenarioName(existingNames) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < letters.length; i++) {
        const candidate = `Scenario ${letters[i]}`;
        if (!existingNames.includes(candidate))
            return candidate;
    }
    return `Scenario ${existingNames.length + 1}`;
}
function generateId() {
    return Date.now().toString() + Math.random().toString(36).slice(2, 6);
}
function createDefaultConfig(name) {
    const defaultEffectiveArea = getProgramDefaultEffectiveArea({
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
async function loadSavedScenarios() {
    try {
        const [scenariosJson, indexJson] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY_SCENARIOS),
            AsyncStorage.getItem(STORAGE_KEY_ACTIVE_INDEX),
        ]);
        if (scenariosJson) {
            const parsed = JSON.parse(scenariosJson).map(normalizeScenarioConfig);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const activeIndex = indexJson ? Math.min(parseInt(indexJson, 10) || 0, parsed.length - 1) : 0;
                console.log('[Persistence] Loaded', parsed.length, 'scenarios, active index:', activeIndex);
                return { scenarios: parsed, activeIndex };
            }
        }
    }
    catch (e) {
        console.log('[Persistence] Error loading scenarios:', e);
    }
    return null;
}
async function saveScenarios(scenarios, activeIndex) {
    try {
        await Promise.all([
            AsyncStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(scenarios)),
            AsyncStorage.setItem(STORAGE_KEY_ACTIVE_INDEX, String(activeIndex)),
        ]);
        console.log('[Persistence] Saved', scenarios.length, 'scenarios, active index:', activeIndex);
    }
    catch (e) {
        console.log('[Persistence] Error saving scenarios:', e);
    }
}
export const [EstimateProvider, useEstimate] = createContextHook(() => {
    var _a, _b, _c, _d, _e;
    const initialProgramDefaultEffectiveArea = getProgramDefaultEffectiveArea({
        mainArea: 150,
        terraceArea: 30,
        balconyArea: 0,
        storageBasementArea: 0,
        parkingBasementArea: 0,
        habitableBasementArea: 0,
    });
    const initialResidentialProgramBaseline = getResidentialProgramBaseline(150);
    const [scenarios, setScenarios] = useState([
        createDefaultConfig('Scenario A'),
    ]);
    const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
    const hydratedRef = useRef(false);
    const savePendingRef = useRef(null);
    const [locationId, setLocationId] = useState('corfu');
    const [qualityId, setQualityId] = useState('premium');
    const [customCostPerSqm, setCustomCostPerSqm] = useState(null);
    const [plotSize, setPlotSize] = useState(4000);
    const [mainArea, setMainArea] = useState(150);
    const [terraceArea, setTerraceArea] = useState(30);
    const [balconyArea, setBalconyArea] = useState(0);
    const [storageBasementArea, setStorageBasementArea] = useState(0);
    const [parkingBasementArea, setParkingBasementArea] = useState(0);
    const [habitableBasementArea, setHabitableBasementArea] = useState(0);
    const [includePool, setIncludePool] = useState(false);
    const [poolSizeId, setPoolSizeId] = useState('medium');
    const [poolCustomArea, setPoolCustomArea] = useState(35);
    const [poolCustomDepth, setPoolCustomDepth] = useState(DEFAULT_POOL_DEPTH);
    const [poolQualityId, setPoolQualityId] = useState('standard');
    const [poolTypeId, setPoolTypeId] = useState('skimmer');
    const [contractorPercent, setContractorPercent] = useState(DEFAULT_CONTRACTOR_PERCENTAGE);
    const [siteConditionId, setSiteConditionId] = useState('flat_normal');
    const [landscapingArea, setLandscapingArea] = useState(0);
    const [landValue, setLandValue] = useState(0);
    const [landAcquisitionCosts, setLandAcquisitionCosts] = useState(0);
    const [landAcquisitionCostsMode, setLandAcquisitionCostsMode] = useState('auto');
    const [bathroomsMode, setBathroomsMode] = useState('auto');
    const [bathroomsManualValue, setBathroomsManualValue] = useState(null);
    const [wcsMode, setWcsMode] = useState('auto');
    const [wcsManualValue, setWcsManualValue] = useState(null);
    const [bedroomCountMode, setBedroomCountMode] = useState('auto');
    const [bedroomCountManualValue, setBedroomCountManualValue] = useState(null);
    const [kitchenCount, setKitchenCountState] = useState(0);
    const [kitchenCountCustomized, setKitchenCountCustomized] = useState(false);
    const [customKitchenUnitCost, setCustomKitchenUnitCost] = useState(null);
    const [generalFurnitureBaseAmount, setGeneralFurnitureBaseAmountState] = useState(getSuggestedGeneralFurnitureBaseAmount(initialProgramDefaultEffectiveArea, initialResidentialProgramBaseline.bedrooms));
    const [generalFurnitureBaseAmountCustomized, setGeneralFurnitureBaseAmountCustomized] = useState(false);
    const [hvacSelections, setHvacSelections] = useState({
        underfloor_heating: false,
        solar_thermal: false,
        photovoltaic: false,
    });
    const [utilityConnectionId, setUtilityConnectionId] = useState('standard');
    const [customUtilityCost, setCustomUtilityCost] = useState(4000);
    const [groundwaterConditionId, setGroundwaterConditionId] = useState('normal');
    const [siteAccessibilityId, setSiteAccessibilityId] = useState('normal');
    const effectiveArea = useMemo(() => mainArea + terraceArea * 0.5 + balconyArea * 0.30 + getWeightedBasementAreaForProgramDefaults(storageBasementArea, parkingBasementArea, habitableBasementArea), [mainArea, terraceArea, balconyArea, storageBasementArea, parkingBasementArea, habitableBasementArea]);
    const residentialProgramBaseline = getResidentialProgramBaseline(mainArea);
    const bathrooms = bathroomsMode === 'manual'
        ? Math.max(0, bathroomsManualValue !== null && bathroomsManualValue !== void 0 ? bathroomsManualValue : residentialProgramBaseline.bathrooms)
        : residentialProgramBaseline.bathrooms;
    const wcs = wcsMode === 'manual'
        ? Math.max(0, wcsManualValue !== null && wcsManualValue !== void 0 ? wcsManualValue : residentialProgramBaseline.wcs)
        : residentialProgramBaseline.wcs;
    const bedroomCount = bedroomCountMode === 'manual'
        ? Math.max(1, bedroomCountManualValue !== null && bedroomCountManualValue !== void 0 ? bedroomCountManualValue : residentialProgramBaseline.bedrooms)
        : residentialProgramBaseline.bedrooms;
    const snapshotCurrentState = useCallback(() => {
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
            hvacSelections: Object.assign({}, hvacSelections),
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
    const loadConfig = useCallback((config) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const normalizedConfig = normalizeScenarioConfig(config);
        setLocationId(config.locationId);
        setQualityId(config.qualityId);
        setCustomCostPerSqm(config.customCostPerSqm);
        setPlotSize((_a = config.plotSize) !== null && _a !== void 0 ? _a : 4000);
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
        setBathroomsMode((_b = normalizedConfig.bathroomsMode) !== null && _b !== void 0 ? _b : 'auto');
        setBathroomsManualValue((_c = normalizedConfig.bathroomsManualValue) !== null && _c !== void 0 ? _c : null);
        setWcsMode((_d = normalizedConfig.wcsMode) !== null && _d !== void 0 ? _d : 'auto');
        setWcsManualValue((_e = normalizedConfig.wcsManualValue) !== null && _e !== void 0 ? _e : null);
        setBedroomCountMode((_f = normalizedConfig.bedroomCountMode) !== null && _f !== void 0 ? _f : 'auto');
        setBedroomCountManualValue((_g = normalizedConfig.bedroomCountManualValue) !== null && _g !== void 0 ? _g : null);
        setKitchenCountState(normalizedConfig.kitchenCount);
        setKitchenCountCustomized((_h = normalizedConfig.kitchenCountCustomized) !== null && _h !== void 0 ? _h : false);
        setCustomKitchenUnitCost(normalizedConfig.customKitchenUnitCost);
        setGeneralFurnitureBaseAmountState(normalizedConfig.generalFurnitureBaseAmount);
        setGeneralFurnitureBaseAmountCustomized((_j = normalizedConfig.generalFurnitureBaseAmountCustomized) !== null && _j !== void 0 ? _j : false);
        setHvacSelections(Object.assign({}, config.hvacSelections));
        setUtilityConnectionId(config.utilityConnectionId);
        setCustomUtilityCost(config.customUtilityCost);
        setGroundwaterConditionId(config.groundwaterConditionId);
        setSiteAccessibilityId(config.siteAccessibilityId);
    }, []);
    const activeIndexRef = useRef(activeScenarioIndex);
    activeIndexRef.current = activeScenarioIndex;
    const scenariosRef = useRef(scenarios);
    scenariosRef.current = scenarios;
    const scheduleSave = useCallback((updatedScenarios, updatedIndex) => {
        if (savePendingRef.current) {
            clearTimeout(savePendingRef.current);
        }
        savePendingRef.current = setTimeout(() => {
            void saveScenarios(updatedScenarios, updatedIndex);
            savePendingRef.current = null;
        }, 300);
    }, []);
    const persistState = useCallback(() => {
        if (!hydratedRef.current)
            return;
        const snapshot = snapshotCurrentState();
        const updated = scenariosRef.current.map((s, i) => i === activeIndexRef.current ? Object.assign(Object.assign({}, s), snapshot) : s);
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
        if (landAcquisitionCostsMode !== 'auto')
            return;
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
    const switchScenario = useCallback((index) => {
        if (index === activeIndexRef.current)
            return;
        const snapshot = snapshotCurrentState();
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[activeIndexRef.current]) {
                updated[activeIndexRef.current] = normalizeScenarioConfig(Object.assign(Object.assign({}, updated[activeIndexRef.current]), snapshot));
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
    const cloneScenario = useCallback(() => {
        if (scenarios.length >= MAX_SCENARIOS) {
            console.log('Maximum scenarios reached:', MAX_SCENARIOS);
            return false;
        }
        const snapshot = snapshotCurrentState();
        const existingNames = scenarios.map((s) => s.name);
        const newName = getNextScenarioName(existingNames);
        const newConfig = Object.assign(Object.assign({}, snapshot), { id: generateId(), name: newName });
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[activeIndexRef.current]) {
                updated[activeIndexRef.current] = normalizeScenarioConfig(Object.assign(Object.assign({}, updated[activeIndexRef.current]), snapshot));
            }
            return [...updated, newConfig];
        });
        const newIndex = scenarios.length;
        setActiveScenarioIndex(newIndex);
        activeIndexRef.current = newIndex;
        return true;
    }, [scenarios, snapshotCurrentState]);
    const duplicateScenario = useCallback((sourceIndex) => {
        if (scenarios.length >= MAX_SCENARIOS) {
            console.log('Maximum scenarios reached:', MAX_SCENARIOS);
            return false;
        }
        const snapshot = snapshotCurrentState();
        const source = sourceIndex === activeIndexRef.current
            ? normalizeScenarioConfig(Object.assign(Object.assign({}, scenarios[sourceIndex]), snapshot))
            : scenarios[sourceIndex];
        if (!source)
            return false;
        const existingNames = scenarios.map((s) => s.name);
        const newName = getNextScenarioName(existingNames);
        const newConfig = Object.assign(Object.assign({}, source), { id: generateId(), name: newName, hvacSelections: Object.assign({}, source.hvacSelections) });
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[activeIndexRef.current]) {
                updated[activeIndexRef.current] = normalizeScenarioConfig(Object.assign(Object.assign({}, updated[activeIndexRef.current]), snapshot));
            }
            return [...updated, newConfig];
        });
        loadConfig(newConfig);
        const newIndex = scenarios.length;
        setActiveScenarioIndex(newIndex);
        activeIndexRef.current = newIndex;
        return true;
    }, [scenarios, snapshotCurrentState, loadConfig]);
    const renameScenario = useCallback((index, newName) => {
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = Object.assign(Object.assign({}, updated[index]), { name: newName });
            }
            scheduleSave(updated, activeIndexRef.current);
            return updated;
        });
    }, [scheduleSave]);
    const deleteScenario = useCallback((index) => {
        if (scenarios.length <= 1)
            return;
        const snapshot = snapshotCurrentState();
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[activeIndexRef.current]) {
                updated[activeIndexRef.current] = normalizeScenarioConfig(Object.assign(Object.assign({}, updated[activeIndexRef.current]), snapshot));
            }
            updated.splice(index, 1);
            let newActiveIndex = activeIndexRef.current;
            if (index === activeIndexRef.current) {
                newActiveIndex = Math.min(index, updated.length - 1);
                loadConfig(updated[newActiveIndex]);
            }
            else if (index < activeIndexRef.current) {
                newActiveIndex = activeIndexRef.current - 1;
            }
            setActiveScenarioIndex(newActiveIndex);
            activeIndexRef.current = newActiveIndex;
            scheduleSave(updated, newActiveIndex);
            return updated;
        });
    }, [scenarios.length, snapshotCurrentState, loadConfig, scheduleSave]);
    const location = useMemo(() => { var _a; return (_a = LOCATIONS.find((l) => l.id === locationId)) !== null && _a !== void 0 ? _a : LOCATIONS[0]; }, [locationId]);
    const quality = useMemo(() => { var _a; return (_a = QUALITY_LEVELS.find((q) => q.id === qualityId)) !== null && _a !== void 0 ? _a : QUALITY_LEVELS[1]; }, [qualityId]);
    const basementArea = storageBasementArea + parkingBasementArea + habitableBasementArea;
    const weightedBasementArea = useMemo(() => {
        var _a, _b, _c;
        const storageBasementType = (_a = BASEMENT_TYPES.find((b) => b.id === 'storage')) !== null && _a !== void 0 ? _a : BASEMENT_TYPES[0];
        const parkingBasementType = (_b = BASEMENT_TYPES.find((b) => b.id === 'parking')) !== null && _b !== void 0 ? _b : BASEMENT_TYPES[0];
        const habitableBasementType = (_c = BASEMENT_TYPES.find((b) => b.id === 'habitable')) !== null && _c !== void 0 ? _c : BASEMENT_TYPES[0];
        return storageBasementArea * storageBasementType.costFactor
            + parkingBasementArea * parkingBasementType.costFactor
            + habitableBasementArea * habitableBasementType.costFactor;
    }, [storageBasementArea, parkingBasementArea, habitableBasementArea]);
    const basementType = useMemo(() => {
        var _a;
        const activeTypes = [
            storageBasementArea > 0 ? 'storage' : null,
            parkingBasementArea > 0 ? 'parking' : null,
            habitableBasementArea > 0 ? 'habitable' : null,
        ].filter(Boolean);
        if (activeTypes.length === 1) {
            return (_a = BASEMENT_TYPES.find((b) => b.id === activeTypes[0])) !== null && _a !== void 0 ? _a : BASEMENT_TYPES[0];
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
    const siteCondition = useMemo(() => { var _a; return (_a = SITE_CONDITIONS.find((s) => s.id === siteConditionId)) !== null && _a !== void 0 ? _a : SITE_CONDITIONS[0]; }, [siteConditionId]);
    const groundwaterCondition = useMemo(() => { var _a; return (_a = GROUNDWATER_CONDITIONS.find((g) => g.id === groundwaterConditionId)) !== null && _a !== void 0 ? _a : GROUNDWATER_CONDITIONS[0]; }, [groundwaterConditionId]);
    const siteAccessibility = useMemo(() => { var _a; return (_a = SITE_ACCESSIBILITY_OPTIONS.find((a) => a.id === siteAccessibilityId)) !== null && _a !== void 0 ? _a : SITE_ACCESSIBILITY_OPTIONS[0]; }, [siteAccessibilityId]);
    const group240Cost = 0;
    const group250Cost = 0;
    const siteAccessibilityCost = group250Cost;
    const baseCostPerSqm = customCostPerSqm !== null && customCostPerSqm !== void 0 ? customCostPerSqm : quality.baseCostPerSqm;
    const costPerSqm = Math.round(baseCostPerSqm * location.multiplier);
    const sizeCorrectionFactor = useMemo(() => getSizeCorrectionFactor(mainArea), [mainArea]);
    const correctedCostPerSqm = Math.round(baseCostPerSqm * sizeCorrectionFactor);
    const finalCostPerSqm = Math.round(correctedCostPerSqm * location.multiplier);
    const premiumReferenceCorrectedCostPerSqm = Math.round(PREMIUM_BENCHMARK_BASE_COST_PER_SQM * sizeCorrectionFactor);
    const premiumReferenceFinalCostPerSqm = Math.round(premiumReferenceCorrectedCostPerSqm * location.multiplier);
    const noBasementEffectiveArea = mainArea + terraceArea * 0.5 + balconyArea * 0.30;
    const baseConstructionCost = effectiveArea * finalCostPerSqm;
    const noBasementConstructionCost = noBasementEffectiveArea * finalCostPerSqm;
    const premiumReferenceConstructionCost = effectiveArea * premiumReferenceFinalCostPerSqm;
    const weightedBasementRatio = weightedBasementArea / Math.max(mainArea, 1);
    const adjustedKg300Share = BASE_GROUP_SHARE_KG300;
    const kg200Base = Math.round(baseConstructionCost * BASE_GROUP_SHARE_KG200);
    const kg300Base = Math.round(baseConstructionCost * adjustedKg300Share);
    const accessibilityExecutionDelta = Math.max(0, siteAccessibility.sitePreparationFactor - 1);
    const kg300AccessibilityMultiplier = 1 + accessibilityExecutionDelta * 0.35;
    const interiorDeltaBathrooms = bathrooms - INTERIOR_BASELINE.bathrooms;
    const interiorDeltaWcs = wcs - INTERIOR_BASELINE.wcs;
    const qualityPackageMultiplier = quality.benchmarkFactor;
    const bedroomDelta = bedroomCount - residentialProgramBaseline.bedrooms;
    const bathroomDelta = bathrooms - residentialProgramBaseline.bathrooms;
    const wcDelta = wcs - residentialProgramBaseline.wcs;
    // KG400 is sourced only from calculator-engine. EstimateContext consumes engine output.
    const kg400EngineResult = useMemo(() => calculateKg400Costs({
        mainArea,
        finalCostPerSqm,
        qualityId,
        siteAccessibilityFactor: siteAccessibility.sitePreparationFactor,
        bedroomDelta,
        bathroomDelta,
        wcDelta,
        habitableBasementArea,
        hvacSelections,
    }), [
        mainArea,
        effectiveArea,
        finalCostPerSqm,
        qualityId,
        siteAccessibility,
        bedroomDelta,
        bathroomDelta,
        wcDelta,
        habitableBasementArea,
        hvacSelections,
    ]);
    const includedWardrobes = bedroomCount;
    const totalWardrobeCount = bedroomCount;
    const kitchenAreaFactor = getKitchenAreaFactor(effectiveArea);
    const suggestedKitchenUnitCost = Math.round(KG600_KITCHEN_PACKAGE_BASE_COST * kitchenAreaFactor * qualityPackageMultiplier);
    const suggestedGeneralFurnitureBaseAmount = getSuggestedGeneralFurnitureBaseAmount(effectiveArea, bedroomCount);
    const kitchenUnitCost = customKitchenUnitCost !== null && customKitchenUnitCost !== void 0 ? customKitchenUnitCost : suggestedKitchenUnitCost;
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
    const setBathrooms = useCallback((value) => {
        setBathroomsMode('manual');
        setBathroomsManualValue(Math.max(0, value));
    }, []);
    const setWcs = useCallback((value) => {
        setWcsMode('manual');
        setWcsManualValue(Math.max(0, value));
    }, []);
    const setBedroomCount = useCallback((value) => {
        setBedroomCountMode('manual');
        setBedroomCountManualValue(Math.max(1, value));
    }, []);
    const setKitchenCount = useCallback((value) => {
        setKitchenCountCustomized(true);
        setKitchenCountState(value);
    }, []);
    const setGeneralFurnitureBaseAmount = useCallback((value) => {
        setGeneralFurnitureBaseAmountCustomized(true);
        setGeneralFurnitureBaseAmountState(value);
    }, []);
    const categoryCosts = useMemo(() => {
        return COST_CATEGORIES.map((category) => {
            var _a;
            let categoryCost = 0;
            if (category.din276 === 'KG 300') {
                categoryCost = Math.round(kg300Base * (category.percentage / 67));
                categoryCost = Math.round(categoryCost * kg300AccessibilityMultiplier);
            }
            if (category.din276 === 'KG 400') {
                categoryCost = (_a = kg400EngineResult.categoryCostsById[category.id]) !== null && _a !== void 0 ? _a : 0;
            }
            if (category.din276 === 'KG 600') {
                categoryCost = category.id === 'furnishings'
                    ? kg600GeneralFurnishingsCost + kg600SpecialFurnishingsCost
                    : 0;
            }
            else if (category.id === 'interior') {
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
        effectiveArea,
        interiorDeltaBathrooms,
        interiorDeltaWcs,
        kg300AccessibilityMultiplier,
        kg400EngineResult,
        kg600GeneralFurnishingsCost,
        kg600SpecialFurnishingsCost,
    ]);
    const constructionCost = useMemo(() => categoryCosts.reduce((sum, c) => sum + c.cost, 0), [categoryCosts]);
    const kg300Cost = useMemo(() => categoryCosts.filter((c) => KG300_CATEGORY_IDS.includes(c.category.id)).reduce((s, c) => s + c.cost, 0), [categoryCosts]);
    const kg400Cost = kg400EngineResult.kg400Total;
    const kg600Cost = useMemo(() => categoryCosts.filter((c) => KG600_CATEGORY_IDS.includes(c.category.id)).reduce((s, c) => s + c.cost, 0), [categoryCosts]);
    const selectedUtilityConnectionCost = useMemo(() => {
        var _a;
        if (utilityConnectionId === 'custom')
            return customUtilityCost;
        const opt = UTILITY_CONNECTION_OPTIONS.find((o) => o.id === utilityConnectionId);
        return (_a = opt === null || opt === void 0 ? void 0 : opt.cost) !== null && _a !== void 0 ? _a : 4000;
    }, [utilityConnectionId, customUtilityCost]);
    const utilityGroupCosts = useMemo(() => getUtilityConnectionGroupCosts(utilityConnectionId, selectedUtilityConnectionCost), [utilityConnectionId, selectedUtilityConnectionCost]);
    const plotSizeFactor = useMemo(() => getPlotSizeFactor(plotSize), [plotSize]);
    const basementExcavationCost = useMemo(() => getBasementExcavationCost(basementArea, siteCondition, groundwaterCondition), [basementArea, siteCondition, groundwaterCondition]);
    const basementStructureCost = useMemo(() => {
        var _a, _b, _c;
        const storageBasementType = (_a = BASEMENT_TYPES.find((b) => b.id === 'storage')) !== null && _a !== void 0 ? _a : BASEMENT_TYPES[0];
        const parkingBasementType = (_b = BASEMENT_TYPES.find((b) => b.id === 'parking')) !== null && _b !== void 0 ? _b : BASEMENT_TYPES[0];
        const habitableBasementType = (_c = BASEMENT_TYPES.find((b) => b.id === 'habitable')) !== null && _c !== void 0 ? _c : BASEMENT_TYPES[0];
        let cost = storageBasementArea * storageBasementType.structureCostPerSqm +
            parkingBasementArea * parkingBasementType.structureCostPerSqm +
            habitableBasementArea * habitableBasementType.structureCostPerSqm;
        if (groundwaterCondition.basementCostMultiplier > 1) {
            cost *= 1.08;
        }
        return Math.round(cost);
    }, [storageBasementArea, parkingBasementArea, habitableBasementArea, groundwaterCondition]);
    const basementTotalCost = basementExcavationCost + basementStructureCost;
    const sitePreparationMultiplier = useMemo(() => clampSitePreparationMultiplier(plotSizeFactor * siteCondition.sitePreparationFactor * siteAccessibility.sitePreparationFactor), [plotSizeFactor, siteCondition, siteAccessibility]);
    const siteExcavationCost = useMemo(() => Math.round(kg200Base * sitePreparationMultiplier), [kg200Base, sitePreparationMultiplier]);
    const kg200Total = siteExcavationCost + selectedUtilityConnectionCost + group240Cost + group250Cost;
    const premiumReferenceKg300Base = Math.round(premiumReferenceConstructionCost * BASE_GROUP_SHARE_KG300);
    const noBasementKg300Base = Math.round(noBasementConstructionCost * BASE_GROUP_SHARE_KG300);
    const rawBaseSubgroup310Cost = Math.round(premiumReferenceKg300Base * 0.02);
    const rawBaseSubgroup320Cost = Math.round(premiumReferenceKg300Base * 0.12);
    const structuralBaseSubgroup350Cost = Math.round(premiumReferenceKg300Base * 0.10);
    const baseSiteFactor310 = (_a = BASE_SITE_CONDITION_FACTORS_310[siteConditionId]) !== null && _a !== void 0 ? _a : 1.00;
    const baseSiteFactor320 = (_b = BASE_SITE_CONDITION_FACTORS_320[siteConditionId]) !== null && _b !== void 0 ? _b : 1.00;
    const baseGroundwaterFactor310 = (_c = BASE_GROUNDWATER_FACTORS_310[groundwaterConditionId]) !== null && _c !== void 0 ? _c : 1.00;
    const baseGroundwaterFactor320 = (_d = BASE_GROUNDWATER_FACTORS_320[groundwaterConditionId]) !== null && _d !== void 0 ? _d : 1.00;
    const adjustedBaseSubgroup310Cost = Math.round(rawBaseSubgroup310Cost * baseSiteFactor310 * baseGroundwaterFactor310);
    const adjustedBaseSubgroup320Cost = Math.round(rawBaseSubgroup320Cost * baseSiteFactor320 * baseGroundwaterFactor320);
    const baseStructuralAdjustment = (adjustedBaseSubgroup310Cost - rawBaseSubgroup310Cost) +
        (adjustedBaseSubgroup320Cost - rawBaseSubgroup320Cost);
    const kg300Total = kg300Cost + baseStructuralAdjustment;
    const kg300SubgroupCosts = useMemo(() => {
        var _a, _b, _c, _d;
        const noBasementAdjustedKg300 = noBasementKg300Base + baseStructuralAdjustment;
        const totalBasementDrivenKg300 = Math.max(0, kg300Total - noBasementAdjustedKg300);
        const basementSiteConditionFactor = basementArea > 0
            ? ((_a = BASEMENT_SITE_CONDITION_FACTORS[siteConditionId]) !== null && _a !== void 0 ? _a : 1.00)
            : 1.00;
        const basementGroundwaterFactor310 = basementArea > 0
            ? ((_b = BASEMENT_GROUNDWATER_FACTORS[groundwaterConditionId]) !== null && _b !== void 0 ? _b : 1.00)
            : 1.00;
        const basementGroundwaterFactor320 = basementArea > 0
            ? ((_c = BASEMENT_GROUNDWATER_FACTORS_320[groundwaterConditionId]) !== null && _c !== void 0 ? _c : 1.00)
            : 1.00;
        const basementFactor310 = basementArea > 0
            ? basementSiteConditionFactor * basementGroundwaterFactor310
            : 1.00;
        const basementFactor320 = basementArea > 0
            ? basementSiteConditionFactor * basementGroundwaterFactor320
            : 1.00;
        const rawBasementStructuralPool = basementArea > 0
            ? Math.min(totalBasementDrivenKg300, Math.round(basementArea * premiumReferenceFinalCostPerSqm * 0.10))
            : 0;
        const rawStructuralWeight310 = 0.25 * basementFactor310;
        const rawStructuralWeight320 = 0.75 * basementFactor320;
        const structuralWeightTotal = rawStructuralWeight310 + rawStructuralWeight320 || 1;
        const subgroup310BasementStructural = Math.round(rawBasementStructuralPool * (rawStructuralWeight310 / structuralWeightTotal));
        const subgroup320BasementStructural = Math.round(rawBasementStructuralPool - subgroup310BasementStructural);
        const basementTypePremiumPool = Math.max(0, totalBasementDrivenKg300 - rawBasementStructuralPool);
        const baseSubgroup350Cost = structuralBaseSubgroup350Cost;
        const baseSubgroup310Cost = adjustedBaseSubgroup310Cost;
        const baseSubgroup320Cost = adjustedBaseSubgroup320Cost;
        const baseStructuralCore = baseSubgroup310Cost +
            baseSubgroup320Cost +
            baseSubgroup350Cost;
        const baseFlexibleKg300 = Math.max(0, noBasementAdjustedKg300 - baseStructuralCore);
        const flexibleShares = (_d = KG300_BASE_FLEXIBLE_SHARES[qualityId]) !== null && _d !== void 0 ? _d : KG300_BASE_FLEXIBLE_SHARES.premium;
        const subgroup330Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup330Share);
        const subgroup340Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup340Share);
        const subgroup350QualityCost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup350Share);
        const subgroup360Cost = Math.round(baseFlexibleKg300 * flexibleShares.subgroup360Share);
        const subgroup390BaseCost = Math.round(baseFlexibleKg300
            - subgroup330Cost
            - subgroup340Cost
            - subgroup350QualityCost
            - subgroup360Cost);
        const basementTypePremium330 = Math.round(basementTypePremiumPool * 0.15);
        const basementTypePremium340 = Math.round(basementTypePremiumPool * 0.55);
        const basementTypePremium350 = Math.round(basementTypePremiumPool - basementTypePremium330 - basementTypePremium340);
        const subgroup310BaseCost = baseSubgroup310Cost + subgroup310BasementStructural;
        const subgroup320BaseCost = baseSubgroup320Cost + subgroup320BasementStructural;
        const subgroup330BaseCost = subgroup330Cost + basementTypePremium330;
        const subgroup340BaseCost = subgroup340Cost + basementTypePremium340;
        const subgroup350BaseCost = baseSubgroup350Cost + subgroup350QualityCost + basementTypePremium350;
        const subgroup360BaseCost = subgroup360Cost;
        const subgroup390Cost = subgroup390BaseCost;
        const subgroup310AccessibilityCost = Math.round(subgroup310BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup310));
        const subgroup320AccessibilityCost = Math.round(subgroup320BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup320));
        const subgroup330AccessibilityCost = Math.round(subgroup330BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup330));
        const subgroup340AccessibilityCost = Math.round(subgroup340BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup340));
        const subgroup350AccessibilityCost = Math.round(subgroup350BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup350));
        const subgroup360AccessibilityCost = Math.round(subgroup360BaseCost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup360));
        const subgroup390AccessibilityCost = Math.round(subgroup390Cost * (1 + accessibilityExecutionDelta * KG300_ACCESSIBILITY_WEIGHTS.subgroup390));
        const rawKg300SubgroupTotal = subgroup310AccessibilityCost +
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
        const normalizedSubgroup390Cost = kg300Total
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
    const poolSizeOption = useMemo(() => { var _a; return (_a = POOL_SIZE_OPTIONS.find((p) => p.id === poolSizeId)) !== null && _a !== void 0 ? _a : POOL_SIZE_OPTIONS[1]; }, [poolSizeId]);
    const poolQualityOption = useMemo(() => { var _a; return (_a = POOL_QUALITY_OPTIONS.find((p) => p.id === poolQualityId)) !== null && _a !== void 0 ? _a : POOL_QUALITY_OPTIONS[0]; }, [poolQualityId]);
    const poolTypeOption = useMemo(() => { var _a; return (_a = POOL_TYPE_OPTIONS.find((p) => p.id === poolTypeId)) !== null && _a !== void 0 ? _a : POOL_TYPE_OPTIONS[0]; }, [poolTypeId]);
    const poolArea = poolSizeId === 'custom' ? poolCustomArea : poolSizeOption.area;
    const poolDepth = poolSizeId === 'custom' ? poolCustomDepth : DEFAULT_POOL_DEPTH;
    const poolCost = useMemo(() => {
        var _a;
        if (!includePool)
            return 0;
        const baseCost = poolQualityOption.baseCostPerSqm;
        const depthFactor = getPoolDepthFactor(poolDepth);
        const typeFactor = poolTypeOption.multiplier;
        const terrainFactor = (_a = POOL_TERRAIN_MULTIPLIERS[siteConditionId]) !== null && _a !== void 0 ? _a : 1.00;
        const calculated = poolArea * baseCost * depthFactor * typeFactor * terrainFactor;
        return Math.round(Math.max(calculated, POOL_MINIMUM_COST));
    }, [includePool, poolArea, poolDepth, poolQualityOption, poolTypeOption, siteConditionId]);
    const landscapingCost = useMemo(() => {
        if (landscapingArea <= 0)
            return 0;
        const baseCost = landscapingArea * LANDSCAPING_BASE_COST_PER_SQM;
        const sizeAdj = 1 + getLandscapingSizeAdjustment(landscapingArea);
        const siteAdj = siteCondition.terrainMultiplier;
        return Math.round(baseCost * sizeAdj * siteAdj);
    }, [landscapingArea, siteCondition]);
    const toggleHvacOption = useCallback((id) => {
        setHvacSelections((prev) => (Object.assign(Object.assign({}, prev), { [id]: !prev[id] })));
    }, []);
    const mainBuildingArea = useMemo(() => mainArea + terraceArea * 0.5, [mainArea, terraceArea]);
    const hvacCosts = useMemo(() => {
        return HVAC_OPTIONS.map((opt) => {
            var _a, _b;
            return ({
                option: opt,
                enabled: (_a = hvacSelections[opt.id]) !== null && _a !== void 0 ? _a : false,
                cost: (_b = kg400EngineResult.hvacOptionCosts[opt.id]) !== null && _b !== void 0 ? _b : 0,
            });
        });
    }, [hvacSelections, kg400EngineResult]);
    const totalHvacCost = useMemo(() => kg400EngineResult.hvacExtrasCost, [kg400EngineResult]);
    const permitDesignEffectiveArea = useMemo(() => mainBuildingArea + balconyArea * 0.30 + weightedBasementArea, [mainBuildingArea, balconyArea, weightedBasementArea]);
    const permitDesignFee = useMemo(() => {
        var _a;
        const areaFactor = permitDesignEffectiveArea > PERMIT_DESIGN_BASELINE_AREA_MAX
            ? permitDesignEffectiveArea / PERMIT_DESIGN_BASELINE_AREA_MAX
            : 1.0;
        const qualityFactor = (_a = PERMIT_DESIGN_QUALITY_MULTIPLIERS[qualityId]) !== null && _a !== void 0 ? _a : 1.0;
        return Math.round(PERMIT_DESIGN_BASELINE_FEE * areaFactor * qualityFactor);
    }, [permitDesignEffectiveArea, qualityId]);
    const kg400Total = kg400EngineResult.kg400Total;
    const kg500Total = poolCost + landscapingCost;
    const constructionSubtotal = useMemo(() => kg300Total + kg400Total + kg600Cost, [kg300Total, kg400Total, kg600Cost]);
    const contingencyPercent = (_e = CONTINGENCY_PERCENTAGES[qualityId]) !== null && _e !== void 0 ? _e : 0.10;
    const contingencyCost = Math.round(constructionSubtotal * contingencyPercent);
    const contractorCost = Math.round(constructionSubtotal * (contractorPercent / 100));
    const totalCost = kg200Total
        + constructionSubtotal
        + kg500Total
        + permitDesignFee
        + contingencyCost
        + contractorCost;
    const selectQuality = useCallback((id) => {
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
        }
        catch (e) {
            console.log('[Persistence] Error resetting data:', e);
        }
    }, [loadConfig]);
    const getAllScenarioConfigs = useCallback(() => {
        const snapshot = snapshotCurrentState();
        return scenarios.map((s, i) => {
            if (i === activeIndexRef.current) {
                return normalizeScenarioConfig(Object.assign(Object.assign({}, s), snapshot));
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
