export const GENERATIONS = {
  all: { label: 'All', range: null },
  gen1: { label: 'Red/Blue/Yellow', range: [1, 151] },
  gen2: { label: 'Gold/Silver/Crystal', range: [152, 251] },
  gen3: { label: 'Ruby/Sapphire', range: [252, 386] },
  gen4: { label: 'Diamond/Pearl/Platinum', range: [387, 493] },
  gen5: { label: 'Black/White', range: [494, 649] },
  gen6: { label: 'X/Y', range: [650, 721] },
  gen7: { label: 'Sun/Moon', range: [722, 809] },
  gen8: { label: 'Sword/Shield', range: [810, 905] },
  gen9: { label: 'Scarlet/Violet', range: [906, 1025] },
} as const

export type GenerationKey = keyof typeof GENERATIONS
