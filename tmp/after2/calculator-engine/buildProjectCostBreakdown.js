"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProjectCostBreakdown = buildProjectCostBreakdown;
function buildProjectCostBreakdown(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const kg500Total = input.kg500Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0);
    const kg700Total = input.kg700Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0);
    return [
        {
            code: "100",
            subtotal: input.landValue + input.landAcquisitionCosts,
            percentOfTotal: input.investmentTotal > 0 ? ((input.landValue + input.landAcquisitionCosts) / input.investmentTotal) * 100 : 0,
            subgroups: [
                { code: "110", cost: input.landValue, visible: input.landValue > 0 },
                {
                    code: "120",
                    cost: input.landAcquisitionCosts,
                    visible: input.landAcquisitionCosts > 0 || input.landAcquisitionCostsMode === "manual",
                    meta: {
                        mode: input.landAcquisitionCostsMode,
                        landValue: input.landValue,
                        ratePercent: input.landAcquisitionRatePercent,
                    },
                },
            ],
        },
        {
            code: "200",
            subtotal: input.kg200Total,
            percentOfTotal: input.investmentTotal > 0 ? (input.kg200Total / input.investmentTotal) * 100 : 0,
            subgroups: [
                { code: "210", cost: input.siteExcavationCost, visible: true, meta: { siteConditionId: input.siteConditionId } },
                { code: "220", cost: input.utilityGroup220Cost, visible: true },
                { code: "230", cost: input.utilityGroup230Cost, visible: true },
                { code: "240", cost: 0, visible: false },
                { code: "250", cost: 0, visible: false },
            ],
        },
        {
            code: "300",
            subtotal: input.kg300Total,
            percentOfTotal: input.investmentTotal > 0 ? (input.kg300Total / input.investmentTotal) * 100 : 0,
            subgroups: [
                { code: "310", cost: input.kg300SubgroupCosts.subgroup310Cost, visible: true },
                { code: "320", cost: input.kg300SubgroupCosts.subgroup320Cost, visible: true },
                { code: "330", cost: input.kg300SubgroupCosts.subgroup330Cost, visible: true },
                { code: "340", cost: input.kg300SubgroupCosts.subgroup340Cost, visible: true },
                { code: "350", cost: input.kg300SubgroupCosts.subgroup350Cost, visible: true },
                { code: "360", cost: input.kg300SubgroupCosts.subgroup360Cost, visible: true },
                { code: "370", cost: input.kg300SubgroupCosts.subgroup370Cost, visible: input.kg300SubgroupCosts.subgroup370Cost > 0 },
                { code: "380", cost: input.kg300SubgroupCosts.subgroup380Cost, visible: input.kg300SubgroupCosts.subgroup380Cost > 0 },
                { code: "390", cost: input.kg300SubgroupCosts.subgroup390Cost, visible: true },
            ],
        },
        {
            code: "400",
            subtotal: input.kg400Total,
            percentOfTotal: input.investmentTotal > 0 ? (input.kg400Total / input.investmentTotal) * 100 : 0,
            subgroups: [
                { code: "410", cost: (_a = input.kg400CategoryCostsById.plumbing) !== null && _a !== void 0 ? _a : 0, visible: true },
                {
                    code: "420",
                    cost: (_b = input.kg400CategoryCostsById.heating) !== null && _b !== void 0 ? _b : 0,
                    visible: true,
                    meta: {
                        underfloorHeating: (_c = input.hvacSelections.underfloor_heating) !== null && _c !== void 0 ? _c : false,
                        solarThermal: (_d = input.hvacSelections.solar_thermal) !== null && _d !== void 0 ? _d : false,
                    },
                },
                { code: "430", cost: (_e = input.kg400CategoryCostsById.ventilation_cooling) !== null && _e !== void 0 ? _e : 0, visible: true },
                {
                    code: "440",
                    cost: (_f = input.kg400CategoryCostsById.electrical) !== null && _f !== void 0 ? _f : 0,
                    visible: true,
                    meta: { photovoltaic: (_g = input.hvacSelections.photovoltaic) !== null && _g !== void 0 ? _g : false },
                },
                { code: "450", cost: (_h = input.kg400CategoryCostsById.data_security) !== null && _h !== void 0 ? _h : 0, visible: true },
                { code: "480", cost: (_j = input.kg400CategoryCostsById.automation) !== null && _j !== void 0 ? _j : 0, visible: true },
            ],
        },
        {
            code: "500",
            subtotal: kg500Total,
            percentOfTotal: input.investmentTotal > 0 ? (kg500Total / input.investmentTotal) * 100 : 0,
            subgroups: input.kg500Subgroups,
        },
        {
            code: "600",
            subtotal: input.kg600Cost,
            percentOfTotal: input.investmentTotal > 0 ? (input.kg600Cost / input.investmentTotal) * 100 : 0,
            subgroups: [
                {
                    code: "610",
                    cost: input.kg600SubgroupCosts.subgroup610Cost,
                    visible: input.kg600SubgroupCosts.subgroup610Cost > 0,
                    meta: {
                        bedroomPackageCost: input.bedroomPackageCost,
                        areaBased610Cost: input.areaBased610Cost,
                        kitchenFurnitureCost: input.kitchenFurnitureCost,
                    },
                },
                {
                    code: "620",
                    cost: input.kg600SubgroupCosts.subgroup620Cost,
                    visible: true,
                    meta: { bathroomWcFurnishingSliceCost: input.bathroomWcFurnishingSliceCost },
                },
            ],
        },
        {
            code: "700",
            subtotal: kg700Total,
            percentOfTotal: input.investmentTotal > 0 ? (kg700Total / input.investmentTotal) * 100 : 0,
            subgroups: input.kg700Subgroups,
        },
    ];
}
