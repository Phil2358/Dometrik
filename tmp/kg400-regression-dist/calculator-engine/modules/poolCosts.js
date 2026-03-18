import { POOL_SIZE_OPTIONS, POOL_QUALITY_OPTIONS, POOL_TYPE_OPTIONS, POOL_TERRAIN_MULTIPLIERS, DEFAULT_POOL_DEPTH, getPoolDepthFactor, POOL_MINIMUM_COST } from "../../constants/construction";
export function calculatePoolCosts(input) {
    var _a, _b, _c, _d, _e, _f;
    if (!input.includePool) {
        return {
            poolArea: 0,
            poolCost: 0
        };
    }
    const poolSizes = [...POOL_SIZE_OPTIONS];
    const poolQualities = [...POOL_QUALITY_OPTIONS];
    const poolTypes = [...POOL_TYPE_OPTIONS];
    const sizeOption = (_a = poolSizes.find((s) => s.id === input.poolSizeId)) !== null && _a !== void 0 ? _a : poolSizes[0];
    const poolArea = input.poolSizeId === "custom"
        ? ((_b = input.poolCustomArea) !== null && _b !== void 0 ? _b : 0)
        : sizeOption.area;
    const depth = (_c = input.poolDepth) !== null && _c !== void 0 ? _c : DEFAULT_POOL_DEPTH;
    const quality = (_d = poolQualities.find((q) => q.id === input.poolQualityId)) !== null && _d !== void 0 ? _d : poolQualities[0];
    const type = (_e = poolTypes.find((t) => t.id === input.poolTypeId)) !== null && _e !== void 0 ? _e : poolTypes[0];
    const terrainMultiplier = (_f = POOL_TERRAIN_MULTIPLIERS[input.siteConditionId]) !== null && _f !== void 0 ? _f : 1;
    const depthFactor = getPoolDepthFactor(depth);
    let poolCost = poolArea *
        quality.baseCostPerSqm *
        type.multiplier *
        terrainMultiplier *
        depthFactor;
    if (poolCost < POOL_MINIMUM_COST) {
        poolCost = POOL_MINIMUM_COST;
    }
    return {
        poolArea,
        poolCost: Math.round(poolCost)
    };
}
