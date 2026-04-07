import { useState, KeyboardEvent } from 'react'
import { Pokemon } from '../types/pokemon.types'
import { getTypeIcon } from '../utils/typeIcon'
import { getTypeColor } from '../utils/typeColor'
import { PokemonImage } from './PokemonImage'

interface Props {
  pokemon: Pokemon
  onClick: (pokemon: Pokemon) => void
}

export function PokemonCard({ pokemon, onClick }: Props) {
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const primaryType = pokemon.types[0]
  const primaryColor = getTypeColor(primaryType)
  const hasFemaleSprite = Boolean(pokemon.femaleSprite)
  const spriteUrl =
    gender === 'female'
      ? pokemon.femaleSprite ?? pokemon.sprite ?? pokemon.image
      : pokemon.sprite ?? pokemon.image

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(pokemon)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(pokemon)}
      onKeyDown={handleKeyDown}
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
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500
      `}
    >
      <div className={`${primaryColor.bg} px-4 py-3`}>
        <span className="text-xs font-bold text-gray-700">
          #{String(pokemon.id).padStart(3, '0')}
        </span>
        <h3 className="text-lg font-bold capitalize text-gray-900 mt-1">
          {pokemon.name}
        </h3>
      </div>

      <div className="flex flex-col p-4 space-y-3 flex-1">
        <PokemonImage
          src={spriteUrl}
          alt={pokemon.name}
          className="w-full aspect-square"
        />

        {hasFemaleSprite && (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                setGender('male')
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${gender === 'male'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              ♂ Male
            </button>
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                setGender('female')
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${gender === 'female'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              ♀ Female
            </button>
          </div>
        )}

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
    </div>
  )
}
