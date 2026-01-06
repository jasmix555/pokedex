import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchPokemonList } from '../api/pokemon.api'
import { Pokemon } from '../types/pokemon.types'

export function usePokemonList({ limit = 20 } = {}) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Track which offsets have already been fetched
  const fetchedOffsetsRef = useRef<Set<number>>(new Set())

  const loadPokemon = useCallback(async () => {
    // ✅ Hard guard against duplicate fetches
    if (fetchedOffsetsRef.current.has(offset)) {
      return
    }

    fetchedOffsetsRef.current.add(offset)

    try {
      setIsLoading(true)
      setError(null)

      const newPokemon = await fetchPokemonList(limit, offset)

      setPokemon(prev => [...prev, ...newPokemon])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unexpected error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }, [limit, offset])

  useEffect(() => {
    loadPokemon()
  }, [loadPokemon])

  const loadMore = () => {
    setOffset(prev => prev + limit)
  }

  return {
    pokemon,
    isLoading,
    error,
    loadMore,
  }
}
