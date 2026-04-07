import { Pokemon } from '../types/pokemon.types'
import { PokemonCard } from './PokemonCard'
import { PokemonSkeleton } from './PokemonSkeleton'

interface Props {
  pokemon: Pokemon[]
  isLoading: boolean
  onSelect: (pokemon: Pokemon) => void
  similarFinds?: { pokemon: Pokemon; generationLabel: string }[]
  currentGen?: string
  similarNames?: string[]
  searchQuery?: string
}

export function PokemonGrid({
  pokemon,
  isLoading,
  onSelect,
  similarFinds = [],
  currentGen,
  similarNames = [],
  searchQuery = '',
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

  // Show "not found" message when searching but no results in current gen
  if (!isLoading && pokemon.length === 0 && similarFinds.length > 0) {
    return (
      <div className="mt-8 space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            This Pokémon isn't in {currentGen}.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-zinc-900">Similar Finds</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarFinds.map(({ pokemon: p, generationLabel }) => (
              <div key={p.id} className="space-y-2">
                <PokemonCard
                  pokemon={p}
                  onClick={onSelect}
                />
                <p className="text-xs text-center text-zinc-500">
                  {generationLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show "not found anywhere" message when searching but no matches exist
  if (!isLoading && pokemon.length === 0) {
    return (
      <div className="mt-8 space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            No Pokémon found matching "{searchQuery}".
          </p>
        </div>

        {similarNames.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Did you mean:
            </p>
            <ul className="space-y-1">
              {similarNames.map(name => (
                <li key={name} className="text-sm text-blue-800 capitalize">
                  • {name.replace('-', ' ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
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

      {isLoading && pokemon.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 animate-pulse" />
          Loading more Pokémon...
        </div>
      )}

      {/* Similar Finds Section */}
      {similarFinds.length > 0 && pokemon.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              We also found similar Pokémon in other generations:
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarFinds.map(({ pokemon: p, generationLabel }) => (
              <div key={p.id} className="space-y-2">
                <PokemonCard
                  pokemon={p}
                  onClick={onSelect}
                />
                <p className="text-xs text-center text-zinc-500">
                  {generationLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
