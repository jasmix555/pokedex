import { PokemonType } from '../types/pokemon.types'

type Effectiveness = 2 | 0.5 | 0

export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, Effectiveness>>> = {
  normal:   { fighting: 2, ghost: 0 },
  fire:     { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5 },
  water:    { electric: 2, grass: 2, water: 0.5, fire: 0.5, ice: 0.5, steel: 0.5 },
  electric: { ground: 2, electric: 0.5, flying: 0.5, steel: 0.5 },
  grass:    { fire: 2, ice: 2, poison: 2, flying: 2, bug: 2, water: 0.5, electric: 0.5, grass: 0.5, ground: 0.5 },
  ice:      { fire: 2, fighting: 2, rock: 2, steel: 2, ice: 0.5 },
  fighting: { flying: 2, psychic: 2, fairy: 2, bug: 0.5, rock: 0.5, dark: 0.5, ghost: 0 },
  poison:   { ground: 2, psychic: 2, fighting: 0.5, poison: 0.5, bug: 0.5, grass: 0.5, fairy: 0.5 },
  ground:   { water: 2, grass: 2, ice: 2, electric: 0, poison: 0.5, rock: 0.5 },
  flying:   { electric: 2, ice: 2, rock: 2, ground: 0, fighting: 0.5, bug: 0.5, grass: 0.5 },
  psychic:  { bug: 2, ghost: 2, dark: 2, fighting: 0.5, psychic: 0.5 },
  bug:      { fire: 2, flying: 2, rock: 2, fighting: 0.5, ground: 0.5, grass: 0.5 },
  rock:     { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2, normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5 },
  ghost:    { ghost: 2, dark: 2, normal: 0, fighting: 0, poison: 0.5, bug: 0.5 },
  dragon:   { ice: 2, dragon: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5 },
  dark:     { fighting: 2, bug: 2, fairy: 2, ghost: 0.5, dark: 0.5, psychic: 0 },
  steel:    { fire: 2, fighting: 2, ground: 2, normal: 0.5, grass: 0.5, ice: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, poison: 0 },
  fairy:    { poison: 2, steel: 2, fighting: 0.5, bug: 0.5, dark: 0.5, dragon: 0 },
}

export function getDefensiveMatchups(types: PokemonType[]) {
  const all: PokemonType[] = [
    'normal','fire','water','electric','grass','ice','fighting','poison',
    'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy',
  ]

  const weaknesses: { type: PokemonType; multiplier: number }[] = []
  const resistances: { type: PokemonType; multiplier: number }[] = []
  const immunities: { type: PokemonType; multiplier: number }[] = []

  for (const attacker of all) {
    let multiplier = 1

    for (const defType of types) {
      const chart = TYPE_CHART[defType]
      const eff = chart[attacker] ?? 1
      multiplier *= eff
    }

    if (multiplier === 0) immunities.push({ type: attacker, multiplier: 0 })
    else if (multiplier >= 2) weaknesses.push({ type: attacker, multiplier })
    else if (multiplier < 1) resistances.push({ type: attacker, multiplier })
  }

  // Sort weaknesses descending (4x before 2x), resistances ascending (0.25x before 0.5x)
  weaknesses.sort((a, b) => b.multiplier - a.multiplier)
  resistances.sort((a, b) => a.multiplier - b.multiplier)

  return { weaknesses, resistances, immunities }
}