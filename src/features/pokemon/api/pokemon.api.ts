// features/pokemon/api/pokemon.api.ts

import {
  PokemonListResponse,
  PokemonResponse,
} from '../types/pokemon-api.types'
import { mapPokemon } from '../utils/mapPokemon'

/* ---------------- list pagination ---------------- */

async function fetchJson<T>(url: string, retries = 2): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      return (await res.json()) as T
    } catch (err) {
      lastError = err
      // small backoff before retrying
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)))
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed')
}

export async function fetchPokemonList(
  limit: number,
  offset: number
) {
  const data = await fetchJson<PokemonListResponse>(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  )

  // Hydrate each Pokémon. Use allSettled so a single failed detail fetch
  // doesn't blow away the entire batch — we keep whatever succeeded and
  // preserve ordering.
  const settled = await Promise.allSettled(
    data.results.map(item => fetchJson<PokemonResponse>(item.url))
  )

  const detailed = settled
    .filter(
      (r): r is PromiseFulfilledResult<PokemonResponse> =>
        r.status === 'fulfilled'
    )
    .map(r => mapPokemon(r.value))

  // rawCount = how many entries the list endpoint returned for this page.
  // Pagination decisions should use this, not the number of detail fetches
  // that happened to succeed.
  return { pokemon: detailed, rawCount: data.results.length }
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
