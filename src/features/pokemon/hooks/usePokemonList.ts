import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchPokemonList } from '../api/pokemon.api'
import { Pokemon } from '../types/pokemon.types'

export function usePokemonList({ limit = 20 } = {}) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  // Prevent duplicate offset fetches
  const fetchedOffsetsRef = useRef<Set<number>>(new Set())

  const loadPokemon = useCallback(async () => {
    if (isLoading || !hasMore) return
    if (fetchedOffsetsRef.current.has(offset)) return

    fetchedOffsetsRef.current.add(offset)

    try {
      setIsLoading(true)
      setError(null)

      const newPokemon = await fetchPokemonList(limit, offset)

      // ✅ Stop infinite scroll when API is exhausted
      if (newPokemon.length === 0) {
        setHasMore(false)
        return
      }

      setPokemon(prev => [...prev, ...newPokemon])

      if (newPokemon.length < limit) {
        setHasMore(false)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unexpected error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }, [limit, offset, isLoading, hasMore])

  useEffect(() => {
    loadPokemon()
  }, [loadPokemon])

  const loadMore = () => {
    if (!hasMore || isLoading) return
    setOffset(prev => prev + limit)
  }

  return {
    pokemon,
    isLoading,
    error,
    loadMore,
    hasMore,
  }
}
