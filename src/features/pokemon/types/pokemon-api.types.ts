// Raw API response — mirrors PokeAPI exactly
export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export interface PokemonListItem {
  name: string
  url: string
}

// Used when fetching individual Pokémon
export interface PokemonResponse {
  id: number
  name: string
  height: number
  weight: number

  sprites: {
    front_default: string | null
    front_female: string | null
    front_shiny: string | null
    front_shiny_female: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
    }
  }

  types: {
    slot: number
    type: {
      name: string
    }
  }[]

  stats: {
    base_stat: number
    stat: {
      name: string
    }
  }[]
}
