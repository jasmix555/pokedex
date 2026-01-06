import { getTypeIcon } from '../utils/typeIcon'
import { Pokemon } from '../types/pokemon.types'

interface Props {
  pokemon: Pokemon
}

export function PokemonCard({ pokemon }: Props) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <img
        src={pokemon.image}
        alt={pokemon.name}
        loading="lazy"
        className="w-full aspect-square object-contain"
      />

      <h3 className="capitalize font-medium">
        {pokemon.name}
      </h3>

      <div className="flex gap-2 items-center justify-center">
        {pokemon.types.map(type => (
          <img
            key={type}
            src={getTypeIcon(type)}
            alt={type}
            title={type}
            className="h-8 w-8"
          />
        ))}
      </div>
    </div>
  )
}
