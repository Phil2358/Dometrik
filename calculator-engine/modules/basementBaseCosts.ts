import {
  BASEMENT_BENCHMARK_RATE_FACTORS,
  BASEMENT_TYPE_NAMES,
} from "../../constants/construction"

interface BasementBaseCostsInput {
  correctedBenchmarkRate: number
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

  return {
    basementBenchmarkRate,
    storageBasementArea,
    parkingBasementArea,
    habitableBasementArea,
    storageTechnicalBasementCost,
    parkingBasementCost,
    habitableBasementCost,
    basementBaseCost,
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
