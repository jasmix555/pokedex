import { useEffect, useMemo, useRef, useState } from 'react'
import { usePokemonList } from './hooks/usePokemonList'
import { fetchPokemonByName } from './api/pokemon.api'
import { Pokemon } from './types/pokemon.types'
import { PokemonGrid } from './components/PokemonGrid'
import { PokemonSearch } from './components/PokemonSearch'

export default function PokedexPage() {
  const {
    pokemon,
    isLoading,
    error,
    loadMore,
  } = usePokemonList({ limit: 20 })

  const [search, setSearch] = useState('')
  const [remotePokemon, setRemotePokemon] = useState<Pokemon | null>(null)
  const [isRemoteLoading, setIsRemoteLoading] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const isSearching = search.trim().length > 0

  /* ----------------------------------------
   * Client-side filtered Pokémon
   * ---------------------------------------- */
  const filteredPokemon = useMemo(() => {
    if (!isSearching) return pokemon

    const query = search.toLowerCase()
    return pokemon.filter(p =>
      p.name.toLowerCase().includes(query)
    )
  }, [pokemon, search, isSearching])

  /* ----------------------------------------
   * Server-side lookup (fallback)
   * ---------------------------------------- */
  useEffect(() => {
    if (!isSearching) {
      setRemotePokemon(null)
      return
    }

    if (filteredPokemon.length > 0) {
      setRemotePokemon(null)
      return
    }

    let cancelled = false

    async function searchRemote() {
      try {
        setIsRemoteLoading(true)
        const result = await fetchPokemonByName(search)
        if (!cancelled) {
          setRemotePokemon(result)
        }
      } catch {
        if (!cancelled) {
          setRemotePokemon(null)
        }
      } finally {
        if (!cancelled) {
          setIsRemoteLoading(false)
        }
      }
    }

    searchRemote()

    return () => {
      cancelled = true
    }
  }, [search, isSearching, filteredPokemon.length])

  /* ----------------------------------------
   * Infinite scroll (browse mode only)
   * ---------------------------------------- */
  useEffect(() => {
    if (!sentinelRef.current) return
    if (isSearching) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMore, isLoading, isSearching])

  /* ----------------------------------------
   * Final render list
   * ---------------------------------------- */
  const displayPokemon = useMemo(() => {
    if (filteredPokemon.length > 0) return filteredPokemon
    if (remotePokemon) return [remotePokemon]
    return []
  }, [filteredPokemon, remotePokemon])

  /* ----------------------------------------
   * Error state
   * ---------------------------------------- */
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">
          Failed to load Pokémon
        </p>
        <p className="text-sm text-muted-foreground">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Pokédex</h1>
        <p className="text-muted-foreground">
          Browse Pokémon from the PokeAPI
        </p>
      </header>

      <PokemonSearch
        value={search}
        onChange={setSearch}
      />

      <PokemonGrid
        pokemon={displayPokemon}
        isLoading={
          (!isSearching && isLoading) ||
          (isSearching && isRemoteLoading)
        }
      />

      {isSearching &&
        !isRemoteLoading &&
        displayPokemon.length === 0 && (
          <p className="text-center text-muted-foreground">
            No Pokémon found
          </p>
        )}

      {!isSearching && (
        <div ref={sentinelRef} className="h-1" />
      )}
    </div>
  )
}
