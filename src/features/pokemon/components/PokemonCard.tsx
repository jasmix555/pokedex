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
      className={`group/card w-full flex flex-col overflow-hidden rounded-2xl border-2 bg-white ${primaryColor.border} shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      {/* Header bar */}
      <div className={`${primaryColor.bg} flex items-center justify-between gap-2 px-3 py-2`}>
        <span className={`rounded-full bg-black/15 px-2 py-0.5 text-[11px] font-bold tabular-nums ${primaryColor.text}`}>
          #{String(pokemon.id).padStart(4, '0')}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {hasShiny && <ShinyButton shiny={shiny} onShinyChange={onShinyChange} />}
          {hasFemaleSprite && <GenderButton gender={gender} onGenderChange={onGenderChange} />}
        </div>
      </div>

      {/* Sprite "viewer" — clickable */}
      <button
        type="button"
        onClick={() => onClick(pokemon, gender)}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick(pokemon, gender)
          }
        }}
        aria-label={`View ${pokemon.name}`}
        className="relative w-full aspect-square cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${primaryColor.hex}26 0%, ${primaryColor.hex}0d 55%, transparent 75%)`,
        }}
      >
        {/* Faint Poke Ball watermark */}
        <img
          src="/pokeball.png"
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute left-1/2 top-1/2 w-3/4 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        />

        <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
          <PokemonImage
            src={spriteUrl}
            alt={pokemon.name}
            className="h-full w-full object-contain transition duration-200 group-hover/card:scale-105"
            pokemonId={pokemon.id}
          />
        </div>
      </button>

      {/* Footer: name + types */}
      <div className="flex flex-1 flex-col gap-2 border-t border-zinc-100 px-3 py-3">
        <h3 className="text-base font-extrabold capitalize leading-tight text-zinc-800">
          {pokemon.name.replace('-', ' ')}
        </h3>

        <div className="flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
          {pokemon.types.map(type => (
            <TypeBadge key={type} type={type} allTypes={pokemon.types} />
          ))}
        </div>
      </div>
    </div>
  )
}
