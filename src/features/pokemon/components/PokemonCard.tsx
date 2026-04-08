import { KeyboardEvent } from 'react'
import { Pokemon } from '../types/pokemon.types'
import { getTypeIcon } from '../utils/typeIcon'
import { getTypeColor } from '../utils/typeColor'
import { PokemonImage } from './PokemonImage'

interface Props {
  pokemon: Pokemon
  onClick: (pokemon: Pokemon, gender: 'male' | 'female') => void
  gender: 'male' | 'female'
  onGenderChange: (gender: 'male' | 'female') => void
  shiny: boolean
  onShinyChange: (shiny: boolean) => void
}

export function PokemonCard({ pokemon, onClick, gender, onGenderChange, shiny, onShinyChange }: Props) {
  const primaryType = pokemon.types[0]
  const primaryColor = getTypeColor(primaryType)
  const hasFemaleSprite = Boolean(pokemon.femaleSprite)
  const hasShiny = Boolean(pokemon.shinySprite)

  const spriteUrl = (() => {
    if (shiny) {
      return gender === 'female'
        ? pokemon.shinyFemaleSprite ?? pokemon.shinySprite ?? pokemon.sprite ?? pokemon.image
        : pokemon.shinySprite ?? pokemon.sprite ?? pokemon.image
    }
    return gender === 'female'
      ? pokemon.femaleSprite ?? pokemon.sprite ?? pokemon.image
      : pokemon.sprite ?? pokemon.image
  })()

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(pokemon, gender)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(pokemon, gender)}
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
        <span className={`text-xs font-semibold ${primaryColor.text}`}>
          #{String(pokemon.id).padStart(3, '0')}
        </span>
        <div className="flex items-center justify-between mt-1">
          <h3 className={`text-lg font-bold capitalize ${primaryColor.text}`}>
            {pokemon.name}
          </h3>

          <div className="flex items-center gap-1">
            {hasShiny && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onShinyChange(!shiny)
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition border-2 ${
                  shiny
                    ? 'bg-yellow-400 border-yellow-500 shadow-md'
                    : 'bg-white/60 border-gray-300'
                }`}
                title={shiny ? 'Shiny on' : 'Shiny off'}
              >
                ✨
              </button>
            )}

            {hasFemaleSprite && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onGenderChange(gender === 'male' ? 'female' : 'male')
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition border-2 ${
                  gender === 'male'
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                    : 'bg-pink-500 text-white border-pink-600 shadow-md'
                }`}
                title={`Switch to ${gender === 'male' ? 'female' : 'male'}`}
              >
                {gender === 'male' ? '♂' : '♀'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col p-4 space-y-3 flex-1">
        <PokemonImage
          src={spriteUrl}
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
    </div>
  )
}