import { Pokemon } from '../types/pokemon.types'
import { getTypeIcon } from '../utils/typeIcon'

interface Props {
  pokemon: Pokemon
  onClick: (pokemon: Pokemon) => void
}

export function PokemonCard({ pokemon, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(pokemon)}
      className="
        w-full
        text-left
        rounded-lg
        border
        border-zinc-100
        bg-zinc-100
        p-3
        space-y-2
        hover:shadow-md
        transition
      "
    >
      <img
        src={pokemon.image}
        alt={pokemon.name}
        loading="lazy"
        className="w-full aspect-square object-contain"
      />

      <div className="flex items-baseline gap-2">
        <span className="text-sm text-zinc-400">
          #{pokemon.id}
        </span>
        <h3 className="text-base font-semibold capitalize text-zinc-800">
          {pokemon.name}
        </h3>
      </div>

      <div className="flex gap-2">
        {pokemon.types.map(type => (
          <img
            key={type}
            src={getTypeIcon(type)}
            alt={type}
            className="h-5 w-5"
          />
        ))}
      </div>
    </button>
  )
}
