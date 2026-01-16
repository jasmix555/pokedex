'use client'

import { useRef, useState, useEffect } from 'react'

import { usePokemonList } from './hooks/usePokemonList'
import { usePokemonSearch } from './hooks/usePokemonSearch'

import { PokemonGrid } from './components/PokemonGrid'
import { PokemonSearch } from './components/PokemonSearch'
import { PokemonModal } from './components/PokemonModal'
import { PokemonFilter } from './components/PokemonFilter'

import { Pokemon } from './types/pokemon.types'
import { GENERATIONS, GenerationKey } from '@/constants/generations'

export default function PokedexPage() {
  /* ----------------------------------------
   * Data sources
   * ---------------------------------------- */
  const {
    pokemon,
    isLoading: isListLoading,
    error,
    loadMore,
    hasMore,
  } = usePokemonList({ limit: 20 })

  const [search, setSearch] = useState('')
  const [selectedPokemon, setSelectedPokemon] =
    useState<Pokemon | null>(null)
  const [generation, setGeneration] =
    useState<GenerationKey>('all')

  const {
    isSearching,
    isLoading: isSearchLoading,
    results: searchResults,
  } = usePokemonSearch(search)

  /* ----------------------------------------
   * Derived loading state (MUST be above effects)
   * ---------------------------------------- */
  const isGridLoading =
  isSearching
    ? isSearchLoading && searchResults.length === 0
    : isListLoading && pokemon.length === 0


  /* ----------------------------------------
   * Infinite scroll (browse mode only)
   * ---------------------------------------- */
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
  if (isSearching) return
  if (!sentinelRef.current) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isListLoading) {
        loadMore()
      }
    },
    { rootMargin: '200px' }
  )

  observer.observe(sentinelRef.current)
  return () => observer.disconnect()
}, [isSearching, isListLoading, loadMore])


  /* ----------------------------------------
   * Derived data
   * ---------------------------------------- */

 const displayPokemon = (() => {
  if (isSearching) {
    return searchResults
  }

  const range = GENERATIONS[generation].range
  if (!range) return pokemon

  const [min, max] = range
  return pokemon.filter(
    p => p.id >= min && p.id <= max
  )
})()


  /* ----------------------------------------
   * Error state
   * ---------------------------------------- */
  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load Pokémon
      </div>
    )
  }

  /* ----------------------------------------
   * Render
   * ---------------------------------------- */
  return (
    <div className="p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">
          Pokédex
        </h1>
        <p className="text-muted-foreground">
          Browse Pokémon from the PokeAPI
        </p>
      </header>

      <PokemonSearch
        value={search}
        onChange={setSearch}
      />

      <PokemonFilter
        value={generation}
        onChange={setGeneration}
      />

      <PokemonGrid
        pokemon={displayPokemon}
        isLoading={isGridLoading}
        onSelect={setSelectedPokemon}
      />

      {/* Infinite scroll sentinel */}
      {!isSearching && hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden
          className="h-1"
        />
      )}

      <PokemonModal
        pokemon={selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />
    </div>
  )
}
