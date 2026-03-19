import {
  BASEMENT_LEVEL1_ALLOCATION_SHARES,
  BASEMENT_BENCHMARK_RATE_FACTORS,
  BASEMENT_TYPE_NAMES,
  DEFAULT_QUALITY_ID,
  type QualityId,
} from "../../constants/construction"

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

export function calculateBasementBaseCosts(input: BasementBaseCostsInput) {
  const {
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
  } = resolveBasementAreas(input)

  const basementBenchmarkRate = Math.max(0, Math.round(input.correctedBenchmarkRate))
  const storageTechnicalBasementCost = Math.round(
    storageBasementArea * basementBenchmarkRate * BASEMENT_BENCHMARK_RATE_FACTORS.storage
  )
  const parkingBasementCost = Math.round(
    parkingBasementArea * basementBenchmarkRate * BASEMENT_BENCHMARK_RATE_FACTORS.parking
  )
  const habitableBasementCost = Math.round(
    habitableBasementArea * basementBenchmarkRate * BASEMENT_BENCHMARK_RATE_FACTORS.habitable
  )
  const basementBaseCost =
    storageTechnicalBasementCost +
    parkingBasementCost +
    habitableBasementCost
  const basementLevel1Allocation =
    calculateBasementLevel1Allocation(basementBaseCost, input.qualityId)

  return {
    basementBenchmarkRate,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    storageTechnicalBasementCost,
    parkingBasementCost,
    habitableBasementCost,
    basementBaseCost,
    basementBucket300: basementLevel1Allocation.basementBucket300,
    basementBucket400: basementLevel1Allocation.basementBucket400,
    level1AllocationShares: {
      share300: basementLevel1Allocation.share300,
      share400: basementLevel1Allocation.share400,
      shareSum: basementLevel1Allocation.shareSum,
    },
    breakdownItems: [
      {
        id: "storage",
        label: BASEMENT_TYPE_NAMES.storage,
        area: storageBasementArea,
        benchmarkRateFactor: BASEMENT_BENCHMARK_RATE_FACTORS.storage,
        cost: storageTechnicalBasementCost,
      },
      {
        id: "parking",
        label: BASEMENT_TYPE_NAMES.parking,
        area: parkingBasementArea,
        benchmarkRateFactor: BASEMENT_BENCHMARK_RATE_FACTORS.parking,
        cost: parkingBasementCost,
      },
      {
        id: "habitable",
        label: BASEMENT_TYPE_NAMES.habitable,
        area: habitableBasementArea,
        benchmarkRateFactor: BASEMENT_BENCHMARK_RATE_FACTORS.habitable,
        cost: habitableBasementCost,
      },
    ],
  }
}
