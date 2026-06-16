import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchPokemonList } from '../api/pokemon.api'
import { Pokemon } from '../types/pokemon.types'

interface UsePokemonListOptions {
  limit?: number
  /** Restrict loading to a national-dex id range, e.g. [387, 493] for Gen 4. */
  range?: readonly [number, number] | null
}

export function usePokemonList({ limit = 20, range = null }: UsePokemonListOptions = {}) {
  // Jump straight to the generation's slice instead of crawling from #1.
  const startOffset = range ? range[0] - 1 : 0
  const endId = range ? range[1] : Infinity

  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [offset, setOffset] = useState(startOffset)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  // Offsets fetched *successfully* — prevents duplicate appends while still
  // allowing a failed page to be retried.
  const loadedOffsetsRef = useRef<Set<number>>(new Set())
  // Guard against overlapping in-flight requests for the same offset.
  const inFlightRef = useRef<Set<number>>(new Set())
  // Incremented on every range reset. Any fetch that started under an older
  // token is stale and must not touch state (fixes fast generation switching).
  const loadIdRef = useRef(0)

  // Reset everything when the requested range changes (generation switch).
  useEffect(() => {
    loadIdRef.current += 1
    setPokemon([])
    setOffset(startOffset)
    setHasMore(true)
    setError(null)
    loadedOffsetsRef.current.clear()
    inFlightRef.current.clear()
  }, [startOffset, endId])

  const loadPokemon = useCallback(async () => {
    if (!hasMore) return
    if (loadedOffsetsRef.current.has(offset)) return
    if (inFlightRef.current.has(offset)) return

    // Sequential integrity: a page is only valid if it's the range's first
    // page or the page right before it has already loaded. After a generation
    // switch the offset state lags one render behind startOffset, so without
    // this guard the stale offset (e.g. 0 = Gen 1) would fetch into the new
    // range before setOffset takes effect.
    const isStartPage = offset === startOffset
    const prevPageLoaded = loadedOffsetsRef.current.has(offset - limit)
    if (!isStartPage && !prevPageLoaded) return

    const myLoadId = loadIdRef.current
    inFlightRef.current.add(offset)

    try {
      setIsLoading(true)
      setError(null)

      const { pokemon: batch, rawCount } = await fetchPokemonList(limit, offset)

      // A newer range was selected while this request was in flight — drop it.
      if (loadIdRef.current !== myLoadId) return

      if (rawCount === 0) {
        setHasMore(false)
        loadedOffsetsRef.current.add(offset)
        return
      }

      loadedOffsetsRef.current.add(offset)

      // Trim anything past the end of the requested range (last batch overshoots).
      const newPokemon = batch.filter(p => p.id <= endId)

      setPokemon(prev => {
        const seen = new Set(prev.map(p => p.id))
        const merged = [...prev]
        for (const p of newPokemon) {
          if (!seen.has(p.id)) merged.push(p)
        }
        return merged
      })

      // Stop when we've reached the range end, exhausted the API, or got a
      // short page.
      const reachedRangeEnd = batch.some(p => p.id >= endId)
      if (reachedRangeEnd || rawCount < limit) {
        setHasMore(false)
      }
    } catch (err) {
      if (loadIdRef.current !== myLoadId) return
      const message =
        err instanceof Error ? err.message : 'Unexpected error occurred'
      setError(prev => (pokemon.length === 0 ? message : prev))
    } finally {
      inFlightRef.current.delete(offset)
      if (loadIdRef.current === myLoadId) setIsLoading(false)
    }
  }, [limit, offset, startOffset, hasMore, endId, pokemon.length])

  useEffect(() => {
    loadPokemon()
  }, [loadPokemon])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    setOffset(prev => prev + limit)
  }, [hasMore, isLoading, limit])

  const retry = useCallback(() => {
    setError(null)
    loadedOffsetsRef.current.delete(offset)
    loadPokemon()
  }, [offset, loadPokemon])

  return {
    pokemon,
    isLoading,
    error,
    loadMore,
    hasMore,
    retry,
  }
}
