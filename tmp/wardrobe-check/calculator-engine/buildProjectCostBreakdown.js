"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProjectCostBreakdown = buildProjectCostBreakdown;
function buildProjectCostBreakdown(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const kg500Total = input.kg500Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0);
    const kg700Total = input.kg700Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0);
    const subgroup340RoomCountAddons = input.bathroomRoomCountAddons.kg340Cost + input.wcRoomCountAddons.kg340Cost;
    const subgroup350RoomCountAddons = input.bathroomRoomCountAddons.kg350Cost + input.wcRoomCountAddons.kg350Cost;
    const subgroup410RoomCountAddons = input.bathroomRoomCountAddons.kg400CategoryCostsById.plumbing
        + input.wcRoomCountAddons.kg400CategoryCostsById.plumbing;
    const subgroup420RoomCountAddons = input.bathroomRoomCountAddons.kg400CategoryCostsById.heating
        + input.wcRoomCountAddons.kg400CategoryCostsById.heating;
    const subgroup430RoomCountAddons = input.bathroomRoomCountAddons.kg400CategoryCostsById.ventilation_cooling
        + input.wcRoomCountAddons.kg400CategoryCostsById.ventilation_cooling;
    const subgroup440RoomCountAddons = input.bathroomRoomCountAddons.kg400CategoryCostsById.electrical
        + input.wcRoomCountAddons.kg400CategoryCostsById.electrical;
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
                {
                    code: "340",
                    cost: input.kg300SubgroupCosts.subgroup340Cost,
                    visible: true,
                    meta: {
                        baseBeforeRoomCountAddons: input.kg300SubgroupCosts.subgroup340Cost - subgroup340RoomCountAddons,
                        bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg340Cost,
                        wcRoomCountAddonCost: input.wcRoomCountAddons.kg340Cost,
                        roomCountAddonCost: subgroup340RoomCountAddons,
                    },
                },
                {
                    code: "350",
                    cost: input.kg300SubgroupCosts.subgroup350Cost,
                    visible: true,
                    meta: {
                        baseBeforeRoomCountAddons: input.kg300SubgroupCosts.subgroup350Cost - subgroup350RoomCountAddons,
                        bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg350Cost,
                        wcRoomCountAddonCost: input.wcRoomCountAddons.kg350Cost,
                        roomCountAddonCost: subgroup350RoomCountAddons,
                    },
                },
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
                {
                    code: "410",
                    cost: (_a = input.kg400CategoryCostsById.plumbing) !== null && _a !== void 0 ? _a : 0,
                    visible: true,
                    meta: {
                        baseBeforeRoomCountAddons: ((_b = input.kg400CategoryCostsById.plumbing) !== null && _b !== void 0 ? _b : 0) - subgroup410RoomCountAddons,
                        bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg400CategoryCostsById.plumbing,
                        wcRoomCountAddonCost: input.wcRoomCountAddons.kg400CategoryCostsById.plumbing,
                        roomCountAddonCost: subgroup410RoomCountAddons,
                    },
                },
                {
                    code: "420",
                    cost: (_c = input.kg400CategoryCostsById.heating) !== null && _c !== void 0 ? _c : 0,
                    visible: true,
                    meta: {
                        baseBeforeRoomCountAddons: ((_d = input.kg400CategoryCostsById.heating) !== null && _d !== void 0 ? _d : 0) - subgroup420RoomCountAddons,
                        bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg400CategoryCostsById.heating,
                        wcRoomCountAddonCost: input.wcRoomCountAddons.kg400CategoryCostsById.heating,
                        roomCountAddonCost: subgroup420RoomCountAddons,
                        underfloorHeating: (_e = input.hvacSelections.underfloor_heating) !== null && _e !== void 0 ? _e : false,
                        solarThermal: (_f = input.hvacSelections.solar_thermal) !== null && _f !== void 0 ? _f : false,
                    },
                },
                {
                    code: "430",
                    cost: (_g = input.kg400CategoryCostsById.ventilation_cooling) !== null && _g !== void 0 ? _g : 0,
                    visible: true,
                    meta: {
                        baseBeforeRoomCountAddons: ((_h = input.kg400CategoryCostsById.ventilation_cooling) !== null && _h !== void 0 ? _h : 0) - subgroup430RoomCountAddons,
                        bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg400CategoryCostsById.ventilation_cooling,
                        wcRoomCountAddonCost: input.wcRoomCountAddons.kg400CategoryCostsById.ventilation_cooling,
                        roomCountAddonCost: subgroup430RoomCountAddons,
                    },
                },
                {
                    code: "440",
                    cost: (_j = input.kg400CategoryCostsById.electrical) !== null && _j !== void 0 ? _j : 0,
                    visible: true,
                    meta: {
                        baseBeforeRoomCountAddons: ((_k = input.kg400CategoryCostsById.electrical) !== null && _k !== void 0 ? _k : 0) - subgroup440RoomCountAddons,
                        bathroomRoomCountAddonCost: input.bathroomRoomCountAddons.kg400CategoryCostsById.electrical,
                        wcRoomCountAddonCost: input.wcRoomCountAddons.kg400CategoryCostsById.electrical,
                        roomCountAddonCost: subgroup440RoomCountAddons,
                        photovoltaic: (_l = input.hvacSelections.photovoltaic) !== null && _l !== void 0 ? _l : false,
                    },
                },
                { code: "450", cost: (_m = input.kg400CategoryCostsById.data_security) !== null && _m !== void 0 ? _m : 0, visible: true },
                { code: "480", cost: (_o = input.kg400CategoryCostsById.automation) !== null && _o !== void 0 ? _o : 0, visible: true },
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
                    meta: {
                        bathroomWcFurnishingSliceCost: input.bathroomWcFurnishingSliceCost,
                        kg620BaselineWardrobeCost: input.kg620BaselineWardrobeCost,
                        kg620WardrobeDeltaCost: input.kg620WardrobeDeltaCost,
                        kg620WardrobeTotal: input.kg620WardrobeTotal,
                    },
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
