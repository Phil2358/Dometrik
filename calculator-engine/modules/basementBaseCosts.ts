import {
  BASEMENT_KG300_SUBGROUP_FACTORS,
  BASEMENT_LEVEL1_ALLOCATION_SHARES,
  BASEMENT_BENCHMARK_RATE_FACTORS,
  BASEMENT_TYPE_NAMES,
  DEFAULT_QUALITY_ID,
  type QualityId,
} from "../../constants/construction"
import type { Kg300SubgroupCosts } from "./categoryCosts"

interface BasementBaseCostsInput {
  correctedBenchmarkRate: number
  qualityId: QualityId
  basementArea?: number
  basementTypeId?: string
  storageBasementArea?: number
  parkingBasementArea?: number
  habitableBasementArea?: number
}

interface ResolvedBasementAreas {
  storageBasementArea: number
  parkingBasementArea: number
  habitableBasementArea: number
}

type BasementTypeAllocationId = keyof typeof BASEMENT_TYPE_NAMES

interface BasementTypeCostInput {
  id: BasementTypeAllocationId
  label: string
  area: number
  benchmarkRateFactor: number
  qualityId: QualityId
  basementBenchmarkRate: number
}

function resolveBasementAreas(input: BasementBaseCostsInput): ResolvedBasementAreas {
  const hasMixedBasementInputs =
    input.storageBasementArea !== undefined ||
    input.parkingBasementArea !== undefined ||
    input.habitableBasementArea !== undefined

  if (hasMixedBasementInputs) {
    return {
      storageBasementArea: input.storageBasementArea ?? 0,
      parkingBasementArea: input.parkingBasementArea ?? 0,
      habitableBasementArea: input.habitableBasementArea ?? 0,
    }
  }

  const legacyBasementArea = input.basementArea ?? 0
  const legacyBasementTypeId = input.basementTypeId ?? "storage"

  return {
    storageBasementArea: legacyBasementTypeId === "storage" ? legacyBasementArea : 0,
    parkingBasementArea: legacyBasementTypeId === "parking" ? legacyBasementArea : 0,
    habitableBasementArea: legacyBasementTypeId === "habitable" ? legacyBasementArea : 0,
  }
}

function calculateBasementLevel1Allocation(basementBaseCost: number, qualityId: QualityId) {
  const rawShares =
    BASEMENT_LEVEL1_ALLOCATION_SHARES[qualityId]
    ?? BASEMENT_LEVEL1_ALLOCATION_SHARES[DEFAULT_QUALITY_ID]
  const shareSum = rawShares.kg300 + rawShares.kg400 || 1
  const basementBucket300 = Math.round(
    basementBaseCost * (rawShares.kg300 / shareSum)
  )
  const basementBucket400 = basementBaseCost - basementBucket300

  return {
    share300: rawShares.kg300,
    share400: rawShares.kg400,
    shareSum,
    basementBucket300,
    basementBucket400,
  }
}

function calculateBasementKg300SubgroupCosts(
  basementBucket300: number,
  basementTypeId: BasementTypeAllocationId
): Kg300SubgroupCosts {
  const subgroupFactors = BASEMENT_KG300_SUBGROUP_FACTORS[basementTypeId]
  const subgroup310Cost = Math.round(basementBucket300 * subgroupFactors.subgroup310)
  const subgroup320Cost = Math.round(basementBucket300 * subgroupFactors.subgroup320)
  const subgroup330Cost = Math.round(basementBucket300 * subgroupFactors.subgroup330)
  const subgroup340Cost = Math.round(basementBucket300 * subgroupFactors.subgroup340)
  const subgroup350Cost =
    basementBucket300
    - subgroup310Cost
    - subgroup320Cost
    - subgroup330Cost
    - subgroup340Cost

  return {
    subgroup310Cost,
    subgroup320Cost,
    subgroup330Cost,
    subgroup340Cost,
    subgroup350Cost,
    subgroup360Cost: 0,
    subgroup370Cost: 0,
    subgroup380Cost: 0,
    subgroup390Cost: 0,
  }
}

function addKg300SubgroupCosts(
  left: Kg300SubgroupCosts,
  right: Kg300SubgroupCosts
): Kg300SubgroupCosts {
  return {
    subgroup310Cost: left.subgroup310Cost + right.subgroup310Cost,
    subgroup320Cost: left.subgroup320Cost + right.subgroup320Cost,
    subgroup330Cost: left.subgroup330Cost + right.subgroup330Cost,
    subgroup340Cost: left.subgroup340Cost + right.subgroup340Cost,
    subgroup350Cost: left.subgroup350Cost + right.subgroup350Cost,
    subgroup360Cost: left.subgroup360Cost + right.subgroup360Cost,
    subgroup370Cost: left.subgroup370Cost + right.subgroup370Cost,
    subgroup380Cost: left.subgroup380Cost + right.subgroup380Cost,
    subgroup390Cost: left.subgroup390Cost + right.subgroup390Cost,
  }
}

function createEmptyKg300SubgroupCosts(): Kg300SubgroupCosts {
  return {
    subgroup310Cost: 0,
    subgroup320Cost: 0,
    subgroup330Cost: 0,
    subgroup340Cost: 0,
    subgroup350Cost: 0,
    subgroup360Cost: 0,
    subgroup370Cost: 0,
    subgroup380Cost: 0,
    subgroup390Cost: 0,
  }
}

function calculateBasementTypeAllocation(input: BasementTypeCostInput) {
  const cost = Math.round(
    input.area * input.basementBenchmarkRate * input.benchmarkRateFactor
  )
  const level1Allocation =
    calculateBasementLevel1Allocation(cost, input.qualityId)
  const kg300SubgroupCosts =
    calculateBasementKg300SubgroupCosts(level1Allocation.basementBucket300, input.id)

  return {
    id: input.id,
    label: input.label,
    area: input.area,
    benchmarkRateFactor: input.benchmarkRateFactor,
    cost,
    basementBucket300: level1Allocation.basementBucket300,
    basementBucket400: level1Allocation.basementBucket400,
    kg300SubgroupCosts,
  }
}

export function calculateBasementBaseCosts(input: BasementBaseCostsInput) {
  const {
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
  } = resolveBasementAreas(input)

  const basementBenchmarkRate = Math.max(0, Math.round(input.correctedBenchmarkRate))
  const storageAllocation = calculateBasementTypeAllocation({
    id: "storage",
    label: BASEMENT_TYPE_NAMES.storage,
    area: storageBasementArea,
    benchmarkRateFactor: BASEMENT_BENCHMARK_RATE_FACTORS.storage,
    qualityId: input.qualityId,
    basementBenchmarkRate,
  })
  const parkingAllocation = calculateBasementTypeAllocation({
    id: "parking",
    label: BASEMENT_TYPE_NAMES.parking,
    area: parkingBasementArea,
    benchmarkRateFactor: BASEMENT_BENCHMARK_RATE_FACTORS.parking,
    qualityId: input.qualityId,
    basementBenchmarkRate,
  })
  const habitableAllocation = calculateBasementTypeAllocation({
    id: "habitable",
    label: BASEMENT_TYPE_NAMES.habitable,
    area: habitableBasementArea,
    benchmarkRateFactor: BASEMENT_BENCHMARK_RATE_FACTORS.habitable,
    qualityId: input.qualityId,
    basementBenchmarkRate,
  })
  const storageTechnicalBasementCost = storageAllocation.cost
  const parkingBasementCost = parkingAllocation.cost
  const habitableBasementCost = habitableAllocation.cost
  const basementBaseCost =
    storageTechnicalBasementCost +
    parkingBasementCost +
    habitableBasementCost
  const breakdownItems = [
    storageAllocation,
    parkingAllocation,
    habitableAllocation,
  ]
  const basementBucket300 = breakdownItems.reduce((sum, item) => sum + item.basementBucket300, 0)
  const basementBucket400 = breakdownItems.reduce((sum, item) => sum + item.basementBucket400, 0)
  const basementKg300SubgroupCosts = breakdownItems.reduce(
    (sum, item) => addKg300SubgroupCosts(sum, item.kg300SubgroupCosts),
    createEmptyKg300SubgroupCosts()
  )
  const rawShares =
    BASEMENT_LEVEL1_ALLOCATION_SHARES[input.qualityId]
    ?? BASEMENT_LEVEL1_ALLOCATION_SHARES[DEFAULT_QUALITY_ID]
  const shareSum = rawShares.kg300 + rawShares.kg400 || 1

  return {
    basementBenchmarkRate,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    storageTechnicalBasementCost,
    parkingBasementCost,
    habitableBasementCost,
    basementBaseCost,
    basementBucket300,
    basementBucket400,
    basementKg300SubgroupCosts,
    level1AllocationShares: {
      share300: rawShares.kg300,
      share400: rawShares.kg400,
      shareSum,
    },
    breakdownItems,
  }
}
