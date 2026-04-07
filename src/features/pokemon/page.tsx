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
import { t, type Language } from './constants/translations'

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
  const [language, setLanguage] = useState<Language>('en')

  const selectedPokemon = modalStack.length > 0 ? modalStack[modalStack.length - 1] : null

  const openPokemonModal = (pokemon: Pokemon, keepHistory = false) => {
    setModalStack(prev =>
      keepHistory ? [...prev, pokemon] : [pokemon]
    )
  }

  const closePokemonModal = () => {
    setModalStack([])
  }

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

  const isGridLoading = isSearching
    ? isSearchLoading && searchResults.length === 0
    : (isListLoading && pokemon.length === 0) || isGenLoading

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
    <div className="p-4 space-y-6">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t('pokedex', language)}</h1>
          <p className="text-muted-foreground">{t('browse', language)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-2 rounded-md text-sm border font-medium ${
              language === 'en'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-black border-gray-300 hover:bg-gray-100'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('jp')}
            className={`px-3 py-2 rounded-md text-sm border font-medium ${
              language === 'jp'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-black border-gray-300 hover:bg-gray-100'
            }`}
          >
            JP
          </button>
        </div>
      </header>

      <PokemonSearch value={search} onChange={setSearch} />

      <PokemonFilter value={generation} onChange={setGeneration} />

      <PokemonGrid
        pokemon={displayPokemon}
        isLoading={isGridLoading}
        onSelect={(pokemon: Pokemon) => openPokemonModal(pokemon)}
        similarFinds={similarFinds}
        currentGen={GENERATIONS[generation].label}
        similarNames={similarNames}
        searchQuery={search}
      />

      <PokemonModal
        pokemon={selectedPokemon}
        onClose={closePokemonModal}
        onOpenEvolution={(pokemon: Pokemon) => openPokemonModal(pokemon, true)}
      />

      {/* Infinite scroll sentinel */}
      {!isSearching && hasMore && !isGenLoading && (
        <div ref={sentinelRef} aria-hidden className="h-1" />
      )}
    </div>
  )
}