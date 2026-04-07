import { PokemonResponse } from '../types/pokemon-api.types'
import { Pokemon, PokemonType } from '../types/pokemon.types'

export function mapPokemon(apiPokemon: PokemonResponse): Pokemon {
  return {
    id: apiPokemon.id,
    name: apiPokemon.name,
    sprite: apiPokemon.sprites.front_default ?? '',
    image:
      apiPokemon.sprites.other?.['official-artwork']?.front_default ??
      apiPokemon.sprites.front_default ??
      '',

    types: apiPokemon.types
      .sort((a, b) => a.slot - b.slot)
      .map(t => t.type.name as PokemonType),

    stats: apiPokemon.stats.map(stat => ({
      name: stat.stat.name,
      value: stat.base_stat,
    })),
  }
}
