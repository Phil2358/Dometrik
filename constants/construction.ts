import { formatCurrency as formatDisplayCurrency, formatNumber as formatDisplayNumber } from '@/utils/format';

export interface Location {
  id: string;
  name: string;
  region: string;
  multiplier: number;
}

export interface QualityLevel {
  id: string;
  name: string;
  description: string;
  baseCostPerSqm: number;
  benchmarkFactor: number;
}

export interface CostCategory {
  id: string;
  din276: string;
  name: string;
  percentage: number;
  description: string;
}

export const PREMIUM_BENCHMARK_BASE_COST_PER_SQM = 1930;

export const BASE_GROUP_SHARE_KG200 = 0.015;
export const BASE_GROUP_SHARE_KG300 = 0.64;
export const BASE_GROUP_SHARE_KG400 = 0.345;

export const KG300_BASE_SHARE = BASE_GROUP_SHARE_KG300;
export const KG400_BASE_SHARE = BASE_GROUP_SHARE_KG400;
export const KG600_BASE_SHARE = 0;

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
    id: 'standard',
    name: 'Standard',
    description: 'Good quality materials, energy-efficient, standard finishes',
    baseCostPerSqm: Math.round(PREMIUM_BENCHMARK_BASE_COST_PER_SQM * 0.90),
    benchmarkFactor: 0.90,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'High-end materials, smart home ready, premium finishes',
    baseCostPerSqm: PREMIUM_BENCHMARK_BASE_COST_PER_SQM,
    benchmarkFactor: 1.00,
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Top-tier materials, bespoke design, luxury finishes throughout',
    baseCostPerSqm: Math.round(PREMIUM_BENCHMARK_BASE_COST_PER_SQM * 1.15),
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
  { id: 'hvac', din276: 'KG 400', name: 'HVAC Systems', percentage: 10, description: 'Heat pump, A/C, underfloor heating, ventilation, ducts' },
  { id: 'electrical', din276: 'KG 400', name: 'Electrical Installation', percentage: 7, description: 'Wiring, panels, sockets, lighting, smart home, PV ready' },
  { id: 'plumbing', din276: 'KG 400', name: 'Plumbing & Sanitary', percentage: 7, description: 'Water supply, drainage, bathroom fittings, solar thermal' },
  { id: 'furnishings', din276: 'KG 600', name: 'Built-in Furnishings', percentage: 9, description: 'Kitchen, wardrobes, built-in storage, bathroom vanities' },
];

export interface BasementType {
  id: string;
  name: string;
  description: string;
  costFactor: number;
  structureCostPerSqm: number;
}

export const BASEMENT_TYPES: BasementType[] = [
  {
    id: 'storage',
    name: 'Storage / technical',
    description: 'Storage, technical rooms, or utility spaces',
    costFactor: 0.50,
    structureCostPerSqm: 450,
  },
  {
    id: 'parking',
    name: 'Parking / garage',
    description: 'Car parking or vehicle storage',
    costFactor: 0.65,
    structureCostPerSqm: 550,
  },
  {
    id: 'habitable',
    name: 'Habitable / living',
    description: 'Guest rooms, recreation, or additional dwelling space',
    costFactor: 0.85,
    structureCostPerSqm: 750,
  },
];

export const BASEMENT_TYPE_TOOLTIP = `Basement cost depends on use. Storage basements require fewer finishes, parking basements require structural spans and ventilation, and habitable basements approach the cost of above-ground living space.`;

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
  if (livingArea < 300) return 'âˆ’5%';
  return 'âˆ’10%';
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

export const COST_BASIS_TEXT = `Base construction costs represent direct building construction costs only (KG 300 + KG 400 + KG 600).
This includes: reinforced concrete structure, masonry walls, ETICS insulation, roof construction, standard windows, basic HVAC system (heat pump + fan-coils or VRV), standard electrical and plumbing installations, standard interior finishes, and basic bathroom fixtures.
Regional cost differences are reflected through the location adjustment factor.`;

export const COST_BASIS_SCOPE_TITLE = `Separately Calculated`;

export const COST_BASIS_SCOPE_TEXT = `Site preparation & utilities (KG 200), external works (KG 500), planning & professional fees (KG 700), contractor overhead & profit, and VAT are not included in the base construction cost and are calculated separately.`;

export const DEFAULT_CONTRACTOR_PERCENTAGE = 12;
export const CONTRACTOR_MIN_PERCENTAGE = 0;
export const CONTRACTOR_MAX_PERCENTAGE = 35;
export const CONTRACTOR_STEP = 0.5;

export const UTILITY_CONNECTION_TOOLTIP_EXTENDED = `Covers electricity, water supply, sewage/drainage, and telecommunications connections to public infrastructure networks. Classified under KG 200 â€“ Site Preparation.`;

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
    cost: 4000,
  },
  {
    id: 'difficult',
    name: 'Difficult connection',
    description: 'Extended infrastructure or complex terrain',
    cost: 8000,
  },
  {
    id: 'remote',
    name: 'Remote location',
    description: 'Long-distance utility extension required',
    cost: 15000,
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

export const CONTINGENCY_PERCENTAGES: Record<string, number> = {
  standard: 0.10,
  premium: 0.15,
  luxury: 0.20,
};

export const CONSTRUCTION_SUBTOTAL_DISCLAIMER = `The construction subtotal includes direct building construction costs (KG 300 + KG 400 + KG 600) with size correction applied.\nSite preparation (KG 200), external works (KG 500), and planning fees (KG 700) are calculated separately.`;

export const DIN276_GROUPS = {
  KG100: { code: 'KG 100', name: 'Site / Land Costs' },
  KG200: { code: 'KG 200', name: 'Site Preparation & Utilities' },
  KG300: { code: 'KG 300', name: 'Building Construction' },
  KG400: { code: 'KG 400', name: 'Technical Systems' },
  KG500: { code: 'KG 500', name: 'External Works' },
  KG600: { code: 'KG 600', name: 'Built-in Equipment' },
  KG700: { code: 'KG 700', name: 'Planning & Professional Fees' },
} as const;

export const DISCLAIMER_TEXT = `This estimate is based on conventional construction assumptions (reinforced concrete structure, masonry walls with thermoblocks, and external thermal insulation system â€“ ETICS).

The result is a preliminary cost estimation. Actual construction cost may vary depending on design, site conditions, contractor pricing, and market conditions.`;

export const KG300_CATEGORY_IDS = ['concrete', 'masonry', 'roofing', 'insulation', 'windows', 'interior'] as const;
export const KG400_CATEGORY_IDS = ['hvac', 'electrical', 'plumbing'] as const;
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

export const PERMIT_DESIGN_QUALITY_MULTIPLIERS: Record<string, number> = {
  standard: 1.00,
  premium: 1.15,
  luxury: 1.30,
};

export const PERMIT_DESIGN_TOOLTIP = `Permit and design fees depend on building size and project quality level. Larger or highly customized projects typically require additional design work.`;

export const PERMIT_DESIGN_LARGE_PROJECT_MESSAGE = `Projects of this size or complexity typically require a tailored design proposal.`;

export const PERMIT_DESIGN_CONTACT_URL = 'https://philippdoukakis.com';
export const PERMIT_DESIGN_CONTACT_LABEL = 'Ask for detailed offer';

export const SIZE_CORRECTION_TABLE = [
  { range: '< 120 mÂ²', correction: '+10%' },
  { range: '120 â€“ 160 mÂ²', correction: '+5%' },
  { range: '160 â€“ 220 mÂ²', correction: 'base (no correction)' },
  { range: '220 â€“ 300 mÂ²', correction: 'âˆ’5%' },
  { range: '> 300 mÂ²', correction: 'âˆ’10%' },
] as const;

export const formatNumber = (num: number): string => {
  return formatDisplayNumber(num);
};

export const formatEuro = (amount: number): string => {
  return formatDisplayCurrency(amount);
};
