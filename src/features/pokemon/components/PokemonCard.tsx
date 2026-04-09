import { KeyboardEvent } from 'react'
import { Pokemon } from '../types/pokemon.types'
import { getTypeColor } from '../utils/typeColor'
import { PokemonImage } from './PokemonImage'
import { ShinyButton } from './ShinyButton'
import { GenderButton } from './GenderButton'
import { TypeBadge } from './TypeBadge'

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

  return (
    <div
      className={`
        w-full flex flex-col text-left rounded-lg border-2
        ${primaryColor.border} bg-white shadow-sm
        transition
      `}
    >
      {/* Header — not clickable for modal */}
      <div className={`${primaryColor.bg} px-4 py-3`}>
        <span className={`text-xs font-semibold ${primaryColor.text}`}>
          #{String(pokemon.id).padStart(3, '0')}
        </span>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-1 gap-2">
          <h3 className={`text-lg font-bold capitalize leading-tight ${primaryColor.text}`}>
            {pokemon.name}
          </h3>

          <div className="flex items-center gap-1 shrink-0">
            {hasShiny && (
              <ShinyButton shiny={shiny} onShinyChange={onShinyChange} />
            )}
            {hasFemaleSprite && (
              <GenderButton gender={gender} onGenderChange={onGenderChange} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col p-4 space-y-3 flex-1">
        {/* Image — clickable, hoverable */}
        <button
          type="button"
          onClick={() => onClick(pokemon, gender)}
          onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClick(pokemon, gender)
            }
          }}
          className={`
            w-full aspect-square flex items-center justify-center
            rounded-xl cursor-pointer
            transition duration-200
            hover:scale-102 hover:shadow-md
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            group
          `}
        >
          <PokemonImage
            src={spriteUrl}
            alt={pokemon.name}
            className="w-full h-full object-contain bg-zinc-800/10 rounded-xl"
            pokemonId={pokemon.id}
          />
        </button>

        {/* Types — stop propagation so badge popover doesn't trigger anything */}
        <div
          className="flex flex-wrap gap-2"
          onClick={e => e.stopPropagation()}
        >
          {pokemon.types.map(type => (
            <TypeBadge key={type} type={type} allTypes={pokemon.types} />
          ))}
        </div>
      </div>
    </div>
  )
}