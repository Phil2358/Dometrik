"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEstimate = exports.EstimateProvider = void 0;
const create_context_hook_1 = __importDefault(require("@nkzw/create-context-hook"));
const react_1 = require("react");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const calculateProjectCost_1 = require("@/calculator-engine/calculateProjectCost");
const construction_1 = require("@/constants/construction");
function getProgramDefaultBuildingArea(config) {
    var _a;
    return (_a = config.mainArea) !== null && _a !== void 0 ? _a : 0;
}
function getProgramBaselineBuildingArea(config) {
    var _a;
    return (_a = config.mainArea) !== null && _a !== void 0 ? _a : 0;
}
function normalizeDataSecurityPackageLevel(level, selection) {
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
function normalizeAutomationPackageLevel(level, selection) {
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
function normalizeScenarioConfig(config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18;
    const landValue = (_a = config.landValue) !== null && _a !== void 0 ? _a : 0;
    const qualityId = (0, construction_1.normalizeQualityId)(config.qualityId);
    const persistedBuildingArea = (_c = (_b = config.buildingArea) !== null && _b !== void 0 ? _b : config.effectiveArea) !== null && _c !== void 0 ? _c : config.mainArea;
    const buildingArea = getProgramDefaultBuildingArea({
        mainArea: persistedBuildingArea,
        terraceArea: config.terraceArea,
        balconyArea: config.balconyArea,
        storageBasementArea: (_d = config.storageBasementArea) !== null && _d !== void 0 ? _d : 0,
        parkingBasementArea: (_e = config.parkingBasementArea) !== null && _e !== void 0 ? _e : 0,
        habitableBasementArea: (_f = config.habitableBasementArea) !== null && _f !== void 0 ? _f : 0,
    });
    const locationMultiplier = (_k = (_h = (_g = construction_1.LOCATIONS.find((entry) => entry.id === config.locationId)) === null || _g === void 0 ? void 0 : _g.multiplier) !== null && _h !== void 0 ? _h : (_j = construction_1.LOCATIONS[0]) === null || _j === void 0 ? void 0 : _j.multiplier) !== null && _k !== void 0 ? _k : 1;
    const rawLegacyBenchmarkOverridePerSqm = config.benchmarkOverrideMode === 'final_corrected'
        ? null
        : ((_m = (_l = config.customCostPerSqm) !== null && _l !== void 0 ? _l : config.benchmarkOverridePerSqm) !== null && _m !== void 0 ? _m : null);
    const benchmarkOverridePerSqm = rawLegacyBenchmarkOverridePerSqm !== null
        ? Math.round(Math.max(0, rawLegacyBenchmarkOverridePerSqm)
            * (0, construction_1.getSizeCorrectionFactor)(buildingArea)
            * locationMultiplier)
        : ((_o = config.benchmarkOverridePerSqm) !== null && _o !== void 0 ? _o : null);
    const plotSize = (_p = config.plotSize) !== null && _p !== void 0 ? _p : 4000;
    const legacyBasementArea = (_q = config.basementArea) !== null && _q !== void 0 ? _q : 0;
    const legacyBasementTypeId = (_r = config.basementTypeId) !== null && _r !== void 0 ? _r : 'storage';
    const hasMixedBasementAreas = config.storageBasementArea !== undefined ||
        config.parkingBasementArea !== undefined ||
        config.habitableBasementArea !== undefined;
    const storageBasementArea = hasMixedBasementAreas
        ? ((_s = config.storageBasementArea) !== null && _s !== void 0 ? _s : 0)
        : (legacyBasementTypeId === 'storage' ? legacyBasementArea : 0);
    const parkingBasementArea = hasMixedBasementAreas
        ? ((_t = config.parkingBasementArea) !== null && _t !== void 0 ? _t : 0)
        : (legacyBasementTypeId === 'parking' ? legacyBasementArea : 0);
    const habitableBasementArea = hasMixedBasementAreas
        ? ((_u = config.habitableBasementArea) !== null && _u !== void 0 ? _u : 0)
        : (legacyBasementTypeId === 'habitable' ? legacyBasementArea : 0);
    const basementArea = storageBasementArea + parkingBasementArea + habitableBasementArea;
    const landAcquisitionCostsMode = (_v = config.landAcquisitionCostsMode) !== null && _v !== void 0 ? _v : 'auto';
    const landAcquisitionCosts = (_w = config.landAcquisitionCosts) !== null && _w !== void 0 ? _w : 0;
    const vatPercent = Math.max(0, (_x = config.vatPercent) !== null && _x !== void 0 ? _x : 24);
    const efkaInsuranceManualCost = config.efkaInsuranceManualCost === null || config.efkaInsuranceManualCost === undefined
        ? null
        : Math.max(0, config.efkaInsuranceManualCost);
    const manualContingencyPercent = config.manualContingencyPercent === null || config.manualContingencyPercent === undefined
        ? null
        : Math.max(0, config.manualContingencyPercent);
    const manualContingencyCost = config.manualContingencyCost === null || config.manualContingencyCost === undefined
        ? null
        : Math.max(0, config.manualContingencyCost);
    const defaultBuildingArea = getProgramDefaultBuildingArea(Object.assign(Object.assign({}, config), { mainArea: persistedBuildingArea, storageBasementArea,
        parkingBasementArea,
        habitableBasementArea }));
    const defaultProgramBaseline = (0, construction_1.getResidentialProgramBaseline)(getProgramBaselineBuildingArea({
        mainArea: persistedBuildingArea,
    }));
    const recommendedKitchens = 1;
    const bathroomsMode = (_y = config.bathroomsMode) !== null && _y !== void 0 ? _y : 'auto';
    const bathroomsManualValue = bathroomsMode === 'manual'
        ? Math.max(0, (_0 = (_z = config.bathroomsManualValue) !== null && _z !== void 0 ? _z : config.bathrooms) !== null && _0 !== void 0 ? _0 : defaultProgramBaseline.bathrooms)
        : null;
    const wcsMode = (_1 = config.wcsMode) !== null && _1 !== void 0 ? _1 : 'auto';
    const wcsManualValue = wcsMode === 'manual'
        ? Math.max(0, (_3 = (_2 = config.wcsManualValue) !== null && _2 !== void 0 ? _2 : config.wcs) !== null && _3 !== void 0 ? _3 : defaultProgramBaseline.wcs)
        : null;
    const bedroomCountMode = (_4 = config.bedroomCountMode) !== null && _4 !== void 0 ? _4 : 'auto';
    const bedroomCountManualValue = bedroomCountMode === 'manual'
        ? Math.max(1, (_6 = (_5 = config.bedroomCountManualValue) !== null && _5 !== void 0 ? _5 : config.bedroomCount) !== null && _6 !== void 0 ? _6 : defaultProgramBaseline.bedrooms)
        : null;
    const kitchenCountMode = (_7 = config.kitchenCountMode) !== null && _7 !== void 0 ? _7 : (config.kitchenCountCustomized
        ? 'manual'
        : 'auto');
    const kitchenCountManualValue = kitchenCountMode === 'manual'
        ? Math.max(0, (_9 = (_8 = config.kitchenCountManualValue) !== null && _8 !== void 0 ? _8 : config.kitchenCount) !== null && _9 !== void 0 ? _9 : recommendedKitchens)
        : null;
    const bathrooms = bathroomsMode === 'manual'
        ? (bathroomsManualValue !== null && bathroomsManualValue !== void 0 ? bathroomsManualValue : defaultProgramBaseline.bathrooms)
        : defaultProgramBaseline.bathrooms;
    const wcs = wcsMode === 'manual'
        ? (wcsManualValue !== null && wcsManualValue !== void 0 ? wcsManualValue : defaultProgramBaseline.wcs)
        : defaultProgramBaseline.wcs;
    const bedroomCount = bedroomCountMode === 'manual'
        ? (bedroomCountManualValue !== null && bedroomCountManualValue !== void 0 ? bedroomCountManualValue : defaultProgramBaseline.bedrooms)
        : defaultProgramBaseline.bedrooms;
    const kitchenCount = kitchenCountMode === 'manual'
        ? (kitchenCountManualValue !== null && kitchenCountManualValue !== void 0 ? kitchenCountManualValue : recommendedKitchens)
        : recommendedKitchens;
    const customKitchenUnitCost = (_10 = config.customKitchenUnitCost) !== null && _10 !== void 0 ? _10 : null;
    const suggestedGeneralFurniture = (0, construction_1.getSuggestedGeneralFurniture)(defaultBuildingArea, (0, construction_1.normalizeQualityId)(config.qualityId), bedroomCount, kitchenCount);
    const generalFurnitureCustomized = (_12 = (_11 = config.generalFurnitureCustomized) !== null && _11 !== void 0 ? _11 : config.generalFurnitureBaseAmountCustomized) !== null && _12 !== void 0 ? _12 : (((_13 = config.generalFurniture) !== null && _13 !== void 0 ? _13 : config.generalFurnitureBaseAmount) !== undefined &&
        ((_14 = config.generalFurniture) !== null && _14 !== void 0 ? _14 : config.generalFurnitureBaseAmount) !== suggestedGeneralFurniture);
    const generalFurniture = generalFurnitureCustomized
        ? ((_16 = (_15 = config.generalFurniture) !== null && _15 !== void 0 ? _15 : config.generalFurnitureBaseAmount) !== null && _16 !== void 0 ? _16 : suggestedGeneralFurniture)
        : suggestedGeneralFurniture;
    const dataSecurityPackageLevel = normalizeDataSecurityPackageLevel(config.dataSecurityPackageLevel, config.dataSecurityPackageSelection);
    const dataSecurityManualQuote = (_17 = config.dataSecurityManualQuote) !== null && _17 !== void 0 ? _17 : null;
    const automationPackageLevel = normalizeAutomationPackageLevel(config.automationPackageLevel, config.automationPackageSelection);
    const automationManualQuote = (_18 = config.automationManualQuote) !== null && _18 !== void 0 ? _18 : null;
    return Object.assign(Object.assign({}, config), { qualityId,
        benchmarkOverridePerSqm, benchmarkOverrideMode: benchmarkOverridePerSqm !== null ? 'final_corrected' : undefined, vatPercent,
        efkaInsuranceManualCost,
        manualContingencyPercent,
        manualContingencyCost,
        plotSize,
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
        kitchenCountMode,
        kitchenCountManualValue,
        customKitchenUnitCost,
        generalFurniture,
        generalFurnitureCustomized,
        dataSecurityPackageLevel,
        dataSecurityManualQuote,
        automationPackageLevel,
        automationManualQuote });
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
    const defaultBuildingArea = getProgramDefaultBuildingArea({
        mainArea: 150,
        terraceArea: 30,
        balconyArea: 0,
        storageBasementArea: 0,
        parkingBasementArea: 0,
        habitableBasementArea: 0,
    });
    const defaultProgramBaseline = (0, construction_1.getResidentialProgramBaseline)(150);
    return {
        id: generateId(),
        name,
        locationId: 'corfu',
        qualityId: construction_1.DEFAULT_QUALITY_ID,
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
        poolCustomDepth: construction_1.DEFAULT_POOL_DEPTH,
        poolQualityId: 'standard',
        poolTypeId: 'skimmer',
        contractorPercent: construction_1.DEFAULT_CONTRACTOR_PERCENTAGE,
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
        generalFurniture: (0, construction_1.getSuggestedGeneralFurniture)(defaultBuildingArea, construction_1.DEFAULT_QUALITY_ID, defaultProgramBaseline.bedrooms, 1),
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
async function loadSavedScenarios() {
    try {
        const [scenariosJson, indexJson] = await Promise.all([
            async_storage_1.default.getItem(STORAGE_KEY_SCENARIOS),
            async_storage_1.default.getItem(STORAGE_KEY_ACTIVE_INDEX),
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
            async_storage_1.default.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(scenarios)),
            async_storage_1.default.setItem(STORAGE_KEY_ACTIVE_INDEX, String(activeIndex)),
        ]);
        console.log('[Persistence] Saved', scenarios.length, 'scenarios, active index:', activeIndex);
    }
    catch (e) {
        console.log('[Persistence] Error saving scenarios:', e);
    }
}
_a = (0, create_context_hook_1.default)(() => {
    const initialProgramDefaultBuildingArea = getProgramDefaultBuildingArea({
        mainArea: 150,
        terraceArea: 30,
        balconyArea: 0,
        storageBasementArea: 0,
        parkingBasementArea: 0,
        habitableBasementArea: 0,
    });
    const initialResidentialProgramBaseline = (0, construction_1.getResidentialProgramBaseline)(150);
    const [scenarios, setScenarios] = (0, react_1.useState)([
        createDefaultConfig('Scenario A'),
    ]);
    const [activeScenarioIndex, setActiveScenarioIndex] = (0, react_1.useState)(0);
    const hydratedRef = (0, react_1.useRef)(false);
    const savePendingRef = (0, react_1.useRef)(null);
    const [locationId, setLocationId] = (0, react_1.useState)('corfu');
    const [qualityId, setQualityId] = (0, react_1.useState)(construction_1.DEFAULT_QUALITY_ID);
    const [benchmarkOverridePerSqm, setBenchmarkOverridePerSqm] = (0, react_1.useState)(null);
    const [plotSize, setPlotSize] = (0, react_1.useState)(4000);
    const [mainArea, setMainArea] = (0, react_1.useState)(150);
    const [terraceArea, setTerraceArea] = (0, react_1.useState)(30);
    const [balconyArea, setBalconyArea] = (0, react_1.useState)(0);
    const [storageBasementArea, setStorageBasementArea] = (0, react_1.useState)(0);
    const [parkingBasementArea, setParkingBasementArea] = (0, react_1.useState)(0);
    const [habitableBasementArea, setHabitableBasementArea] = (0, react_1.useState)(0);
    const [includePool, setIncludePool] = (0, react_1.useState)(false);
    const [poolSizeId, setPoolSizeId] = (0, react_1.useState)('medium');
    const [poolCustomArea, setPoolCustomArea] = (0, react_1.useState)(35);
    const [poolCustomDepth, setPoolCustomDepth] = (0, react_1.useState)(construction_1.DEFAULT_POOL_DEPTH);
    const [poolQualityId, setPoolQualityId] = (0, react_1.useState)('standard');
    const [poolTypeId, setPoolTypeId] = (0, react_1.useState)('skimmer');
    const [contractorPercent, setContractorPercent] = (0, react_1.useState)(construction_1.DEFAULT_CONTRACTOR_PERCENTAGE);
    const [vatPercent, setVatPercent] = (0, react_1.useState)(24);
    const [efkaInsuranceManualCost, setEfkaInsuranceManualCost] = (0, react_1.useState)(null);
    const [manualContingencyPercent, setManualContingencyPercent] = (0, react_1.useState)(null);
    const [manualContingencyCost, setManualContingencyCost] = (0, react_1.useState)(null);
    const [siteConditionId, setSiteConditionId] = (0, react_1.useState)('flat_normal');
    const [landscapingArea, setLandscapingArea] = (0, react_1.useState)(0);
    const [landValue, setLandValue] = (0, react_1.useState)(0);
    const [landAcquisitionCosts, setLandAcquisitionCosts] = (0, react_1.useState)(0);
    const [landAcquisitionCostsMode, setLandAcquisitionCostsMode] = (0, react_1.useState)('auto');
    const [bathroomsMode, setBathroomsMode] = (0, react_1.useState)('auto');
    const [bathroomsManualValue, setBathroomsManualValue] = (0, react_1.useState)(null);
    const [wcsMode, setWcsMode] = (0, react_1.useState)('auto');
    const [wcsManualValue, setWcsManualValue] = (0, react_1.useState)(null);
    const [bedroomCountMode, setBedroomCountMode] = (0, react_1.useState)('auto');
    const [bedroomCountManualValue, setBedroomCountManualValue] = (0, react_1.useState)(null);
    const [kitchenCountMode, setKitchenCountMode] = (0, react_1.useState)('auto');
    const [kitchenCountManualValue, setKitchenCountManualValue] = (0, react_1.useState)(null);
    const [customKitchenUnitCost, setCustomKitchenUnitCost] = (0, react_1.useState)(null);
    const [generalFurniture, setGeneralFurnitureState] = (0, react_1.useState)((0, construction_1.getSuggestedGeneralFurniture)(initialProgramDefaultBuildingArea, construction_1.DEFAULT_QUALITY_ID, initialResidentialProgramBaseline.bedrooms, 1));
    const [generalFurnitureCustomized, setGeneralFurnitureCustomized] = (0, react_1.useState)(false);
    const [dataSecurityPackageLevel, setDataSecurityPackageLevel] = (0, react_1.useState)('essential');
    const [dataSecurityManualQuote, setDataSecurityManualQuote] = (0, react_1.useState)(null);
    const [automationPackageLevel, setAutomationPackageLevel] = (0, react_1.useState)('none');
    const [automationManualQuote, setAutomationManualQuote] = (0, react_1.useState)(null);
    const [hvacSelections, setHvacSelections] = (0, react_1.useState)({
        underfloor_heating: false,
        solar_thermal: false,
        photovoltaic: false,
    });
    const [utilityConnectionId, setUtilityConnectionId] = (0, react_1.useState)('standard');
    const [customUtilityCost, setCustomUtilityCost] = (0, react_1.useState)(4000);
    const [groundwaterConditionId, setGroundwaterConditionId] = (0, react_1.useState)('normal');
    const [siteAccessibilityId, setSiteAccessibilityId] = (0, react_1.useState)('normal');
    const serializeCurrentState = (0, react_1.useCallback)(() => {
        return {
            locationId,
            qualityId,
            benchmarkOverridePerSqm,
            benchmarkOverrideMode: benchmarkOverridePerSqm !== null ? 'final_corrected' : undefined,
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
            kitchenCount: kitchenCountMode === 'manual' ? kitchenCountManualValue !== null && kitchenCountManualValue !== void 0 ? kitchenCountManualValue : 1 : undefined,
            kitchenCountMode,
            kitchenCountManualValue: kitchenCountMode === 'manual' ? kitchenCountManualValue : null,
            customKitchenUnitCost,
            generalFurniture,
            generalFurnitureCustomized,
            dataSecurityPackageLevel,
            dataSecurityManualQuote,
            automationPackageLevel,
            automationManualQuote,
            hvacSelections: Object.assign({}, hvacSelections),
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
    const loadConfig = (0, react_1.useCallback)((config) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        setLocationId(config.locationId);
        setQualityId(config.qualityId);
        setBenchmarkOverridePerSqm(config.benchmarkOverridePerSqm);
        setPlotSize((_a = config.plotSize) !== null && _a !== void 0 ? _a : 4000);
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
        setVatPercent((_b = config.vatPercent) !== null && _b !== void 0 ? _b : 24);
        setEfkaInsuranceManualCost((_c = config.efkaInsuranceManualCost) !== null && _c !== void 0 ? _c : null);
        setManualContingencyPercent((_d = config.manualContingencyPercent) !== null && _d !== void 0 ? _d : null);
        setManualContingencyCost((_e = config.manualContingencyCost) !== null && _e !== void 0 ? _e : null);
        setSiteConditionId(config.siteConditionId);
        setLandscapingArea(config.landscapingArea);
        setLandValue(config.landValue);
        setLandAcquisitionCosts(config.landAcquisitionCosts);
        setLandAcquisitionCostsMode(config.landAcquisitionCostsMode);
        setBathroomsMode((_f = config.bathroomsMode) !== null && _f !== void 0 ? _f : 'auto');
        setBathroomsManualValue((_g = config.bathroomsManualValue) !== null && _g !== void 0 ? _g : null);
        setWcsMode((_h = config.wcsMode) !== null && _h !== void 0 ? _h : 'auto');
        setWcsManualValue((_j = config.wcsManualValue) !== null && _j !== void 0 ? _j : null);
        setBedroomCountMode((_k = config.bedroomCountMode) !== null && _k !== void 0 ? _k : 'auto');
        setBedroomCountManualValue((_l = config.bedroomCountManualValue) !== null && _l !== void 0 ? _l : null);
        setKitchenCountMode((_m = config.kitchenCountMode) !== null && _m !== void 0 ? _m : 'auto');
        setKitchenCountManualValue((_o = config.kitchenCountManualValue) !== null && _o !== void 0 ? _o : null);
        setCustomKitchenUnitCost(config.customKitchenUnitCost);
        setGeneralFurnitureState(config.generalFurniture);
        setGeneralFurnitureCustomized((_p = config.generalFurnitureCustomized) !== null && _p !== void 0 ? _p : false);
        setDataSecurityPackageLevel((_q = config.dataSecurityPackageLevel) !== null && _q !== void 0 ? _q : 'essential');
        setDataSecurityManualQuote((_r = config.dataSecurityManualQuote) !== null && _r !== void 0 ? _r : null);
        setAutomationPackageLevel((_s = config.automationPackageLevel) !== null && _s !== void 0 ? _s : 'none');
        setAutomationManualQuote((_t = config.automationManualQuote) !== null && _t !== void 0 ? _t : null);
        setHvacSelections(Object.assign({}, config.hvacSelections));
        setUtilityConnectionId(config.utilityConnectionId);
        setCustomUtilityCost(config.customUtilityCost);
        setGroundwaterConditionId(config.groundwaterConditionId);
        setSiteAccessibilityId(config.siteAccessibilityId);
    }, []);
    const activeIndexRef = (0, react_1.useRef)(activeScenarioIndex);
    activeIndexRef.current = activeScenarioIndex;
    const scenariosRef = (0, react_1.useRef)(scenarios);
    scenariosRef.current = scenarios;
    const scheduleSave = (0, react_1.useCallback)((updatedScenarios, updatedIndex) => {
        if (savePendingRef.current) {
            clearTimeout(savePendingRef.current);
        }
        savePendingRef.current = setTimeout(() => {
            void saveScenarios(updatedScenarios, updatedIndex);
            savePendingRef.current = null;
        }, 300);
    }, []);
    const persistState = (0, react_1.useCallback)(() => {
        if (!hydratedRef.current)
            return;
        const snapshot = serializeCurrentState();
        setScenarios((prev) => {
            const updated = prev.map((s, i) => i === activeIndexRef.current ? Object.assign(Object.assign({}, s), snapshot) : s);
            scenariosRef.current = updated;
            scheduleSave(updated, activeIndexRef.current);
            return updated;
        });
    }, [serializeCurrentState, scheduleSave]);
    (0, react_1.useEffect)(() => {
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
    (0, react_1.useEffect)(() => {
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
    const switchScenario = (0, react_1.useCallback)((index) => {
        if (index === activeIndexRef.current)
            return;
        const snapshot = serializeCurrentState();
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[activeIndexRef.current]) {
                updated[activeIndexRef.current] = Object.assign(Object.assign({}, updated[activeIndexRef.current]), snapshot);
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
    const cloneScenario = (0, react_1.useCallback)(() => {
        if (scenarios.length >= MAX_SCENARIOS) {
            console.log('Maximum scenarios reached:', MAX_SCENARIOS);
            return false;
        }
        const snapshot = serializeCurrentState();
        const existingNames = scenarios.map((s) => s.name);
        const newName = getNextScenarioName(existingNames);
        const newConfig = Object.assign(Object.assign({}, snapshot), { manualContingencyPercent: null, manualContingencyCost: null, id: generateId(), name: newName });
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[activeIndexRef.current]) {
                updated[activeIndexRef.current] = Object.assign(Object.assign({}, updated[activeIndexRef.current]), snapshot);
            }
            return [...updated, newConfig];
        });
        const newIndex = scenarios.length;
        setActiveScenarioIndex(newIndex);
        activeIndexRef.current = newIndex;
        return true;
    }, [scenarios, serializeCurrentState]);
    const duplicateScenario = (0, react_1.useCallback)((sourceIndex) => {
        if (scenarios.length >= MAX_SCENARIOS) {
            console.log('Maximum scenarios reached:', MAX_SCENARIOS);
            return false;
        }
        const snapshot = serializeCurrentState();
        const source = sourceIndex === activeIndexRef.current
            ? Object.assign(Object.assign({}, scenarios[sourceIndex]), snapshot) : scenarios[sourceIndex];
        if (!source)
            return false;
        const existingNames = scenarios.map((s) => s.name);
        const newName = getNextScenarioName(existingNames);
        const newConfig = Object.assign(Object.assign({}, source), { manualContingencyPercent: null, manualContingencyCost: null, id: generateId(), name: newName, hvacSelections: Object.assign({}, source.hvacSelections) });
        const newIndex = scenarios.length;
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[activeIndexRef.current]) {
                updated[activeIndexRef.current] = Object.assign(Object.assign({}, updated[activeIndexRef.current]), snapshot);
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
    const renameScenario = (0, react_1.useCallback)((index, newName) => {
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = Object.assign(Object.assign({}, updated[index]), { name: newName });
            }
            scheduleSave(updated, activeIndexRef.current);
            return updated;
        });
    }, [scheduleSave]);
    const deleteScenario = (0, react_1.useCallback)((index) => {
        if (scenarios.length <= 1)
            return;
        const snapshot = serializeCurrentState();
        setScenarios((prev) => {
            const updated = [...prev];
            if (updated[activeIndexRef.current]) {
                updated[activeIndexRef.current] = Object.assign(Object.assign({}, updated[activeIndexRef.current]), snapshot);
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
    }, [scenarios.length, serializeCurrentState, loadConfig, scheduleSave]);
    const location = (0, react_1.useMemo)(() => { var _a; return (_a = construction_1.LOCATIONS.find((l) => l.id === locationId)) !== null && _a !== void 0 ? _a : construction_1.LOCATIONS[0]; }, [locationId]);
    const quality = (0, react_1.useMemo)(() => { var _a, _b; return (_b = (_a = construction_1.QUALITY_LEVELS.find((q) => q.id === qualityId)) !== null && _a !== void 0 ? _a : construction_1.QUALITY_LEVELS.find((q) => q.id === construction_1.DEFAULT_QUALITY_ID)) !== null && _b !== void 0 ? _b : construction_1.QUALITY_LEVELS[0]; }, [qualityId]);
    const basementArea = storageBasementArea + parkingBasementArea + habitableBasementArea;
    const weightedBasementArea = (0, react_1.useMemo)(() => {
        var _a, _b, _c;
        const storageBasementType = (_a = construction_1.BASEMENT_TYPES.find((b) => b.id === 'storage')) !== null && _a !== void 0 ? _a : construction_1.BASEMENT_TYPES[0];
        const parkingBasementType = (_b = construction_1.BASEMENT_TYPES.find((b) => b.id === 'parking')) !== null && _b !== void 0 ? _b : construction_1.BASEMENT_TYPES[0];
        const habitableBasementType = (_c = construction_1.BASEMENT_TYPES.find((b) => b.id === 'habitable')) !== null && _c !== void 0 ? _c : construction_1.BASEMENT_TYPES[0];
        return storageBasementArea * storageBasementType.costFactor
            + parkingBasementArea * parkingBasementType.costFactor
            + habitableBasementArea * habitableBasementType.costFactor;
    }, [storageBasementArea, parkingBasementArea, habitableBasementArea]);
    const basementType = (0, react_1.useMemo)(() => {
        var _a;
        const activeTypes = [
            storageBasementArea > 0 ? 'storage' : null,
            parkingBasementArea > 0 ? 'parking' : null,
            habitableBasementArea > 0 ? 'habitable' : null,
        ].filter(Boolean);
        const activeTypeNames = activeTypes.map((typeId) => { var _a, _b; return (_b = (_a = construction_1.BASEMENT_TYPES.find((b) => b.id === typeId)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : construction_1.BASEMENT_TYPE_NAMES.storage; });
        if (activeTypes.length === 1) {
            return (_a = construction_1.BASEMENT_TYPES.find((b) => b.id === activeTypes[0])) !== null && _a !== void 0 ? _a : construction_1.BASEMENT_TYPES[0];
        }
        const weightedCostFactor = basementArea > 0 ? weightedBasementArea / basementArea : 0.50;
        return {
            id: 'mixed',
            name: activeTypes.length > 1 ? activeTypeNames.join(' + ') : construction_1.BASEMENT_TYPE_NAMES.storage,
            description: activeTypes.length > 1
                ? 'Combination of storage, parking, and/or habitable basement areas'
                : 'Storage, technical rooms, or utility spaces',
            costFactor: weightedCostFactor,
            structureCostPerSqm: 0,
        };
    }, [storageBasementArea, parkingBasementArea, habitableBasementArea, basementArea, weightedBasementArea]);
    const siteCondition = (0, react_1.useMemo)(() => { var _a; return (_a = construction_1.SITE_CONDITIONS.find((s) => s.id === siteConditionId)) !== null && _a !== void 0 ? _a : construction_1.SITE_CONDITIONS[0]; }, [siteConditionId]);
    const groundwaterCondition = (0, react_1.useMemo)(() => { var _a; return (_a = construction_1.GROUNDWATER_CONDITIONS.find((g) => g.id === groundwaterConditionId)) !== null && _a !== void 0 ? _a : construction_1.GROUNDWATER_CONDITIONS[0]; }, [groundwaterConditionId]);
    const siteAccessibility = (0, react_1.useMemo)(() => { var _a; return (_a = construction_1.SITE_ACCESSIBILITY_OPTIONS.find((a) => a.id === siteAccessibilityId)) !== null && _a !== void 0 ? _a : construction_1.SITE_ACCESSIBILITY_OPTIONS[0]; }, [siteAccessibilityId]);
    const manualBathrooms = bathroomsMode === 'manual'
        ? Math.max(0, bathroomsManualValue !== null && bathroomsManualValue !== void 0 ? bathroomsManualValue : 0)
        : undefined;
    const manualWcs = wcsMode === 'manual'
        ? Math.max(0, wcsManualValue !== null && wcsManualValue !== void 0 ? wcsManualValue : 0)
        : undefined;
    const manualBedroomCount = bedroomCountMode === 'manual'
        ? Math.max(1, bedroomCountManualValue !== null && bedroomCountManualValue !== void 0 ? bedroomCountManualValue : 1)
        : undefined;
    const manualKitchenCount = kitchenCountMode === 'manual'
        ? Math.max(0, kitchenCountManualValue !== null && kitchenCountManualValue !== void 0 ? kitchenCountManualValue : 1)
        : undefined;
    const setBathrooms = (0, react_1.useCallback)((value) => {
        setBathroomsMode('manual');
        setBathroomsManualValue(Math.max(0, value));
    }, []);
    const resetBathrooms = (0, react_1.useCallback)(() => {
        setBathroomsMode('auto');
        setBathroomsManualValue(null);
    }, []);
    const setWcs = (0, react_1.useCallback)((value) => {
        setWcsMode('manual');
        setWcsManualValue(Math.max(0, value));
    }, []);
    const resetWcs = (0, react_1.useCallback)(() => {
        setWcsMode('auto');
        setWcsManualValue(null);
    }, []);
    const setBedroomCount = (0, react_1.useCallback)((value) => {
        setBedroomCountMode('manual');
        setBedroomCountManualValue(Math.max(1, value));
    }, []);
    const resetBedroomCount = (0, react_1.useCallback)(() => {
        setBedroomCountMode('auto');
        setBedroomCountManualValue(null);
    }, []);
    const setKitchenCount = (0, react_1.useCallback)((value) => {
        setKitchenCountMode('manual');
        setKitchenCountManualValue(Math.max(0, value));
    }, []);
    const resetKitchenCount = (0, react_1.useCallback)(() => {
        setKitchenCountMode('auto');
        setKitchenCountManualValue(null);
    }, []);
    const setGeneralFurniture = (0, react_1.useCallback)((value) => {
        setGeneralFurnitureCustomized(true);
        setGeneralFurnitureState(value);
    }, []);
    const poolSizeOption = (0, react_1.useMemo)(() => { var _a; return (_a = construction_1.POOL_SIZE_OPTIONS.find((p) => p.id === poolSizeId)) !== null && _a !== void 0 ? _a : construction_1.POOL_SIZE_OPTIONS[1]; }, [poolSizeId]);
    const poolQualityOption = (0, react_1.useMemo)(() => { var _a; return (_a = construction_1.POOL_QUALITY_OPTIONS.find((p) => p.id === poolQualityId)) !== null && _a !== void 0 ? _a : construction_1.POOL_QUALITY_OPTIONS[0]; }, [poolQualityId]);
    const poolTypeOption = (0, react_1.useMemo)(() => { var _a; return (_a = construction_1.POOL_TYPE_OPTIONS.find((p) => p.id === poolTypeId)) !== null && _a !== void 0 ? _a : construction_1.POOL_TYPE_OPTIONS[0]; }, [poolTypeId]);
    const poolDepth = poolSizeId === 'custom' ? poolCustomDepth : construction_1.DEFAULT_POOL_DEPTH;
    const toggleHvacOption = (0, react_1.useCallback)((id) => {
        setHvacSelections((prev) => (Object.assign(Object.assign({}, prev), { [id]: !prev[id] })));
    }, []);
    const projectRollupResult = (0, react_1.useMemo)(() => (0, calculateProjectCost_1.calculateProjectCost)({
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
        generalFurniture: generalFurnitureCustomized ? generalFurniture : undefined,
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
    const hvacCosts = (0, react_1.useMemo)(() => {
        return construction_1.HVAC_OPTIONS.map((opt) => {
            var _a, _b;
            return ({
                option: opt,
                enabled: (_a = hvacSelections[opt.id]) !== null && _a !== void 0 ? _a : false,
                cost: (_b = projectRollupResult.hvacOptionCosts[opt.id]) !== null && _b !== void 0 ? _b : 0,
            });
        });
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
    const bedroomPackageCost = projectRollupResult.bedroomPackageCost;
    const areaBased610Cost = projectRollupResult.areaBased610Cost;
    const kitchenFurnitureCost = projectRollupResult.kitchenFurnitureCost;
    const kg610Total = projectRollupResult.kg610Total;
    const kitchenUnitCost = projectRollupResult.kitchenUnitCost;
    const kitchenPackageCost = projectRollupResult.kitchenPackageCost;
    const wardrobePackageCost = projectRollupResult.wardrobePackageCost;
    const bathroomWcFurnishingSliceCost = projectRollupResult.bathroomWcFurnishingSliceCost;
    const includedWardrobes = projectRollupResult.includedWardrobes;
    const totalWardrobeCount = projectRollupResult.totalWardrobeCount;
    const poolArea = projectRollupResult.poolArea;
    const poolCost = projectRollupResult.poolCost;
    const landAcquisitionAmount = projectRollupResult.landAcquisitionAmount;
    const landAcquisitionRatePercent = projectRollupResult.landAcquisitionRatePercent;
    const permitDesignBuildingArea = buildingArea;
    const setGeneralFurnitureMode = (0, react_1.useCallback)((isManual) => {
        setGeneralFurnitureState(suggestedGeneralFurniture);
        setGeneralFurnitureCustomized(isManual);
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
    const estimatedRangeLow = projectRollupResult.estimatedRangeLow;
    const estimatedRangeHigh = projectRollupResult.estimatedRangeHigh;
    const selectQuality = (0, react_1.useCallback)((id) => {
        setQualityId(id);
        setManualContingencyPercent(null);
        setManualContingencyCost(null);
    }, []);
    const canCloneScenario = scenarios.length < MAX_SCENARIOS;
    const resetAllData = (0, react_1.useCallback)(async () => {
        try {
            await async_storage_1.default.multiRemove([STORAGE_KEY_SCENARIOS, STORAGE_KEY_ACTIVE_INDEX]);
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
    const getAllScenarioConfigs = (0, react_1.useCallback)(() => {
        const snapshot = serializeCurrentState();
        return scenarios.map((s, i) => {
            if (i === activeIndexRef.current) {
                return Object.assign(Object.assign({}, s), snapshot);
            }
            return s;
        });
    }, [scenarios, serializeCurrentState]);
    return (0, react_1.useMemo)(() => ({
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
        landAcquisitionRatePercent,
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
        estimatedRangeLow,
        estimatedRangeHigh,
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
        bedroomPackageCost,
        areaBased610Cost,
        kitchenFurnitureCost,
        kg610Total,
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
        landValue, setLandValue, landAcquisitionCosts, setLandAcquisitionCosts, landAcquisitionAmount, landAcquisitionRatePercent,
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
        vatPercent, setVatPercent, vatAmount, totalCostInclVat, estimatedRangeLow, estimatedRangeHigh,
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
        suggestedKitchenUnitCost, suggestedGeneralFurniture, bedroomPackageCost, areaBased610Cost, kitchenFurnitureCost, kg610Total, kitchenUnitCost, kitchenPackageCost, wardrobePackageCost,
        bathroomWcFurnishingSliceCost, includedWardrobes, totalWardrobeCount,
        constructionSubtotal, basementBenchmarkRate, storageTechnicalBasementCost, parkingBasementCost, habitableBasementCost, basementBaseCost,
        basementBucket300, basementBucket400, basementKg300Total, basementKg300ModifierCost, basementKg300CategoryCostsById, basementKg400CategoryCostsById, basementKg300BaseSubgroupCosts, basementKg300SubgroupCosts, basementKg300ModifierDetails,
        contingencyPercent, recommendedContingencyCost, contingencyCost, permitDesignBuildingArea,
        basementTotalCost, siteExcavationCost, breakdownGroups,
        scenarios, activeScenarioIndex, switchScenario, cloneScenario, duplicateScenario, renameScenario, deleteScenario, canCloneScenario,
        getAllScenarioConfigs, resetAllData,
    ]);
}), exports.EstimateProvider = _a[0], exports.useEstimate = _a[1];
