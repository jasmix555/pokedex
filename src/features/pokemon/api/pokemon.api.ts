import {
  PokemonListResponse,
  PokemonResponse,
} from '../types/pokemon-api.types'
import { Pokemon } from '../types/pokemon.types'
import { mapPokemon } from '../utils/mapPokemon'

const BASE_URL = 'https://pokeapi.co/api/v2'

/* ----------------------------------------
 * Fetch paginated Pokémon list
 * ---------------------------------------- */
export async function fetchPokemonList(
  limit: number,
  offset: number
): Promise<Pokemon[]> {
  const res = await fetch(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
  )

  if (!res.ok) {
    throw new Error('Failed to fetch Pokémon list')
  }

  const data: PokemonListResponse = await res.json()

  // Fetch details in parallel
  const pokemonDetails = await Promise.all(
    data.results.map(async (item) => {
      const res = await fetch(item.url)

      if (!res.ok) {
        throw new Error('Failed to fetch Pokémon details')
      }

      const pokemonData: PokemonResponse = await res.json()
      return mapPokemon(pokemonData)
    })
  )

  return pokemonDetails
}

/* ----------------------------------------
 * Fetch Pokémon by name (search / lookup)
 * ---------------------------------------- */
export async function fetchPokemonByName(
  name: string
): Promise<Pokemon> {
  const res = await fetch(
    `${BASE_URL}/pokemon/${name.toLowerCase()}`
  )

  if (!res.ok) {
    throw new Error('Pokemon not found')
  }

  const data: PokemonResponse = await res.json()
  return mapPokemon(data)
}
