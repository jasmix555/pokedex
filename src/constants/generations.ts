export const GENERATIONS = {
  all: { label: 'All', range: null },
  gen1: { label: 'Gen 1', range: [1, 151] },
  gen2: { label: 'Gen 2', range: [152, 251] },
  gen3: { label: 'Gen 3', range: [252, 386] },
  gen4: { label: 'Gen 4', range: [387, 493] },
  gen5: { label: 'Gen 5', range: [494, 649] },
  gen6: { label: 'Gen 6', range: [650, 721] },
  gen7: { label: 'Gen 7', range: [722, 809] },
  gen8: { label: 'Gen 8', range: [810, 905] },
  gen9: { label: 'Gen 9', range: [906, 1025] },
} as const

export type GenerationKey = keyof typeof GENERATIONS
