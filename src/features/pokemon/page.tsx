'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

import { usePokemonList } from './hooks/usePokemonList'
import { usePokemonSearch } from './hooks/usePokemonSearch'

import { PokemonGrid } from './components/PokemonGrid'
import { PokemonSearch } from './components/PokemonSearch'
import { PokemonModal } from './components/PokemonModal'
import { PokemonFilter } from './components/PokemonFilter'
import { PokedexFrame } from './components/PokedexFrame'

import { Pokemon } from './types/pokemon.types'
import { GENERATIONS, GenerationKey } from '@/constants/generations'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'

export default function PokedexPage() {
  /* ----------------------------------------
   * Data sources
   * ---------------------------------------- */
  const [search, setSearch] = useState('')
  const [modalStack, setModalStack] = useState<Pokemon[]>([])
  const [generation, setGeneration] = useState<GenerationKey>('all')

  const {
    pokemon,
    isLoading: isListLoading,
    error,
    loadMore,
    hasMore,
    retry,
  } = usePokemonList({ limit: 20, range: GENERATIONS[generation].range })

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

    // In browse mode the list hook already loads only the selected
    // generation's range, so no extra filtering is needed.
    return pokemon
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
   * Derived loading state
   * ---------------------------------------- */
  const isGridLoading = isSearching
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
   * Error state (only when nothing loaded)
   * ---------------------------------------- */
  if (error && pokemon.length === 0) {
    return (
      <PokedexFrame>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="h-14 w-14 rounded-full border-4 border-zinc-400 bg-zinc-200" />
          <p className="pkdx-font text-[10px] leading-relaxed text-zinc-700">
            CONNECTION LOST
          </p>
          <p className="max-w-xs text-sm text-zinc-500">
            Couldn't reach the Pokémon network. Check your connection and try
            again.
          </p>
          <button
            type="button"
            onClick={retry}
            className="rounded-full bg-[var(--pkdx-red)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--pkdx-red-dark)]"
          >
            Retry
          </button>
        </div>
      </PokedexFrame>
    )
  }

  /* ----------------------------------------
   * Render
   * ---------------------------------------- */
  return (
    <>
      <PokedexFrame
        controls={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <PokemonSearch value={search} onChange={setSearch} />
            <PokemonFilter value={generation} onChange={setGeneration} />
          </div>
        }
      >
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

        {/* Infinite scroll sentinel */}
        {!isSearching && hasMore && (
          <div ref={sentinelRef} aria-hidden className="h-1" />
        )}
      </PokedexFrame>

      <PokemonModal
        pokemon={selectedPokemon}
        onClose={closePokemonModal}
        onOpenEvolution={(pokemon: Pokemon, gender: 'male' | 'female') => openPokemonModal(pokemon, gender, true)}
        initialGender={modalGender}
        onGenderChange={updatePokemonGender}
        initialShiny={modalShiny}
        onShinyChange={handleShinyChange}
      />

      <ScrollToTopButton/>
    </>
  )
}