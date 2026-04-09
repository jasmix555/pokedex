'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

import { usePokemonList } from './hooks/usePokemonList'
import { usePokemonSearch } from './hooks/usePokemonSearch'

import { PokemonGrid } from './components/PokemonGrid'
import { PokemonSearch } from './components/PokemonSearch'
import { PokemonModal } from './components/PokemonModal'
import { PokemonFilter } from './components/PokemonFilter'

import { Pokemon } from './types/pokemon.types'
import { GENERATIONS, GenerationKey } from '@/constants/generations'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'

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
  const [modalStack, setModalStack] = useState<Pokemon[]>([])
  const [generation, setGeneration] = useState<GenerationKey>('all')
  const [pokemonGenders, setPokemonGenders] = useState<Map<number, 'male' | 'female'>>(new Map())
  const [pokemonShinies, setPokemonShinies] = useState<Map<number, boolean>>(new Map())

  const selectedPokemon = modalStack.length > 0 ? modalStack[modalStack.length - 1] : null
  const modalGender = selectedPokemon ? pokemonGenders.get(selectedPokemon.id) || 'male' : 'male'
  const modalShiny = selectedPokemon ? pokemonShinies.get(selectedPokemon.id) ?? false : false

  const handleShinyChange = useCallback((pokemonId: number, shiny: boolean) => {
    setPokemonShinies(prev => new Map(prev).set(pokemonId, shiny))
  }, [])

  const openPokemonModal = (pokemon: Pokemon, gender: 'male' | 'female', keepHistory = false) => {
    setPokemonGenders(prev => new Map(prev.set(pokemon.id, gender)))
    setModalStack(prev => keepHistory ? [...prev, pokemon] : [pokemon])
  }

  const closePokemonModal = () => {
    setModalStack([])
  }

  const updatePokemonGender = useCallback((pokemonId: number, gender: 'male' | 'female') => {
    setPokemonGenders(prev => new Map(prev.set(pokemonId, gender)))
  }, [])

  const {
    isSearching,
    isLoading: isSearchLoading,
    results: searchResults,
    similarNames,
  } = usePokemonSearch(search)

  /* ----------------------------------------
   * Derived data
   * ---------------------------------------- */
  const displayPokemon = (() => {
    const range = GENERATIONS[generation].range

    if (isSearching) {
      // Filter search results by current generation
      if (!range) return searchResults

      const [min, max] = range
      return searchResults.filter(p => p.id >= min && p.id <= max)
    }

    if (!range) return pokemon

    const [min, max] = range
    return pokemon.filter(p => p.id >= min && p.id <= max)
  })()

  // Results outside current generation with their generation info
  const similarFinds = (() => {
    if (!isSearching || generation === 'all') return []

    const range = GENERATIONS[generation].range
    if (!range) return []

    const [min, max] = range
    const outside = searchResults.filter(p => p.id < min || p.id > max)

    // Map each Pokémon to its generation
    return outside.map(pokemon => {
      let foundGen: typeof GENERATIONS[keyof typeof GENERATIONS] | null = null

      for (const [, gen] of Object.entries(GENERATIONS)) {
        if (gen.range && pokemon.id >= gen.range[0] && pokemon.id <= gen.range[1]) {
          foundGen = gen
          break
        }
      }

      return {
        pokemon,
        generationLabel: foundGen?.label || 'Unknown',
      }
    })
  })()

  /* ----------------------------------------
   * Auto-load until the selected generation
   * has at least one Pokémon available
   * ---------------------------------------- */
  const genRange = GENERATIONS[generation].range

  const genIsFullyReached = (() => {
    if (!genRange) return true          // "all" — nothing to wait for
    const [, max] = genRange
    // We've loaded past the end of this gen, or there's nothing more to load
    return !hasMore || pokemon.some(p => p.id >= max)
  })()

  useEffect(() => {
    if (isSearching) return
    if (isListLoading) return
    if (genIsFullyReached) return

    // Keep fetching until we reach this generation's range
    loadMore()
  }, [isSearching, isListLoading, genIsFullyReached, loadMore])

  /* ----------------------------------------
   * Derived loading state
   * ---------------------------------------- */
  const isGenLoading = !isSearching && !genIsFullyReached

  const isGridLoading =
    pokemon.length === 0
      ? true
      : isSearching
        ? isSearchLoading && searchResults.length === 0
        : isGenLoading

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
    <div className="p-2 space-y-5 sm:p-4 md:p-6 lg:p-8 min-h-screen max-w-7xl mx-auto">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Pokédex</h1>
        </div>
      </header>

      <PokemonSearch value={search} onChange={setSearch} />

      <PokemonFilter value={generation} onChange={setGeneration} />

      <PokemonGrid
        pokemon={displayPokemon}
        isLoading={isGridLoading}
        onSelect={(pokemon: Pokemon, gender: 'male' | 'female') => openPokemonModal(pokemon, gender)}
        pokemonGenders={pokemonGenders}
        onGenderChange={updatePokemonGender}
        pokemonShinies={pokemonShinies}
        onShinyChange={handleShinyChange}
        similarFinds={similarFinds}
        currentGen={GENERATIONS[generation].label}
        similarNames={similarNames}
        searchQuery={search}
      />

      <PokemonModal
        pokemon={selectedPokemon}
        onClose={closePokemonModal}
        onOpenEvolution={(pokemon: Pokemon, gender: 'male' | 'female') => openPokemonModal(pokemon, gender, true)}
        initialGender={modalGender}
        onGenderChange={updatePokemonGender}
        initialShiny={modalShiny}
        onShinyChange={handleShinyChange}
      />

      {/* Infinite scroll sentinel */}
      {!isSearching && hasMore && !isGenLoading && (
        <div ref={sentinelRef} aria-hidden className="h-1" />
      )}


      <ScrollToTopButton/>
    </div>
  )
}