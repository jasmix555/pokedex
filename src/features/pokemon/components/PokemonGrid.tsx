import { Pokemon } from '../types/pokemon.types'
import { PokemonCard } from './PokemonCard'
import { PokemonSkeleton } from './PokemonSkeleton'

interface Props {
  pokemon: Pokemon[]
  isLoading: boolean
  onSelect: (pokemon: Pokemon) => void
}

export function PokemonGrid({
  pokemon,
  isLoading,
  onSelect,
}: Props) {
  /* ----------------------------------------
   * Loading with no data (initial / search)
   * ---------------------------------------- */
  if (isLoading && pokemon.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <PokemonSkeleton count={8} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {pokemon.map(p => (
        <PokemonCard
          key={p.id}
          pokemon={p}
          onClick={onSelect}
        />
      ))}

      {/* ----------------------------------------
       * Infinite scroll append loading
       * ---------------------------------------- */}
      {isLoading && <PokemonSkeleton count={4} />}
    </div>
  )
}
