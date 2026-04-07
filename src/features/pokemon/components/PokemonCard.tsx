import { Pokemon } from '../types/pokemon.types'
import { getTypeIcon } from '../utils/typeIcon'
import { getTypeColor } from '../utils/typeColor'
import { PokemonImage } from './PokemonImage'

interface Props {
  pokemon: Pokemon
  onClick: (pokemon: Pokemon) => void
}

export function PokemonCard({ pokemon, onClick }: Props) {
  const primaryType = pokemon.types[0]
  const primaryColor = getTypeColor(primaryType)

  return (
    <button
      onClick={() => onClick(pokemon)}
      className={`
        w-full
        flex flex-col
        text-left
        rounded-lg
        border-2
        ${primaryColor.border}
        bg-white
        overflow-hidden
        hover:shadow-lg
        transition
        hover:scale-105
      `}
    >
      <div className={`${primaryColor.bg} px-4 py-3 rounded-md`}>
        <span className="text-xs font-bold text-gray-700">
          #{String(pokemon.id).padStart(3, '0')}
        </span>
        <h3 className="text-lg font-bold capitalize text-gray-900 mt-1">
          {pokemon.name}
        </h3>
      </div>

      <div className="flex flex-col p-4 space-y-3 flex-1">
        <PokemonImage
          src={pokemon.sprite ?? pokemon.image}
          alt={pokemon.name}
          className="w-full aspect-square"
        />

        <div className="flex flex-wrap gap-2">
          {pokemon.types.map(type => {
            const color = getTypeColor(type)
            return (
              <span
                key={type}
                className={`
                  inline-flex items-center gap-1 
                  ${color.bg}
                  ${color.text}
                  px-2.5 py-1 rounded-full text-xs font-semibold
                `}
              >
                <img src={getTypeIcon(type)} alt={type} className="h-3.5 w-3.5" />
                {type}
              </span>
            )
          })}
        </div>
      </div>
    </button>
  )
}
