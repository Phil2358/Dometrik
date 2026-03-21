"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRoomCountAddons = calculateRoomCountAddons;
const construction_1 = require("../../constants/construction");
function buildRoomCountAddonBreakdown(input) {
    var _a;
    const resolvedRoomCount = input.roomCount;
    const totalCostPerRoom = (_a = input.totalCostByQuality[input.qualityId]) !== null && _a !== void 0 ? _a : input.totalCostByQuality[construction_1.DEFAULT_QUALITY_ID];
    const totalCost = resolvedRoomCount * totalCostPerRoom;
    const kg340Cost = Math.round(totalCost * input.routingShares.kg340);
    const kg350Cost = Math.round(totalCost * input.routingShares.kg350);
    const kg400Cost = totalCost - kg340Cost - kg350Cost;
    const plumbing = Math.round(kg400Cost * input.kg400CategoryShares.plumbing);
    const heating = Math.round(kg400Cost * input.kg400CategoryShares.heating);
    const ventilation_cooling = Math.round(kg400Cost * input.kg400CategoryShares.ventilation_cooling);
    const electrical = kg400Cost - plumbing - heating - ventilation_cooling;
    return {
        roomCount: resolvedRoomCount,
        totalCost,
        kg340Cost,
        kg350Cost,
        kg400Cost,
        kg400CategoryCostsById: {
            plumbing,
            heating,
            ventilation_cooling,
            electrical,
        },
    };
}
function calculateRoomCountAddons(input) {
    const bathroomRoomCountAddons = buildRoomCountAddonBreakdown({
        roomCount: input.bathroomDelta,
        totalCostByQuality: construction_1.BATHROOM_ROOM_COUNT_ADDON_TOTAL_COSTS,
        routingShares: construction_1.BATHROOM_ROOM_COUNT_ADDON_SPLITS,
        kg400CategoryShares: construction_1.BATHROOM_ROOM_COUNT_ADDON_KG400_CATEGORY_SPLITS,
        qualityId: input.qualityId,
    });
    const wcRoomCountAddons = buildRoomCountAddonBreakdown({
        roomCount: input.wcDelta,
        totalCostByQuality: construction_1.WC_ROOM_COUNT_ADDON_TOTAL_COSTS,
        routingShares: construction_1.WC_ROOM_COUNT_ADDON_SPLITS,
        kg400CategoryShares: construction_1.WC_ROOM_COUNT_ADDON_KG400_CATEGORY_SPLITS,
        qualityId: input.qualityId,
    });
    return {
        bathroomRoomCountAddons,
        wcRoomCountAddons,
        kg340BathroomDelta: bathroomRoomCountAddons.kg340Cost,
        kg350BathroomDelta: bathroomRoomCountAddons.kg350Cost,
        kg400BathroomDelta: bathroomRoomCountAddons.kg400Cost,
        kg340WcDelta: wcRoomCountAddons.kg340Cost,
        kg350WcDelta: wcRoomCountAddons.kg350Cost,
        kg400WcDelta: wcRoomCountAddons.kg400Cost,
        kg300SubgroupAddons: {
            subgroup340Cost: bathroomRoomCountAddons.kg340Cost + wcRoomCountAddons.kg340Cost,
            subgroup350Cost: bathroomRoomCountAddons.kg350Cost + wcRoomCountAddons.kg350Cost,
        },
        kg400CategoryAddonsById: {
            plumbing: bathroomRoomCountAddons.kg400CategoryCostsById.plumbing
                + wcRoomCountAddons.kg400CategoryCostsById.plumbing,
            heating: bathroomRoomCountAddons.kg400CategoryCostsById.heating
                + wcRoomCountAddons.kg400CategoryCostsById.heating,
            ventilation_cooling: bathroomRoomCountAddons.kg400CategoryCostsById.ventilation_cooling
                + wcRoomCountAddons.kg400CategoryCostsById.ventilation_cooling,
            electrical: bathroomRoomCountAddons.kg400CategoryCostsById.electrical
                + wcRoomCountAddons.kg400CategoryCostsById.electrical,
        },
    };
}
