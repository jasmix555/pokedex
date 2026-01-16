// features/pokemon/api/pokemon.api.ts

import {
  PokemonListResponse,
  PokemonResponse,
} from '../types/pokemon-api.types'
import { mapPokemon } from '../utils/mapPokemon'

/* ---------------- list pagination ---------------- */

export async function fetchPokemonList(
  limit: number,
  offset: number
) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  )

  if (!res.ok) {
    throw new Error('Failed to fetch Pokémon list')
  }

  const data: PokemonListResponse = await res.json()

  // 👇 hydrate each Pokémon
  const detailed = await Promise.all(
    data.results.map(async item => {
      const res = await fetch(item.url)
      if (!res.ok) {
        throw new Error('Failed to fetch Pokémon')
      }
      const pokemon: PokemonResponse = await res.json()
      return mapPokemon(pokemon)
    })
  )

  return detailed
}
/* ---------------- single pokemon ---------------- */

export async function fetchPokemonByName(name: string) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${name}`
  )

  if (!res.ok) {
    throw new Error('Failed to fetch Pokémon')
  }

  const data: PokemonResponse = await res.json()
  return data
}

/* ---------------- FULL NAME INDEX (SEARCH) ---------------- */

export interface PokemonNameIndex {
  name: string
  url: string
}

export async function fetchPokemonNameIndex(): Promise<PokemonNameIndex[]> {
  const res = await fetch(
    'https://pokeapi.co/api/v2/pokemon'
  )

  if (!res.ok) {
    throw new Error('Failed to load Pokémon index')
  }

  const data = await res.json()
  return data.results
}
