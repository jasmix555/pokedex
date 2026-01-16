// usePokemonSearch.ts
'use client'

import { useEffect, useState } from 'react'
import { Pokemon } from '../types/pokemon.types'
import { mapPokemon } from '../utils/mapPokemon'
import { usePokemonIndex } from './usePokemon'

export function usePokemonSearch(query: string) {
  const index = usePokemonIndex()

  const [results, setResults] = useState<Pokemon[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isSearching = query.trim().length > 0
  const normalized = query.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    if (!isSearching || index.length === 0) {
      setResults([])
      return
    }

    const matches = index
      .filter(p => p.name.includes(normalized))
      .slice(0, 20)

    if (matches.length === 0) {
      setResults([])
      return
    }

    const controller = new AbortController()

    async function resolvePokemon() {
      try {
        setIsLoading(true)

        const raw = await Promise.all(
          matches.map(m =>
            fetch(m.url, { signal: controller.signal })
              .then(r => r.json())
          )
        )

        // 🔴 CRITICAL FIX
        setResults(raw.map(mapPokemon))
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setResults([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    resolvePokemon()
    return () => controller.abort()
  }, [normalized, isSearching, index])

  return {
    isSearching,
    isLoading,
    results,
  }
}
