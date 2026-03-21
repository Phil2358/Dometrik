export interface Kg700Subgroup {
  code: string
  cost: number
  visible: boolean
  meta?: Record<string, string | number | boolean>
}

interface Kg700SubgroupsInput {
  permitFee: number
}

export function calculateKg700Subgroups(input: Kg700SubgroupsInput) {
  const subgroup710Cost = Math.round(input.permitFee * 0.50)
  const subgroup720Cost = Math.round(input.permitFee * 0.30)
  const subgroup750Cost =
    input.permitFee - subgroup710Cost - subgroup720Cost

  const kg700Subgroups: Kg700Subgroup[] = [
    {
      code: "710",
      cost: subgroup710Cost,
      visible: true,
      meta: { costSource: "allocated" },
    },
    {
      code: "720",
      cost: subgroup720Cost,
      visible: true,
      meta: { costSource: "allocated" },
    },
    {
      code: "750",
      cost: subgroup750Cost,
      visible: true,
      meta: { costSource: "allocated" },
    },
  ]

  return {
    kg700Subgroups,
    kg700Total: kg700Subgroups.reduce((sum, subgroup) => sum + subgroup.cost, 0),
  }
}
