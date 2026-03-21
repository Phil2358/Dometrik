"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateKg300CategoryCostsById = calculateKg300CategoryCostsById;
exports.calculateLevel1BenchmarkAllocation = calculateLevel1BenchmarkAllocation;
exports.calculateCategoryCosts = calculateCategoryCosts;
const construction_1 = require("../../constants/construction");
function calculateKg300CategoryCostsById(benchmarkBucket300) {
    return construction_1.KG300_CATEGORY_IDS.reduce((costsById, categoryId) => {
        var _a;
        const category = construction_1.COST_CATEGORIES.find((item) => item.id === categoryId);
        const percentage = (_a = category === null || category === void 0 ? void 0 : category.percentage) !== null && _a !== void 0 ? _a : 0;
        costsById[categoryId] = Math.round(Math.max(0, benchmarkBucket300) * (percentage / 67));
        return costsById;
    }, {});
}
function calculateLevel1BenchmarkAllocation(input) {
    var _a;
    const rawShares = (_a = construction_1.LEVEL_1_BENCHMARK_RAW_SHARES[input.qualityId]) !== null && _a !== void 0 ? _a : construction_1.LEVEL_1_BENCHMARK_RAW_SHARES[construction_1.DEFAULT_QUALITY_ID];
    const fixedBenchmarkIncluded = Math.max(0, input.siteExcavationBaseCost);
    const remainingBenchmarkPool = Math.max(0, Math.round(input.benchmarkTotal) - fixedBenchmarkIncluded);
    const rawShareTotal = rawShares.kg300 + rawShares.kg400 || 1;
    const benchmarkBucket300 = Math.round(remainingBenchmarkPool * (rawShares.kg300 / rawShareTotal));
    const benchmarkBucket400 = Math.max(0, remainingBenchmarkPool - benchmarkBucket300);
    return {
        fixedBenchmarkIncluded,
        remainingBenchmarkPool,
        benchmarkBucket300,
        benchmarkBucket400,
    };
}
function calculateCategoryCosts(input) {
    // KG400 source of truth lives in kg400Costs.ts.
    // This helper only owns the benchmark-driven KG300/KG600 category skeleton.
    const kg300CategoryCostsById = calculateKg300CategoryCostsById(input.benchmarkBucket300);
    const categoryCosts = construction_1.COST_CATEGORIES.map(category => {
        var _a;
        const cost = category.din276 === 'KG 300'
            ? ((_a = kg300CategoryCostsById[category.id]) !== null && _a !== void 0 ? _a : 0)
            : 0;
        return {
            id: category.id,
            din276: category.din276,
            name: category.name,
            percentage: category.percentage,
            cost: Math.round(cost)
        };
    });
    const kg300Total = categoryCosts
        .filter(c => construction_1.KG300_CATEGORY_IDS.includes(c.id))
        .reduce((sum, c) => sum + c.cost, 0);
    const kg600Total = categoryCosts
        .filter(c => construction_1.KG600_CATEGORY_IDS.includes(c.id))
        .reduce((sum, c) => sum + c.cost, 0);
    return {
        categoryCosts,
        kg300Total,
        kg400Total: 0,
        kg600Total
    };
}
