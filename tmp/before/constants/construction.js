"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", { value: true });
exports.POOL_SIZE_OPTIONS = exports.SIZE_CORRECTION_ANCHORS = exports.BASE_EXCAVATION_COST_PER_SQM = exports.LANDSCAPING_BASE_COST_PER_SQM = exports.VERY_DIFFICULT_ACCESS_WARNING = exports.DIFFICULT_ACCESS_WARNING = exports.SITE_ACCESSIBILITY_TOOLTIP = exports.SITE_ACCESSIBILITY_OPTIONS = exports.HIGH_GROUNDWATER_WARNING = exports.GROUNDWATER_TOOLTIP = exports.GROUNDWATER_CONDITIONS = exports.UNSTABLE_SOIL_WARNING = exports.SITE_CONDITIONS_TOOLTIP = exports.SITE_CONDITIONS = exports.BASEMENT_TYPE_TOOLTIP = exports.BASEMENT_TYPES = exports.BASEMENT_BENCHMARK_RATE_FACTORS = exports.BASEMENT_TYPE_NAMES = exports.KG400_OPTION_PACKAGE_QUALITY_FACTORS = exports.KG400_AUTOMATION_UPLIFT_PER_SQM = exports.KG400_DATA_SECURITY_UPLIFT_PER_SQM = exports.KG400_PACKAGE_SELECTION_OPTIONS = exports.KG400_DATA_SECURITY_BASELINE_COST_PER_SQM = exports.KG400_WC_DELTA_BASE_COST = exports.KG400_BATHROOM_DELTA_BASE_COST = exports.KG400_BEDROOM_DELTA_BASE_COST = exports.KITCHEN_FURNITURE_PACKAGE_RATES = exports.AREA_610_RATES = exports.BEDROOM_PACKAGE_RATES = exports.KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST = exports.KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST = exports.KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT = exports.KG600_WARDROBE_PACKAGE_BASE_COST = exports.KG600_KITCHEN_PACKAGE_BASE_COST = exports.COST_CATEGORIES = exports.QUALITY_LEVELS = exports.LOCATIONS = exports.BASEMENT_KG300_SUBGROUP_FACTORS = exports.BASEMENT_LEVEL1_ALLOCATION_SHARES = exports.LEVEL_1_BENCHMARK_RAW_SHARES = exports.KG600_BASE_SHARE = exports.KG400_BASE_SHARE = exports.KG300_BASE_SHARE = exports.BASE_GROUP_SHARE_KG400 = exports.BASE_GROUP_SHARE_KG300 = exports.BASE_GROUP_SHARE_KG200 = exports.DEFAULT_QUALITY_ID = exports.LUXURY_BENCHMARK_BASE_COST_PER_SQM = exports.MID_RANGE_BENCHMARK_BASE_COST_PER_SQM = exports.ECONOMY_BENCHMARK_BASE_COST_PER_SQM = void 0;
exports.formatEuro = exports.formatNumber = exports.SIZE_CORRECTION_TABLE = exports.PERMIT_DESIGN_CONTACT_LABEL = exports.PERMIT_DESIGN_CONTACT_URL = exports.PERMIT_DESIGN_LARGE_PROJECT_MESSAGE = exports.PERMIT_DESIGN_TOOLTIP = exports.PERMIT_DESIGN_QUALITY_MULTIPLIERS = exports.PERMIT_DESIGN_BASELINE_AREA_MAX = exports.PERMIT_DESIGN_BASELINE_FEE = exports.INTERIOR_BASELINE = exports.INTERIOR_ADJUSTMENTS = exports.HVAC_TOOLTIP = exports.HVAC_OPTIONS = exports.KG600_CATEGORY_IDS = exports.KG500_CATEGORY_IDS = exports.KG400_CATEGORY_IDS = exports.KG300_CATEGORY_IDS = exports.DISCLAIMER_TEXT = exports.DIN276_GROUPS = exports.CONSTRUCTION_SUBTOTAL_DISCLAIMER = exports.CONTINGENCY_PERCENTAGES = exports.UTILITY_CONNECTION_TOOLTIP = exports.UTILITY_CONNECTION_OPTIONS = exports.UTILITY_CONNECTION_TOOLTIP_EXTENDED = exports.CONTRACTOR_STEP = exports.CONTRACTOR_MAX_PERCENTAGE = exports.CONTRACTOR_MIN_PERCENTAGE = exports.DEFAULT_CONTRACTOR_PERCENTAGE = exports.COST_BASIS_SCOPE_TEXT = exports.COST_BASIS_SCOPE_TITLE = exports.COST_BASIS_TEXT = exports.COST_BASIS_TITLE = exports.POOL_TOOLTIP = exports.POOL_MINIMUM_COST = exports.POOL_TERRAIN_MULTIPLIERS = exports.POOL_TYPE_OPTIONS = exports.POOL_QUALITY_OPTIONS = exports.DEFAULT_POOL_DEPTH = void 0;
exports.normalizeQualityId = normalizeQualityId;
exports.getKg400OptionalPackageAreaFactor = getKg400OptionalPackageAreaFactor;
exports.getResidentialProgramBaseline = getResidentialProgramBaseline;
exports.getKitchenAreaFactor = getKitchenAreaFactor;
exports.getSuggestedGeneralFurniture = getSuggestedGeneralFurniture;
exports.getSizeCorrectionFactor = getSizeCorrectionFactor;
exports.formatSizeCorrectionFactorLabel = formatSizeCorrectionFactorLabel;
exports.getBasementExcavationCost = getBasementExcavationCost;
exports.getBasementStructureCost = getBasementStructureCost;
exports.getBasementRockyAdjustment = getBasementRockyAdjustment;
exports.getPoolDepthFactor = getPoolDepthFactor;
exports.getUtilityConnectionGroupCosts = getUtilityConnectionGroupCosts;
const format_1 = require("../utils/format");
const din276Groups_1 = require("./din276Groups");
exports.ECONOMY_BENCHMARK_BASE_COST_PER_SQM = 1473;
exports.MID_RANGE_BENCHMARK_BASE_COST_PER_SQM = 1756;
exports.LUXURY_BENCHMARK_BASE_COST_PER_SQM = 2193;
exports.DEFAULT_QUALITY_ID = 'midRange';
function normalizeQualityId(value) {
    switch (value) {
        case 'economy':
        case 'midRange':
        case 'luxury':
            return value;
        case 'standard':
            return 'economy';
        case 'premium':
            return 'midRange';
        default:
            return exports.DEFAULT_QUALITY_ID;
    }
}
exports.BASE_GROUP_SHARE_KG200 = 0.015;
exports.BASE_GROUP_SHARE_KG300 = 0.64;
exports.BASE_GROUP_SHARE_KG400 = 0.345;
exports.KG300_BASE_SHARE = exports.BASE_GROUP_SHARE_KG300;
exports.KG400_BASE_SHARE = exports.BASE_GROUP_SHARE_KG400;
exports.KG600_BASE_SHARE = 0;
exports.LEVEL_1_BENCHMARK_RAW_SHARES = {
    economy: { kg300: 68, kg400: 32 },
    midRange: { kg300: 66, kg400: 34 },
    luxury: { kg300: 64, kg400: 36 },
};
exports.BASEMENT_LEVEL1_ALLOCATION_SHARES = {
    economy: { kg300: 78, kg400: 22 },
    midRange: { kg300: 76, kg400: 24 },
    luxury: { kg300: 73, kg400: 27 },
};
exports.BASEMENT_KG300_SUBGROUP_FACTORS = {
    storage: {
        subgroup310: 0.160000,
        subgroup320: 0.270000,
        subgroup330: 0.240000,
        subgroup340: 0.080000,
        subgroup350: 0.250000,
    },
    parking: {
        subgroup310: 0.123077,
        subgroup320: 0.207692,
        subgroup330: 0.281781,
        subgroup340: 0.058704,
        subgroup350: 0.328745,
    },
    habitable: {
        subgroup310: 0.094118,
        subgroup320: 0.158824,
        subgroup330: 0.340763,
        subgroup340: 0.131063,
        subgroup350: 0.275232,
    },
};
exports.LOCATIONS = [
    { id: 'athens', name: 'Athens', region: 'Attica', multiplier: 1.00 },
    { id: 'thessaloniki', name: 'Thessaloniki', region: 'Central Macedonia', multiplier: 1.00 },
    { id: 'peloponnese', name: 'Peloponnese', region: 'Peloponnese', multiplier: 1.00 },
    { id: 'crete', name: 'Crete (Chania)', region: 'Crete', multiplier: 1.05 },
    { id: 'corfu', name: 'Corfu', region: 'Ionian Islands', multiplier: 1.08 },
    { id: 'rhodes', name: 'Rhodes', region: 'Dodecanese', multiplier: 1.08 },
    { id: 'paros', name: 'Paros', region: 'Cyclades', multiplier: 1.10 },
    { id: 'paxos_antipaxos', name: 'Paxos / Antipaxos', region: 'Ionian Islands', multiplier: 1.10 },
    { id: 'santorini', name: 'Santorini', region: 'Cyclades', multiplier: 1.10 },
    { id: 'mykonos', name: 'Mykonos', region: 'Cyclades', multiplier: 1.10 },
];
exports.QUALITY_LEVELS = [
    {
        id: 'economy',
        name: 'Economy',
        description: 'Cost-conscious materials, energy-efficient, practical finishes',
        baseCostPerSqm: exports.ECONOMY_BENCHMARK_BASE_COST_PER_SQM,
        benchmarkFactor: 0.90,
    },
    {
        id: 'midRange',
        name: 'Mid-Range',
        description: 'Balanced materials, smart-home ready, mid-range finishes',
        baseCostPerSqm: exports.MID_RANGE_BENCHMARK_BASE_COST_PER_SQM,
        benchmarkFactor: 1.00,
    },
    {
        id: 'luxury',
        name: 'Luxury',
        description: 'Top-tier materials, bespoke design, luxury finishes throughout',
        baseCostPerSqm: exports.LUXURY_BENCHMARK_BASE_COST_PER_SQM,
        benchmarkFactor: 1.15,
    },
];
exports.COST_CATEGORIES = [
    { id: 'concrete', din276: 'KG 300', name: 'Concrete & Structural', percentage: 18, description: 'Reinforced concrete, beams, columns, floor slabs, stairs' },
    { id: 'masonry', din276: 'KG 300', name: 'Masonry & Walls', percentage: 9, description: 'Exterior & interior walls, brick/block, lintels' },
    { id: 'roofing', din276: 'KG 300', name: 'Roofing & Waterproofing', percentage: 8, description: 'Roof structure, tiles/membrane, waterproofing, gutters' },
    { id: 'insulation', din276: 'KG 300', name: 'Insulation & Energy Envelope', percentage: 7, description: 'Thermal insulation (ETICS), energy systems, solar prep' },
    { id: 'windows', din276: 'KG 300', name: 'Windows, Doors & Facades', percentage: 10, description: 'Aluminium/PVC frames, double/triple glazing, exterior doors' },
    { id: 'interior', din276: 'KG 300', name: 'Interior Finishes', percentage: 15, description: 'Floor tiles/wood, wall finishes, ceilings, painting, doors' },
    { id: 'plumbing', din276: 'KG 400', subgroupCode: '410', name: 'Sanitary / Plumbing', percentage: 7, description: 'Water supply, drainage, sanitary pipework, bathroom fittings' },
    { id: 'heating', din276: 'KG 400', subgroupCode: '420', name: 'Heating', percentage: 6, description: 'Heat pump, heat distribution, domestic hot water, solar thermal' },
    { id: 'ventilation_cooling', din276: 'KG 400', subgroupCode: '430', name: 'Ventilation / Cooling', percentage: 4, description: 'Cooling, ventilation, ducts, fan-coils, air handling' },
    { id: 'electrical', din276: 'KG 400', subgroupCode: '440', name: 'Electrical', percentage: 5, description: 'Wiring, panels, sockets, lighting, grounding, PV-ready infrastructure' },
    { id: 'data_security', din276: 'KG 400', subgroupCode: '450', name: 'Data / Security', percentage: 1, description: 'Data cabling, networking, alarm, access control, security systems' },
    { id: 'automation', din276: 'KG 400', subgroupCode: '480', name: 'Automation / Smart Home', percentage: 1, description: 'Building automation, controls, smart-home integration, system logic' },
    { id: 'furnishings', din276: 'KG 600', subgroupCode: '620', name: 'Built-in Furnishings', percentage: 9, description: 'Kitchen, wardrobes, built-in storage, bathroom vanities' },
];
exports.KG600_KITCHEN_PACKAGE_BASE_COST = 7500;
exports.KG600_WARDROBE_PACKAGE_BASE_COST = 1800;
exports.KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT = 2500;
exports.KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST = 600;
exports.KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST = 300;
exports.BEDROOM_PACKAGE_RATES = {
    economy: 2500,
    midRange: 5000,
    luxury: 10000,
};
exports.AREA_610_RATES = {
    economy: 20,
    midRange: 35,
    luxury: 60,
};
exports.KITCHEN_FURNITURE_PACKAGE_RATES = {
    economy: 1500,
    midRange: 3000,
    luxury: 6000,
};
exports.KG400_BEDROOM_DELTA_BASE_COST = 1200;
exports.KG400_BATHROOM_DELTA_BASE_COST = 4500;
exports.KG400_WC_DELTA_BASE_COST = 2500;
exports.KG400_DATA_SECURITY_BASELINE_COST_PER_SQM = 6;
exports.KG400_PACKAGE_SELECTION_OPTIONS = [
    { id: 'no', name: 'No' },
    { id: 'yes', name: 'Yes' },
];
exports.KG400_DATA_SECURITY_UPLIFT_PER_SQM = {
    essential: 0,
    connected: 3.33,
    integrated: 6.5,
    custom: 0,
};
exports.KG400_AUTOMATION_UPLIFT_PER_SQM = {
    none: 0,
    connected: 50.0,
    integrated: 75.0,
    custom: 0,
};
exports.KG400_OPTION_PACKAGE_QUALITY_FACTORS = {
    economy: 1.00,
    midRange: 1.10,
    luxury: 1.20,
};
function getKg400OptionalPackageAreaFactor(mainArea) {
    if (mainArea <= 120)
        return 0.95;
    if (mainArea <= 220)
        return 1.00;
    if (mainArea <= 320)
        return 1.08;
    return 1.15;
}
function getResidentialProgramBaseline(livingArea) {
    const bedrooms = livingArea < 50
        ? 1
        : 2 + Math.floor((livingArea - 50) / 50);
    const bathrooms = livingArea < 100 ? 1 : 2;
    const wcs = 1;
    return {
        bedrooms,
        bathrooms,
        wcs,
    };
}
function getKitchenAreaFactor(buildingArea) {
    if (buildingArea <= 80)
        return 0.85;
    if (buildingArea <= 140)
        return 1.00;
    if (buildingArea <= 220)
        return 1.20;
    if (buildingArea <= 320)
        return 1.40;
    return 1.65;
}
function getSuggestedGeneralFurniture(buildingArea, qualityId, bedroomCount, kitchenCount) {
    var _a, _b, _c;
    const resolvedBedroomCount = Math.max(0, bedroomCount);
    const resolvedKitchenCount = Math.max(0, kitchenCount);
    const bedroomPackageCost = resolvedBedroomCount * ((_a = exports.BEDROOM_PACKAGE_RATES[qualityId]) !== null && _a !== void 0 ? _a : exports.BEDROOM_PACKAGE_RATES[exports.DEFAULT_QUALITY_ID]);
    const areaBased610Cost = Math.max(0, buildingArea) * ((_b = exports.AREA_610_RATES[qualityId]) !== null && _b !== void 0 ? _b : exports.AREA_610_RATES[exports.DEFAULT_QUALITY_ID]);
    const kitchenFurnitureCost = resolvedKitchenCount * ((_c = exports.KITCHEN_FURNITURE_PACKAGE_RATES[qualityId]) !== null && _c !== void 0 ? _c : exports.KITCHEN_FURNITURE_PACKAGE_RATES[exports.DEFAULT_QUALITY_ID]);
    return Math.round(bedroomPackageCost + areaBased610Cost + kitchenFurnitureCost);
}
exports.BASEMENT_TYPE_NAMES = {
    storage: 'Storage/Technical Basement Area',
    parking: 'Parking Basement Area',
    habitable: 'Habitable Basement Area',
};
exports.BASEMENT_BENCHMARK_RATE_FACTORS = {
    storage: 0.50,
    parking: 0.65,
    habitable: 0.85,
};
exports.BASEMENT_TYPES = [
    {
        id: 'storage',
        name: exports.BASEMENT_TYPE_NAMES.storage,
        description: 'Storage, technical rooms, or utility spaces',
        costFactor: exports.BASEMENT_BENCHMARK_RATE_FACTORS.storage,
        structureCostPerSqm: 450,
    },
    {
        id: 'parking',
        name: exports.BASEMENT_TYPE_NAMES.parking,
        description: 'Car parking or vehicle storage',
        costFactor: exports.BASEMENT_BENCHMARK_RATE_FACTORS.parking,
        structureCostPerSqm: 550,
    },
    {
        id: 'habitable',
        name: exports.BASEMENT_TYPE_NAMES.habitable,
        description: 'Guest rooms, recreation, or additional dwelling space',
        costFactor: exports.BASEMENT_BENCHMARK_RATE_FACTORS.habitable,
        structureCostPerSqm: 750,
    },
];
exports.BASEMENT_TYPE_TOOLTIP = `Basement cost depends on use. Storage/Technical Basement Area requires fewer finishes, Parking Basement Area requires structural spans and ventilation, and Habitable Basement Area approaches the cost of above-ground living space.`;
exports.SITE_CONDITIONS = [
    {
        id: 'flat_normal',
        name: 'Flat / normal soil',
        description: 'Level terrain with standard soil conditions',
        terrainMultiplier: 1.00,
        isRocky: false,
    },
    {
        id: 'flat_rocky',
        name: 'Flat / rocky soil',
        description: 'Level terrain with rock requiring excavation',
        terrainMultiplier: 1.10,
        isRocky: true,
    },
    {
        id: 'inclined_normal',
        name: 'Inclined / normal soil',
        description: 'Sloped terrain with standard soil',
        terrainMultiplier: 1.30,
        isRocky: false,
    },
    {
        id: 'inclined_rocky',
        name: 'Inclined / rocky soil',
        description: 'Sloped terrain with rock requiring excavation',
        terrainMultiplier: 1.40,
        isRocky: true,
    },
    {
        id: 'inclined_sandy',
        name: 'Inclined / sandy or unstable soil',
        description: 'Sloped terrain with sandy or unstable ground',
        terrainMultiplier: 1.60,
        isRocky: false,
    },
];
exports.SITE_CONDITIONS_TOOLTIP = `Reflects general site difficulty affecting earthworks, foundations, and landscaping.\n\nDoes not replace a geotechnical or topographic study.`;
exports.UNSTABLE_SOIL_WARNING = `Inclined or unstable soil conditions can significantly increase construction costs. Actual costs depend on geotechnical investigation, slope stabilization requirements, and foundation design.`;
exports.GROUNDWATER_CONDITIONS = [
    {
        id: 'normal',
        name: 'Normal groundwater level',
        description: 'Standard groundwater conditions, no special measures required',
        basementCostMultiplier: 1.00,
    },
    {
        id: 'moderate',
        name: 'Moderate groundwater',
        description: 'Some waterproofing and drainage measures may be required',
        basementCostMultiplier: 1.08,
    },
    {
        id: 'high',
        name: 'High groundwater / coastal site',
        description: 'Requires waterproofing, drainage, and groundwater control',
        basementCostMultiplier: 1.15,
    },
];
exports.GROUNDWATER_TOOLTIP = `Groundwater conditions affect basement construction costs. High groundwater levels require waterproof concrete, drainage systems, and groundwater control during excavation.`;
exports.HIGH_GROUNDWATER_WARNING = `High groundwater levels can significantly increase basement construction costs due to waterproofing and drainage requirements.`;
exports.SITE_ACCESSIBILITY_OPTIONS = [
    {
        id: 'normal',
        name: 'Normal road access',
        description: 'Concrete trucks and construction equipment can reach the site easily',
        fixedCost: 0,
        siteAccessibilityFactor: 1.00,
    },
    {
        id: 'limited',
        name: 'Limited truck access',
        description: 'Narrow or steep roads may require smaller trucks or additional logistics',
        fixedCost: 0,
        siteAccessibilityFactor: 1.10,
    },
    {
        id: 'difficult',
        name: 'Difficult access / narrow road',
        description: 'Construction vehicles cannot reach the site directly. Materials may require cranes or manual transport',
        fixedCost: 0,
        siteAccessibilityFactor: 1.22,
    },
    {
        id: 'very_difficult',
        name: 'Very difficult access / crane logistics',
        description: 'Remote or inaccessible site requiring crane logistics and manual material transport',
        fixedCost: 0,
        siteAccessibilityFactor: 1.40,
    },
];
exports.SITE_ACCESSIBILITY_TOOLTIP = `Site accessibility affects the transport of materials, construction equipment, and construction logistics.`;
exports.DIFFICULT_ACCESS_WARNING = `Limited site access may increase construction costs due to transport logistics and construction equipment constraints.`;
exports.VERY_DIFFICULT_ACCESS_WARNING = `Very difficult site access with crane logistics can significantly increase construction costs and project duration.`;
exports.LANDSCAPING_BASE_COST_PER_SQM = 40;
exports.BASE_EXCAVATION_COST_PER_SQM = 80;
exports.SIZE_CORRECTION_ANCHORS = [
    { area: 20, factor: 1.03 },
    { area: 40, factor: 1.027 },
    { area: 60, factor: 1.022 },
    { area: 90, factor: 1.012 },
    { area: 130, factor: 1.0 },
    { area: 180, factor: 0.992 },
    { area: 250, factor: 0.985 },
    { area: 350, factor: 0.975 },
    { area: 500, factor: 0.965 },
    { area: 700, factor: 0.955 },
];
function interpolateLinearly(value, startValue, startFactor, endValue, endFactor) {
    if (endValue === startValue)
        return startFactor;
    return startFactor + ((value - startValue) / (endValue - startValue)) * (endFactor - startFactor);
}
function getSizeCorrectionFactor(livingArea) {
    const resolvedArea = Math.max(0, livingArea);
    const firstAnchor = exports.SIZE_CORRECTION_ANCHORS[0];
    const lastAnchor = exports.SIZE_CORRECTION_ANCHORS[exports.SIZE_CORRECTION_ANCHORS.length - 1];
    if (resolvedArea <= firstAnchor.area) {
        return firstAnchor.factor;
    }
    if (resolvedArea >= lastAnchor.area) {
        return lastAnchor.factor;
    }
    for (let index = 1; index < exports.SIZE_CORRECTION_ANCHORS.length; index += 1) {
        const previousAnchor = exports.SIZE_CORRECTION_ANCHORS[index - 1];
        const currentAnchor = exports.SIZE_CORRECTION_ANCHORS[index];
        if (resolvedArea <= currentAnchor.area) {
            return Number(interpolateLinearly(resolvedArea, previousAnchor.area, previousAnchor.factor, currentAnchor.area, currentAnchor.factor).toFixed(6));
        }
    }
    return lastAnchor.factor;
}
function formatSizeCorrectionFactorLabel(factor) {
    const adjustmentPercent = Math.round((factor - 1) * 1000) / 10;
    if (adjustmentPercent === 0) {
        return 'base';
    }
    const fractionDigits = Number.isInteger(adjustmentPercent) ? 0 : 1;
    const formattedPercent = (0, format_1.formatNumber)(Math.abs(adjustmentPercent), fractionDigits);
    return `${adjustmentPercent > 0 ? '+' : '-'}${formattedPercent}%`;
}
function getBasementExcavationCost(basementArea, siteCondition, groundwaterCondition) {
    if (basementArea <= 0)
        return 0;
    let cost = basementArea * exports.BASE_EXCAVATION_COST_PER_SQM;
    cost *= siteCondition.terrainMultiplier;
    if (siteCondition.isRocky) {
        cost *= 1.15;
    }
    if (groundwaterCondition.basementCostMultiplier > 1) {
        cost *= groundwaterCondition.basementCostMultiplier;
    }
    return Math.round(cost);
}
function getBasementStructureCost(basementArea, basementType, groundwaterCondition) {
    if (basementArea <= 0)
        return 0;
    let cost = basementArea * basementType.structureCostPerSqm;
    if (groundwaterCondition.basementCostMultiplier > 1) {
        cost *= 1.08;
    }
    return Math.round(cost);
}
function getBasementRockyAdjustment(basementArea) {
    if (basementArea <= 50)
        return 0;
    if (basementArea <= 120)
        return 0.05;
    if (basementArea <= 250)
        return 0.10;
    return 0.15;
}
exports.POOL_SIZE_OPTIONS = [
    { id: 'small', name: 'Small Pool', area: 20 },
    { id: 'medium', name: 'Medium Pool', area: 35 },
    { id: 'large', name: 'Large Pool', area: 55 },
    { id: 'custom', name: 'Custom Dimensions', area: 0 },
];
exports.DEFAULT_POOL_DEPTH = 1.40;
exports.POOL_QUALITY_OPTIONS = [
    { id: 'standard', name: 'Standard Pool', description: 'Reinforced concrete pool with standard finishes', baseCostPerSqm: 500 },
    { id: 'enhanced', name: 'Enhanced Pool', description: 'Higher-grade finishes and equipment', baseCostPerSqm: 675 },
];
exports.POOL_TYPE_OPTIONS = [
    { id: 'skimmer', name: 'Standard Skimmer Pool', description: 'Traditional skimmer filtration system', multiplier: 1.00 },
    { id: 'infinity', name: 'Infinity / Overflow Pool', description: 'Overflow edge with additional hydraulic systems', multiplier: 1.40 },
];
function getPoolDepthFactor(depth) {
    if (depth <= 1.20)
        return 0.90;
    if (depth <= 1.50)
        return 1.00;
    if (depth <= 1.80)
        return 1.10;
    return 1.20;
}
exports.POOL_TERRAIN_MULTIPLIERS = {
    flat_normal: 1.00,
    flat_rocky: 1.05,
    inclined_normal: 1.15,
    inclined_rocky: 1.25,
    inclined_sandy: 1.35,
};
exports.POOL_MINIMUM_COST = 7500;
exports.POOL_TOOLTIP = `Pool cost depends on size, depth, construction type, and site terrain conditions. Infinity pools require additional hydraulic systems and overflow structures.`;
exports.COST_BASIS_TITLE = `Direct Construction Cost`;
exports.COST_BASIS_TEXT = `This benchmark defines the core construction cost level of the project. It mainly drives KG 300, KG 400, and KG 600, while some preliminary works may also be benchmark-linked.
Other project-specific items are calculated separately. Regional cost differences are reflected through the location adjustment factor.`;
exports.COST_BASIS_SCOPE_TITLE = `Separately Calculated`;
exports.COST_BASIS_SCOPE_TEXT = `Project-specific items are calculated separately from the base benchmark, including KG 200 subgroups 220–250, external works (KG 500), planning and professional fees (KG 700), contractor overhead & profit, and VAT.`;
exports.DEFAULT_CONTRACTOR_PERCENTAGE = 12;
exports.CONTRACTOR_MIN_PERCENTAGE = 0;
exports.CONTRACTOR_MAX_PERCENTAGE = 35;
exports.CONTRACTOR_STEP = 0.5;
exports.UTILITY_CONNECTION_TOOLTIP_EXTENDED = `Covers electricity, water supply, sewage/drainage, and telecommunications connections to public infrastructure networks. Classified under KG 200 - Site Preparation.`;
exports.UTILITY_CONNECTION_OPTIONS = [
    {
        id: 'standard',
        name: 'Standard connection',
        description: 'Typical urban or suburban utility hookup',
        cost: 1500,
    },
    {
        id: 'difficult',
        name: 'Difficult connection',
        description: 'Extended infrastructure or complex terrain',
        cost: 2200,
    },
    {
        id: 'remote',
        name: 'Remote location',
        description: 'Long-distance utility extension required',
        cost: 3000,
    },
    {
        id: 'custom',
        name: 'Custom connection cost',
        description: 'Enter a manual cost estimate',
        cost: 0,
    },
];
const UTILITY_CONNECTION_SPLITS = {
    standard: { group220Share: 0.70, group230Share: 0.30 },
    difficult: { group220Share: 0.60, group230Share: 0.40 },
    remote: { group220Share: 0.40, group230Share: 0.60 },
    custom: { group220Share: 0.60, group230Share: 0.40 },
};
function getUtilityConnectionGroupCosts(optionId, totalCost) {
    var _a;
    const split = (_a = UTILITY_CONNECTION_SPLITS[optionId]) !== null && _a !== void 0 ? _a : UTILITY_CONNECTION_SPLITS.difficult;
    const group220Cost = Math.round(totalCost * split.group220Share);
    return {
        group220Cost,
        group230Cost: Math.round(totalCost - group220Cost),
    };
}
exports.UTILITY_CONNECTION_TOOLTIP = `Covers electricity, water supply, sewage/drainage, and telecommunications connections to public infrastructure networks.`;
exports.CONTINGENCY_PERCENTAGES = {
    economy: 0.10,
    midRange: 0.15,
    luxury: 0.20,
};
exports.CONSTRUCTION_SUBTOTAL_DISCLAIMER = `The construction subtotal includes direct building construction costs (KG 300 + KG 400 + KG 600), including basement contributions merged into KG 300 and KG 400, with size correction applied.\nSite preparation (KG 200), external works (KG 500), and planning fees (KG 700) are calculated separately.`;
exports.DIN276_GROUPS = {
    KG100: { code: 'KG 100', name: (_b = (_a = (0, din276Groups_1.getDin276Group)('100')) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : 'Land' },
    KG200: { code: 'KG 200', name: (_d = (_c = (0, din276Groups_1.getDin276Group)('200')) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : 'Preparatory Measures' },
    KG300: { code: 'KG 300', name: (_f = (_e = (0, din276Groups_1.getDin276Group)('300')) === null || _e === void 0 ? void 0 : _e.label) !== null && _f !== void 0 ? _f : 'Building - Construction Works' },
    KG400: { code: 'KG 400', name: (_h = (_g = (0, din276Groups_1.getDin276Group)('400')) === null || _g === void 0 ? void 0 : _g.label) !== null && _h !== void 0 ? _h : 'Technical Systems' },
    KG500: { code: 'KG 500', name: (_k = (_j = (0, din276Groups_1.getDin276Group)('500')) === null || _j === void 0 ? void 0 : _j.label) !== null && _k !== void 0 ? _k : 'External Works and Open Spaces' },
    KG600: { code: 'KG 600', name: (_m = (_l = (0, din276Groups_1.getDin276Group)('600')) === null || _l === void 0 ? void 0 : _l.label) !== null && _m !== void 0 ? _m : 'Furnishings and Artworks' },
    KG700: { code: 'KG 700', name: 'Planning & Professional Fees' },
};
exports.DISCLAIMER_TEXT = `This estimate is based on conventional construction assumptions (reinforced concrete structure, masonry walls with thermoblocks, and external thermal insulation system - ETICS).

The result is a preliminary cost estimation. Actual construction cost may vary depending on design, site conditions, contractor pricing, and market conditions.`;
exports.KG300_CATEGORY_IDS = ['concrete', 'masonry', 'roofing', 'insulation', 'windows', 'interior'];
exports.KG400_CATEGORY_IDS = ['plumbing', 'heating', 'ventilation_cooling', 'electrical', 'data_security', 'automation'];
exports.KG500_CATEGORY_IDS = [];
exports.KG600_CATEGORY_IDS = ['furnishings'];
exports.HVAC_OPTIONS = [
    {
        id: 'underfloor_heating',
        name: 'Underfloor Heating',
        description: 'Hydronic floor heating connected to the heat pump',
    },
    {
        id: 'solar_thermal',
        name: 'Solar Thermal System',
        description: 'Solar collectors for domestic hot water',
    },
    {
        id: 'photovoltaic',
        name: 'Photovoltaic System (PV)',
        description: 'Roof-mounted photovoltaic electricity generation',
    },
];
exports.HVAC_TOOLTIP = `The base calculation includes a standard heat pump with fan-coil or VRV heating/cooling. Optional systems add comfort or renewable energy production and scale with the effective building area.`;
exports.INTERIOR_ADJUSTMENTS = {
    bathroom: {
        interior: 0.04,
        plumbing: 0.18,
        furnishings: 0.06,
    },
    wc: {
        interior: 0.02,
        plumbing: 0.08,
        furnishings: 0.03,
    },
};
exports.INTERIOR_BASELINE = {
    bathrooms: 1,
    wcs: 1,
};
exports.PERMIT_DESIGN_BASELINE_FEE = 15000;
exports.PERMIT_DESIGN_BASELINE_AREA_MAX = 200;
exports.PERMIT_DESIGN_QUALITY_MULTIPLIERS = {
    economy: 1.00,
    midRange: 1.15,
    luxury: 1.30,
};
exports.PERMIT_DESIGN_TOOLTIP = `Permit and design fees depend on building size and project quality level. Larger or highly customized projects typically require additional design work.`;
exports.PERMIT_DESIGN_LARGE_PROJECT_MESSAGE = `Projects of this size or complexity typically require a tailored design proposal.`;
exports.PERMIT_DESIGN_CONTACT_URL = 'https://philippdoukakis.com';
exports.PERMIT_DESIGN_CONTACT_LABEL = 'Ask for detailed offer';
exports.SIZE_CORRECTION_TABLE = [
    { range: '< 120 m\u00B2', correction: '+10%' },
    { range: '120 - 160 m\u00B2', correction: '+5%' },
    { range: '160 - 220 m\u00B2', correction: 'base (no correction)' },
    { range: '220 - 300 m\u00B2', correction: '-5%' },
    { range: '> 300 m\u00B2', correction: '-10%' },
];
const formatNumber = (num) => {
    return (0, format_1.formatNumber)(num);
};
exports.formatNumber = formatNumber;
const formatEuro = (amount) => {
    return (0, format_1.formatCurrency)(amount);
};
exports.formatEuro = formatEuro;
