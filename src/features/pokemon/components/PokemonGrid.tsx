import { Pokemon } from '../types/pokemon.types'
import { PokemonCard } from './PokemonCard'
import { PokemonSkeleton } from './PokemonSkeleton'

interface PokemonGridProps {
  pokemon: Pokemon[]
  isLoading: boolean
}

export function PokemonGrid({ pokemon, isLoading }: PokemonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {pokemon.map(p => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}

      {isLoading && <PokemonSkeleton />}
    </div>
  )
}
