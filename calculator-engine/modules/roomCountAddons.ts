import {
  BATHROOM_ROOM_COUNT_ADDON_KG400_CATEGORY_SPLITS,
  BATHROOM_ROOM_COUNT_ADDON_SPLITS,
  BATHROOM_ROOM_COUNT_ADDON_TOTAL_COSTS,
  DEFAULT_QUALITY_ID,
  type QualityId,
  WC_ROOM_COUNT_ADDON_KG400_CATEGORY_SPLITS,
  WC_ROOM_COUNT_ADDON_SPLITS,
  WC_ROOM_COUNT_ADDON_TOTAL_COSTS,
} from "../../constants/construction"

interface RoomCountAddonInput {
  qualityId: QualityId
  bathroomDelta: number
  wcDelta: number
}

export interface RoomCountAddonBreakdown {
  roomCount: number
  totalCost: number
  kg340Cost: number
  kg350Cost: number
  kg400Cost: number
  kg400CategoryCostsById: {
    plumbing: number
    heating: number
    ventilation_cooling: number
    electrical: number
  }
}

export interface RoomCountAddonsResult {
  bathroomRoomCountAddons: RoomCountAddonBreakdown
  wcRoomCountAddons: RoomCountAddonBreakdown
  kg340BathroomDelta: number
  kg350BathroomDelta: number
  kg400BathroomDelta: number
  kg340WcDelta: number
  kg350WcDelta: number
  kg400WcDelta: number
  kg300SubgroupAddons: {
    subgroup340Cost: number
    subgroup350Cost: number
  }
  kg400CategoryAddonsById: {
    plumbing: number
    heating: number
    ventilation_cooling: number
    electrical: number
  }
}

function buildRoomCountAddonBreakdown(input: {
  roomCount: number
  totalCostByQuality: Record<QualityId, number>
  routingShares: { kg340: number; kg350: number; kg400: number }
  kg400CategoryShares: {
    plumbing: number
    heating: number
    ventilation_cooling: number
    electrical: number
  }
  qualityId: QualityId
}): RoomCountAddonBreakdown {
  const resolvedRoomCount = input.roomCount
  const totalCostPerRoom =
    input.totalCostByQuality[input.qualityId] ??
    input.totalCostByQuality[DEFAULT_QUALITY_ID]
  const totalCost = resolvedRoomCount * totalCostPerRoom
  const kg340Cost = Math.round(totalCost * input.routingShares.kg340)
  const kg350Cost = Math.round(totalCost * input.routingShares.kg350)
  const kg400Cost = totalCost - kg340Cost - kg350Cost
  const plumbing = Math.round(kg400Cost * input.kg400CategoryShares.plumbing)
  const heating = Math.round(kg400Cost * input.kg400CategoryShares.heating)
  const ventilation_cooling = Math.round(
    kg400Cost * input.kg400CategoryShares.ventilation_cooling
  )
  const electrical =
    kg400Cost - plumbing - heating - ventilation_cooling

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
  }
}

export function calculateRoomCountAddons(input: RoomCountAddonInput): RoomCountAddonsResult {
  const bathroomRoomCountAddons = buildRoomCountAddonBreakdown({
    roomCount: input.bathroomDelta,
    totalCostByQuality: BATHROOM_ROOM_COUNT_ADDON_TOTAL_COSTS,
    routingShares: BATHROOM_ROOM_COUNT_ADDON_SPLITS,
    kg400CategoryShares: BATHROOM_ROOM_COUNT_ADDON_KG400_CATEGORY_SPLITS,
    qualityId: input.qualityId,
  })
  const wcRoomCountAddons = buildRoomCountAddonBreakdown({
    roomCount: input.wcDelta,
    totalCostByQuality: WC_ROOM_COUNT_ADDON_TOTAL_COSTS,
    routingShares: WC_ROOM_COUNT_ADDON_SPLITS,
    kg400CategoryShares: WC_ROOM_COUNT_ADDON_KG400_CATEGORY_SPLITS,
    qualityId: input.qualityId,
  })

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
      subgroup340Cost:
        bathroomRoomCountAddons.kg340Cost + wcRoomCountAddons.kg340Cost,
      subgroup350Cost:
        bathroomRoomCountAddons.kg350Cost + wcRoomCountAddons.kg350Cost,
    },
    kg400CategoryAddonsById: {
      plumbing:
        bathroomRoomCountAddons.kg400CategoryCostsById.plumbing
        + wcRoomCountAddons.kg400CategoryCostsById.plumbing,
      heating:
        bathroomRoomCountAddons.kg400CategoryCostsById.heating
        + wcRoomCountAddons.kg400CategoryCostsById.heating,
      ventilation_cooling:
        bathroomRoomCountAddons.kg400CategoryCostsById.ventilation_cooling
        + wcRoomCountAddons.kg400CategoryCostsById.ventilation_cooling,
      electrical:
        bathroomRoomCountAddons.kg400CategoryCostsById.electrical
        + wcRoomCountAddons.kg400CategoryCostsById.electrical,
    },
  }
}
