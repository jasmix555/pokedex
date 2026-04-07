// usePokemonSearch.ts
'use client'

import { useEffect, useState } from 'react'
import { Pokemon } from '../types/pokemon.types'
import { mapPokemon } from '../utils/mapPokemon'
import { usePokemonIndex } from './usePokemon'

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[b.length][a.length]
}

export function usePokemonSearch(query: string) {
  const index = usePokemonIndex()

  const [results, setResults] = useState<Pokemon[]>([])
  const [similarNames, setSimilarNames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isSearching = query.trim().length > 0
  const normalized = query.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    if (!isSearching || index.length === 0) {
      setResults([])
      setSimilarNames([])
      return
    }

    const exactMatches = index
      .filter(p => p.name.includes(normalized))
      .slice(0, 20)

    // Find similar names (fuzzy matching)
    if (exactMatches.length === 0) {
      const similarities = index.map(p => ({
        name: p.name,
        distance: levenshteinDistance(normalized, p.name),
      }))
      
      const closeMatches = similarities
        .filter(s => s.distance <= 3)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
        .map(s => s.name)
      
      setSimilarNames(closeMatches)
    } else {
      setSimilarNames([])
    }

    if (exactMatches.length === 0) {
      setResults([])
      return
    }

    const controller = new AbortController()

    async function resolvePokemon() {
      try {
        setIsLoading(true)

        const raw = await Promise.all(
          exactMatches.map(m =>
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
    similarNames,
  }
}
