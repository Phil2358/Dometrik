import { formatCurrency as formatDisplayCurrency, formatNumber as formatDisplayNumber } from '@/utils/format';

import { getDin276Group } from '@/constants/din276Groups';

export interface Location {
  id: string;
  name: string;
  region: string;
  multiplier: number;
}

export type QualityId = 'economy' | 'midRange' | 'luxury';
export type LegacyQualityId = 'standard' | 'premium';
export type CompatibleQualityId = QualityId | LegacyQualityId;

export interface QualityLevel {
  id: QualityId;
  name: string;
  description: string;
  baseCostPerSqm: number;
  benchmarkFactor: number;
}

export interface Level1BenchmarkRawShare {
  kg300: number;
  kg400: number;
}

export interface CostCategory {
  id: string;
  din276: string;
  subgroupCode?: string;
  name: string;
  percentage: number;
  description: string;
}

export const MID_RANGE_BENCHMARK_BASE_COST_PER_SQM = 1930;
export const DEFAULT_QUALITY_ID: QualityId = 'midRange';

export function normalizeQualityId(value: CompatibleQualityId | string | null | undefined): QualityId {
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
      return DEFAULT_QUALITY_ID;
  }
}

export const BASE_GROUP_SHARE_KG200 = 0.015;
export const BASE_GROUP_SHARE_KG300 = 0.64;
export const BASE_GROUP_SHARE_KG400 = 0.345;

export const KG300_BASE_SHARE = BASE_GROUP_SHARE_KG300;
export const KG400_BASE_SHARE = BASE_GROUP_SHARE_KG400;
export const KG600_BASE_SHARE = 0;

export const LEVEL_1_BENCHMARK_RAW_SHARES: Record<QualityId, Level1BenchmarkRawShare> = {
  economy: { kg300: 68, kg400: 32 },
  midRange: { kg300: 66, kg400: 34 },
  luxury: { kg300: 64, kg400: 36 },
};

export const BASEMENT_LEVEL1_ALLOCATION_SHARES: Record<QualityId, { kg300: number; kg400: number }> = {
  economy: { kg300: 78, kg400: 22 },
  midRange: { kg300: 76, kg400: 24 },
  luxury: { kg300: 73, kg400: 27 },
};

export const LOCATIONS: Location[] = [
  { id: 'corfu', name: 'Corfu', region: 'Ionian Islands', multiplier: 1.15 },
  { id: 'athens', name: 'Athens', region: 'Attica', multiplier: 1.00 },
  { id: 'thessaloniki', name: 'Thessaloniki', region: 'Central Macedonia', multiplier: 0.95 },
  { id: 'mykonos', name: 'Mykonos', region: 'Cyclades', multiplier: 1.35 },
  { id: 'santorini', name: 'Santorini', region: 'Cyclades', multiplier: 1.30 },
  { id: 'crete', name: 'Crete (Chania)', region: 'Crete', multiplier: 1.08 },
  { id: 'rhodes', name: 'Rhodes', region: 'Dodecanese', multiplier: 1.10 },
  { id: 'paros', name: 'Paros', region: 'Cyclades', multiplier: 1.20 },
  { id: 'peloponnese', name: 'Peloponnese', region: 'Peloponnese', multiplier: 0.95 },
  { id: 'lefkada', name: 'Lefkada', region: 'Ionian Islands', multiplier: 1.12 },
  { id: 'zakynthos', name: 'Zakynthos', region: 'Ionian Islands', multiplier: 1.10 },
  { id: 'kefalonia', name: 'Kefalonia', region: 'Ionian Islands', multiplier: 1.12 },
];

export const QUALITY_LEVELS: QualityLevel[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Cost-conscious materials, energy-efficient, practical finishes',
    baseCostPerSqm: Math.round(MID_RANGE_BENCHMARK_BASE_COST_PER_SQM * 0.90),
    benchmarkFactor: 0.90,
  },
  {
    id: 'midRange',
    name: 'Mid-Range',
    description: 'Balanced materials, smart-home ready, mid-range finishes',
    baseCostPerSqm: MID_RANGE_BENCHMARK_BASE_COST_PER_SQM,
    benchmarkFactor: 1.00,
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Top-tier materials, bespoke design, luxury finishes throughout',
    baseCostPerSqm: Math.round(MID_RANGE_BENCHMARK_BASE_COST_PER_SQM * 1.15),
    benchmarkFactor: 1.15,
  },
];

export const COST_CATEGORIES: CostCategory[] = [
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

export const KG600_KITCHEN_PACKAGE_BASE_COST = 7500;
export const KG600_WARDROBE_PACKAGE_BASE_COST = 1800;
export const KG600_GENERAL_FURNITURE_PER_BEDROOM_INCREMENT = 2500;
export const KG600_EXTRA_BATHROOM_FURNISHING_SLICE_BASE_COST = 600;
export const KG600_EXTRA_WC_FURNISHING_SLICE_BASE_COST = 300;
export const KG400_BEDROOM_DELTA_BASE_COST = 1200;
export const KG400_BATHROOM_DELTA_BASE_COST = 4500;
export const KG400_WC_DELTA_BASE_COST = 2500;
export const KG400_DATA_SECURITY_BASELINE_COST_PER_SQM = 6;
export type SmartSystemsPackageLevel = 'none' | 'connected' | 'integrated' | 'custom';
export type DataSecurityPackageLevel = 'essential' | 'connected' | 'integrated' | 'custom';
export type AutomationPackageLevel = SmartSystemsPackageLevel;
export type Kg400PackageSelection = 'no' | 'yes';

export const KG400_PACKAGE_SELECTION_OPTIONS: Array<{
  id: Kg400PackageSelection;
  name: string;
}> = [
  { id: 'no', name: 'No' },
  { id: 'yes', name: 'Yes' },
];

export const KG400_DATA_SECURITY_UPLIFT_PER_SQM: Record<DataSecurityPackageLevel, number> = {
  essential: 0,
  connected: 3.33,
  integrated: 6.5,
  custom: 0,
};
export const KG400_AUTOMATION_UPLIFT_PER_SQM: Record<AutomationPackageLevel, number> = {
  none: 0,
  connected: 50.0,
  integrated: 75.0,
  custom: 0,
};

export const KG400_OPTION_PACKAGE_QUALITY_FACTORS: Record<QualityId, number> = {
  economy: 1.00,
  midRange: 1.10,
  luxury: 1.20,
};

export function getKg400OptionalPackageAreaFactor(mainArea: number): number {
  if (mainArea <= 120) return 0.95;
  if (mainArea <= 220) return 1.00;
  if (mainArea <= 320) return 1.08;
  return 1.15;
}

export interface ResidentialProgramBaseline {
  bedrooms: number;
  bathrooms: number;
  wcs: number;
}

export function getResidentialProgramBaseline(livingArea: number): ResidentialProgramBaseline {
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

export function getKitchenAreaFactor(effectiveArea: number): number {
  if (effectiveArea <= 80) return 0.85;
  if (effectiveArea <= 140) return 1.00;
  if (effectiveArea <= 220) return 1.20;
  if (effectiveArea <= 320) return 1.40;
  return 1.65;
}

export function getSuggestedGeneralFurnitureBaseAmount(effectiveArea: number, bedroomCount: number): number {
  let areaBase = 4500;

  if (effectiveArea > 80) areaBase = 5500;
  if (effectiveArea > 140) areaBase = 7000;
  if (effectiveArea > 220) areaBase = 8500;
  if (effectiveArea > 320) areaBase = 10000;

  const bedroomAdjustment = Math.max(0, bedroomCount - 1) * 500;
  return areaBase + bedroomAdjustment;
}

export interface BasementType {
  id: string;
  name: string;
  description: string;
  costFactor: number;
  structureCostPerSqm: number;
}

export const BASEMENT_TYPE_NAMES = {
  storage: 'Storage/Technical Basement Area',
  parking: 'Parking Basement Area',
  habitable: 'Habitable Basement Area',
} as const;

export const BASEMENT_BENCHMARK_RATE_FACTORS = {
  storage: 0.50,
  parking: 0.65,
  habitable: 0.85,
} as const;

export const BASEMENT_TYPES: BasementType[] = [
  {
    id: 'storage',
    name: BASEMENT_TYPE_NAMES.storage,
    description: 'Storage, technical rooms, or utility spaces',
    costFactor: BASEMENT_BENCHMARK_RATE_FACTORS.storage,
    structureCostPerSqm: 450,
  },
  {
    id: 'parking',
    name: BASEMENT_TYPE_NAMES.parking,
    description: 'Car parking or vehicle storage',
    costFactor: BASEMENT_BENCHMARK_RATE_FACTORS.parking,
    structureCostPerSqm: 550,
  },
  {
    id: 'habitable',
    name: BASEMENT_TYPE_NAMES.habitable,
    description: 'Guest rooms, recreation, or additional dwelling space',
    costFactor: BASEMENT_BENCHMARK_RATE_FACTORS.habitable,
    structureCostPerSqm: 750,
  },
];

export const BASEMENT_TYPE_TOOLTIP = `Basement cost depends on use. Storage/Technical Basement Area requires fewer finishes, Parking Basement Area requires structural spans and ventilation, and Habitable Basement Area approaches the cost of above-ground living space.`;

export interface SiteCondition {
  id: string;
  name: string;
  description: string;
  terrainMultiplier: number;
  sitePreparationFactor: number;
  isRocky: boolean;
}

export const SITE_CONDITIONS: SiteCondition[] = [
  {
    id: 'flat_normal',
    name: 'Flat / normal soil',
    description: 'Level terrain with standard soil conditions',
    terrainMultiplier: 1.00,
    sitePreparationFactor: 0.90,
    isRocky: false,
  },
  {
    id: 'flat_rocky',
    name: 'Flat / rocky soil',
    description: 'Level terrain with rock requiring excavation',
    terrainMultiplier: 1.10,
    sitePreparationFactor: 1.10,
    isRocky: true,
  },
  {
    id: 'inclined_normal',
    name: 'Inclined / normal soil',
    description: 'Sloped terrain with standard soil',
    terrainMultiplier: 1.30,
    sitePreparationFactor: 1.25,
    isRocky: false,
  },
  {
    id: 'inclined_rocky',
    name: 'Inclined / rocky soil',
    description: 'Sloped terrain with rock requiring excavation',
    terrainMultiplier: 1.40,
    sitePreparationFactor: 1.45,
    isRocky: true,
  },
  {
    id: 'inclined_sandy',
    name: 'Inclined / sandy or unstable soil',
    description: 'Sloped terrain with sandy or unstable ground',
    terrainMultiplier: 1.60,
    sitePreparationFactor: 1.45,
    isRocky: false,
  },
];

export const SITE_CONDITIONS_TOOLTIP = `Reflects general site difficulty affecting earthworks, foundations, and landscaping.\n\nDoes not replace a geotechnical or topographic study.`;

export const UNSTABLE_SOIL_WARNING = `Inclined or unstable soil conditions can significantly increase construction costs. Actual costs depend on geotechnical investigation, slope stabilization requirements, and foundation design.`;

export interface GroundwaterCondition {
  id: string;
  name: string;
  description: string;
  basementCostMultiplier: number;
}

export const GROUNDWATER_CONDITIONS: GroundwaterCondition[] = [
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

export const GROUNDWATER_TOOLTIP = `Groundwater conditions affect basement construction costs. High groundwater levels require waterproof concrete, drainage systems, and groundwater control during excavation.`;

export const HIGH_GROUNDWATER_WARNING = `High groundwater levels can significantly increase basement construction costs due to waterproofing and drainage requirements.`;

export interface SiteAccessibility {
  id: string;
  name: string;
  description: string;
  fixedCost: number;
  sitePreparationFactor: number;
}

export const SITE_ACCESSIBILITY_OPTIONS: SiteAccessibility[] = [
  {
    id: 'normal',
    name: 'Normal road access',
    description: 'Concrete trucks and construction equipment can reach the site easily',
    fixedCost: 0,
    sitePreparationFactor: 1.00,
  },
  {
    id: 'limited',
    name: 'Limited truck access',
    description: 'Narrow or steep roads may require smaller trucks or additional logistics',
    fixedCost: 0,
    sitePreparationFactor: 1.10,
  },
  {
    id: 'difficult',
    name: 'Difficult access / narrow road',
    description: 'Construction vehicles cannot reach the site directly. Materials may require cranes or manual transport',
    fixedCost: 0,
    sitePreparationFactor: 1.22,
  },
  {
    id: 'very_difficult',
    name: 'Very difficult access / crane logistics',
    description: 'Remote or inaccessible site requiring crane logistics and manual material transport',
    fixedCost: 0,
    sitePreparationFactor: 1.40,
  },
];

export const SITE_ACCESSIBILITY_TOOLTIP = `Site accessibility affects the transport of materials, construction equipment, and construction logistics.`;

export const DIFFICULT_ACCESS_WARNING = `Limited site access may increase construction costs due to transport logistics and construction equipment constraints.`;

export const VERY_DIFFICULT_ACCESS_WARNING = `Very difficult site access with crane logistics can significantly increase construction costs and project duration.`;

export const LANDSCAPING_BASE_COST_PER_SQM = 40;

export const BASE_EXCAVATION_COST_PER_SQM = 80;

export function getPlotSizeFactor(plotSize: number): number {
  if (plotSize <= 800) return 0.90;
  if (plotSize <= 2000) return 1.00;
  if (plotSize <= 4000) return 1.10;
  if (plotSize <= 8000) return 1.22;
  return 1.35;
}

export function clampSitePreparationMultiplier(multiplier: number): number {
  return Math.min(1.80, Math.max(0.80, multiplier));
}

export function getSizeCorrectionFactor(livingArea: number): number {
  if (livingArea < 120) return 1.10;
  if (livingArea < 160) return 1.05;
  if (livingArea < 220) return 1.00;
  if (livingArea < 300) return 0.95;
  return 0.90;
}

export function getSizeCorrectionLabel(livingArea: number): string {
  if (livingArea < 120) return '+10%';
  if (livingArea < 160) return '+5%';
  if (livingArea < 220) return 'base';
  if (livingArea < 300) return '-5%';
  return '-10%';
}

export function getBasementExcavationCost(
  basementArea: number,
  siteCondition: SiteCondition,
  groundwaterCondition: GroundwaterCondition,
): number {
  if (basementArea <= 0) return 0;
  let cost = basementArea * BASE_EXCAVATION_COST_PER_SQM;
  cost *= siteCondition.terrainMultiplier;
  if (siteCondition.isRocky) {
    cost *= 1.15;
  }
  if (groundwaterCondition.basementCostMultiplier > 1) {
    cost *= groundwaterCondition.basementCostMultiplier;
  }
  return Math.round(cost);
}

export function getBasementStructureCost(
  basementArea: number,
  basementType: BasementType,
  groundwaterCondition: GroundwaterCondition,
): number {
  if (basementArea <= 0) return 0;
  let cost = basementArea * basementType.structureCostPerSqm;
  if (groundwaterCondition.basementCostMultiplier > 1) {
    cost *= 1.08;
  }
  return Math.round(cost);
}

export function getBasementRockyAdjustment(basementArea: number): number {
  if (basementArea <= 50) return 0;
  if (basementArea <= 120) return 0.05;
  if (basementArea <= 250) return 0.10;
  return 0.15;
}

export function getLandscapingSizeAdjustment(area: number): number {
  if (area <= 300) return 0;
  if (area <= 800) return 0.10;
  return 0.20;
}

export interface PoolSizeOption {
  id: string;
  name: string;
  area: number;
}

export const POOL_SIZE_OPTIONS: PoolSizeOption[] = [
  { id: 'small', name: 'Small Pool', area: 20 },
  { id: 'medium', name: 'Medium Pool', area: 35 },
  { id: 'large', name: 'Large Pool', area: 55 },
  { id: 'custom', name: 'Custom Dimensions', area: 0 },
];

export const DEFAULT_POOL_DEPTH = 1.40;

export interface PoolQualityOption {
  id: string;
  name: string;
  description: string;
  baseCostPerSqm: number;
}

export const POOL_QUALITY_OPTIONS: PoolQualityOption[] = [
  { id: 'standard', name: 'Standard Pool', description: 'Reinforced concrete pool with standard finishes', baseCostPerSqm: 1000 },
  { id: 'enhanced', name: 'Enhanced Pool', description: 'Higher-grade finishes and equipment', baseCostPerSqm: 1350 },
];

export interface PoolTypeOption {
  id: string;
  name: string;
  description: string;
  multiplier: number;
}

export const POOL_TYPE_OPTIONS: PoolTypeOption[] = [
  { id: 'skimmer', name: 'Standard Skimmer Pool', description: 'Traditional skimmer filtration system', multiplier: 1.00 },
  { id: 'infinity', name: 'Infinity / Overflow Pool', description: 'Overflow edge with additional hydraulic systems', multiplier: 1.40 },
];

export function getPoolDepthFactor(depth: number): number {
  if (depth <= 1.20) return 0.90;
  if (depth <= 1.50) return 1.00;
  if (depth <= 1.80) return 1.10;
  return 1.20;
}

export const POOL_TERRAIN_MULTIPLIERS: Record<string, number> = {
  flat_normal: 1.00,
  flat_rocky: 1.10,
  inclined_normal: 1.30,
  inclined_rocky: 1.40,
  inclined_sandy: 1.60,
};

export const POOL_MINIMUM_COST = 15000;

export const POOL_TOOLTIP = `Pool cost depends on size, depth, construction type, and site terrain conditions. Infinity pools require additional hydraulic systems and overflow structures.`;

export const COST_BASIS_TITLE = `Direct Construction Cost`;

export const COST_BASIS_TEXT = `This benchmark defines the core construction cost level of the project. It mainly drives KG 300, KG 400, and KG 600, while some preliminary works may also be benchmark-linked.
Other project-specific items are calculated separately. Regional cost differences are reflected through the location adjustment factor.`;

export const COST_BASIS_SCOPE_TITLE = `Separately Calculated`;

export const COST_BASIS_SCOPE_TEXT = `Project-specific items are calculated separately from the base benchmark, including KG 200 subgroups 220–250, external works (KG 500), planning and professional fees (KG 700), contractor overhead & profit, and VAT.`;

export const DEFAULT_CONTRACTOR_PERCENTAGE = 12;
export const CONTRACTOR_MIN_PERCENTAGE = 0;
export const CONTRACTOR_MAX_PERCENTAGE = 35;
export const CONTRACTOR_STEP = 0.5;

export const UTILITY_CONNECTION_TOOLTIP_EXTENDED = `Covers electricity, water supply, sewage/drainage, and telecommunications connections to public infrastructure networks. Classified under KG 200 - Site Preparation.`;

export interface UtilityConnectionOption {
  id: string;
  name: string;
  description: string;
  cost: number;
}

interface UtilityConnectionSplit {
  group220Share: number;
  group230Share: number;
}

export const UTILITY_CONNECTION_OPTIONS: UtilityConnectionOption[] = [
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

const UTILITY_CONNECTION_SPLITS: Record<string, UtilityConnectionSplit> = {
  standard: { group220Share: 0.70, group230Share: 0.30 },
  difficult: { group220Share: 0.60, group230Share: 0.40 },
  remote: { group220Share: 0.40, group230Share: 0.60 },
  custom: { group220Share: 0.60, group230Share: 0.40 },
};

export function getUtilityConnectionGroupCosts(optionId: string, totalCost: number): {
  group220Cost: number;
  group230Cost: number;
} {
  const split = UTILITY_CONNECTION_SPLITS[optionId] ?? UTILITY_CONNECTION_SPLITS.difficult;
  const group220Cost = Math.round(totalCost * split.group220Share);
  return {
    group220Cost,
    group230Cost: Math.round(totalCost - group220Cost),
  };
}

export const UTILITY_CONNECTION_TOOLTIP = `Covers electricity, water supply, sewage/drainage, and telecommunications connections to public infrastructure networks.`;

export const CONTINGENCY_PERCENTAGES: Record<QualityId, number> = {
  economy: 0.10,
  midRange: 0.15,
  luxury: 0.20,
};

export const CONSTRUCTION_SUBTOTAL_DISCLAIMER = `The construction subtotal includes direct building construction costs (KG 300 + KG 400 + KG 600) with size correction applied.\nSite preparation (KG 200), external works (KG 500), and planning fees (KG 700) are calculated separately.`;

export const DIN276_GROUPS = {
  KG100: { code: 'KG 100', name: getDin276Group('100')?.label ?? 'Land' },
  KG200: { code: 'KG 200', name: getDin276Group('200')?.label ?? 'Preparatory Measures' },
  KG300: { code: 'KG 300', name: getDin276Group('300')?.label ?? 'Building - Construction Works' },
  KG400: { code: 'KG 400', name: getDin276Group('400')?.label ?? 'Technical Systems' },
  KG500: { code: 'KG 500', name: getDin276Group('500')?.label ?? 'External Works and Open Spaces' },
  KG600: { code: 'KG 600', name: getDin276Group('600')?.label ?? 'Furnishings and Artworks' },
  KG700: { code: 'KG 700', name: 'Planning & Professional Fees' },
} as const;

export const DISCLAIMER_TEXT = `This estimate is based on conventional construction assumptions (reinforced concrete structure, masonry walls with thermoblocks, and external thermal insulation system - ETICS).

The result is a preliminary cost estimation. Actual construction cost may vary depending on design, site conditions, contractor pricing, and market conditions.`;

export const KG300_CATEGORY_IDS = ['concrete', 'masonry', 'roofing', 'insulation', 'windows', 'interior'] as const;
export const KG400_CATEGORY_IDS = ['plumbing', 'heating', 'ventilation_cooling', 'electrical', 'data_security', 'automation'] as const;
export const KG500_CATEGORY_IDS = [] as const;
export const KG600_CATEGORY_IDS = ['furnishings'] as const;

export interface HvacOption {
  id: string;
  name: string;
  description: string;
  costPerSqm: number;
}

export const HVAC_OPTIONS: HvacOption[] = [
  {
    id: 'underfloor_heating',
    name: 'Underfloor Heating',
    description: 'Hydronic floor heating connected to the heat pump',
    costPerSqm: 45,
  },
  {
    id: 'solar_thermal',
    name: 'Solar Thermal System',
    description: 'Solar collectors for domestic hot water',
    costPerSqm: 15,
  },
  {
    id: 'photovoltaic',
    name: 'Photovoltaic System (PV)',
    description: 'Roof-mounted photovoltaic electricity generation',
    costPerSqm: 35,
  },
];

export const HVAC_TOOLTIP = `The base calculation includes a standard heat pump with fan-coil or VRV heating/cooling. Optional systems add comfort or renewable energy production and scale with the effective building area.`;

export const INTERIOR_ADJUSTMENTS = {
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
} as const;

export const INTERIOR_BASELINE = {
  bathrooms: 1,
  wcs: 1,
} as const;

export const PERMIT_DESIGN_BASELINE_FEE = 15000;
export const PERMIT_DESIGN_BASELINE_AREA_MAX = 200;

export const PERMIT_DESIGN_QUALITY_MULTIPLIERS: Record<QualityId, number> = {
  economy: 1.00,
  midRange: 1.15,
  luxury: 1.30,
};

export const PERMIT_DESIGN_TOOLTIP = `Permit and design fees depend on building size and project quality level. Larger or highly customized projects typically require additional design work.`;

export const PERMIT_DESIGN_LARGE_PROJECT_MESSAGE = `Projects of this size or complexity typically require a tailored design proposal.`;

export const PERMIT_DESIGN_CONTACT_URL = 'https://philippdoukakis.com';
export const PERMIT_DESIGN_CONTACT_LABEL = 'Ask for detailed offer';

export const SIZE_CORRECTION_TABLE = [
  { range: '< 120 m\u00B2', correction: '+10%' },
  { range: '120 - 160 m\u00B2', correction: '+5%' },
  { range: '160 - 220 m\u00B2', correction: 'base (no correction)' },
  { range: '220 - 300 m\u00B2', correction: '-5%' },
  { range: '> 300 m\u00B2', correction: '-10%' },
] as const;

export const formatNumber = (num: number): string => {
  return formatDisplayNumber(num);
};

export const formatEuro = (amount: number): string => {
  return formatDisplayCurrency(amount);
};
