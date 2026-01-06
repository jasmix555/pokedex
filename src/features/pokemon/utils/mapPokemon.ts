import { PokemonResponse } from '../types/pokemon-api.types'
import { Pokemon } from '../types/pokemon.types'

export function mapPokemon(apiPokemon: PokemonResponse): Pokemon {
  return {
    id: apiPokemon.id,
    name: apiPokemon.name,
    image:
      apiPokemon.sprites.other?.['official-artwork']?.front_default ??
      apiPokemon.sprites.front_default ??
      '',
    types: apiPokemon.types.map(t => t.type.name),
  }
}
