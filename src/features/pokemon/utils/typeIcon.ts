import { PokemonType } from '../types/pokemon.types'

export function getTypeIcon(type: PokemonType): string {
  return `/types/${type}.svg`
}
