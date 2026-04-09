import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { XIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

import { Pokemon } from '../types/pokemon.types'
import { getTypeColor } from '../utils/typeColor'
import { fetchPokemonEvolutionChain } from '../api/pokemonEvolution.api'
import { fetchPokemonByName } from '../api/pokemon.api'
import { mapPokemon } from '../utils/mapPokemon'
import { PokemonImage } from './PokemonImage'
import { ShinyButton } from './ShinyButton'
import { GenderButton } from './GenderButton'
import { TypeBadge } from './TypeBadge'

interface EvolutionNode {
  id: number
  name: string
  details: string
}

interface AltFormNode {
  id: number
  name: string
}

interface Props {
  pokemon: Pokemon | null
  onClose: () => void
  onOpenEvolution: (pokemon: Pokemon, gender: 'male' | 'female') => void
  initialGender?: 'male' | 'female'
  onGenderChange?: (pokemonId: number, gender: 'male' | 'female') => void
  initialShiny?: boolean
  onShinyChange?: (pokemonId: number, shiny: boolean) => void
}

export function PokemonModal({
  pokemon,
  onClose,
  onOpenEvolution,
  initialGender = 'male',
  onGenderChange,
  initialShiny = false,
  onShinyChange,
}: Props) {
  const [evolutions, setEvolutions] = useState<EvolutionNode[]>([])
  const [isLoadingEvo, setIsLoadingEvo] = useState(false)
  const [isOpeningEvolution, setIsOpeningEvolution] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>(initialGender)
  const [shiny, setShiny] = useState(initialShiny)
  const [altForms, setAltForms] = useState<AltFormNode[]>([])
  const [isLoadingAltForms, setIsLoadingAltForms] = useState(false)

  useEffect(() => {
    setGender(initialGender)
    setShiny(initialShiny)
  }, [pokemon, initialGender, initialShiny])

  useEffect(() => {
    if (!pokemon) return
    let cancelled = false

    async function loadEvolution() {
      try {
        setIsLoadingEvo(true)
        setEvolutions([])
        const chain = await fetchPokemonEvolutionChain(pokemon!.name)
        if (!cancelled) setEvolutions(chain)
      } catch (err) {
        console.error('Failed to load evolution chain', err)
      } finally {
        if (!cancelled) setIsLoadingEvo(false)
      }
    }

    loadEvolution()
    return () => { cancelled = true }
  }, [pokemon])

  useEffect(() => {
    if (!pokemon) return
    let cancelled = false
    const speciesKey = pokemon.name.split('-')[0]

    async function loadAltForms() {
      try {
        setIsLoadingAltForms(true)
        setAltForms([])
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesKey}`)
        if (!res.ok) return
        const data = await res.json()
        const forms = data.varieties.map((v: any) => {
          const url: string = v.pokemon.url
          const id = Number(url.split('/').filter(Boolean).pop())
          return { id, name: v.pokemon.name }
        })
        if (!cancelled) setAltForms(forms)
      } catch (err) {
        console.error('Failed to load alt forms', err)
      } finally {
        if (!cancelled) setIsLoadingAltForms(false)
      }
    }

    loadAltForms()
    return () => { cancelled = true }
  }, [pokemon])

  function getEvolutionSpriteUrl(evoId: number) {
    const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
    if (gender === 'female') {
      return shiny ? `${base}/shiny/female/${evoId}.png` : `${base}/female/${evoId}.png`
    }
    return shiny ? `${base}/shiny/${evoId}.png` : `${base}/${evoId}.png`
  }

  async function handleEvolutionClick(evo: EvolutionNode) {
    if (!pokemon || evo.id === pokemon.id) return
    try {
      setIsOpeningEvolution(true)
      const apiPokemon = await fetchPokemonByName(String(evo.id))
      onOpenEvolution(mapPokemon(apiPokemon), gender)
    } catch (error) {
      console.error('Failed to open evolution:', error)
    } finally {
      setIsOpeningEvolution(false)
    }
  }

  if (!pokemon) return null

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

  const evoTheme = shiny
    ? 'ring-2 ring-yellow-400/60 bg-yellow-50/60'
    : gender === 'female'
      ? 'ring-2 ring-pink-400/50 bg-pink-50/60'
      : 'ring-2 ring-blue-400/50 bg-blue-50/60'

  return (
    <Dialog open={!!pokemon} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="bg-white text-gray-900 border-0 shadow-xl rounded-xl overflow-hidden max-w-[95vw] sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">{pokemon.name} Details</DialogTitle>
        <DialogDescription className="sr-only">
          View details, stats, and the evolution path for this Pokémon.
        </DialogDescription>

        {/* Header */}
        <div className={`${primaryColor.bg} px-3 py-2 sm:px-5 flex items-center justify-between gap-2`}>
          <div className="flex-1 flex items-center justify-between gap-2 mr-2">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                #{String(pokemon.id).padStart(3, '0')}
              </p>
              <h2 className="capitalize text-2xl font-bold text-gray-900 leading-tight">
                {pokemon.name}
              </h2>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {hasShiny && (
                <ShinyButton
                  shiny={shiny}
                  onShinyChange={newShiny => {
                    setShiny(newShiny)
                    onShinyChange?.(pokemon.id, newShiny)
                  }}
                />
              )}
              {hasFemaleSprite && (
                <GenderButton
                  gender={gender}
                  onGenderChange={newGender => {
                    setGender(newGender)
                    onGenderChange?.(pokemon.id, newGender)
                  }}
                />
              )}
            </div>
          </div>

          <DialogClose className="text-gray-900 bg-white rounded p-1 hover:opacity-80 transition-opacity shrink-0">
            <XIcon className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="p-1 space-y-2 md:px-6 md:pb-6 md:space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

            {/* Image + types */}
            <div className="col-span-1 space-y-4 flex flex-col items-center justify-end">
              <div className="flex justify-center">
                <PokemonImage
                  src={spriteUrl}
                  alt={pokemon.name}
                  className="h-40 bg-zinc-800/10 rounded-xl object-contain"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {pokemon.types.map(type => (
                  <TypeBadge key={type} type={type} allTypes={pokemon.types} />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="col-span-1 lg:col-span-2 space-y-2">
              {pokemon.stats.map(stat => {
                const statColor =
                  stat.value >= 100 ? 'bg-green-500'
                  : stat.value >= 75 ? 'bg-blue-500'
                  : stat.value >= 50 ? 'bg-yellow-500'
                  : 'bg-red-500'
                return (
                  <div key={stat.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize font-semibold text-gray-700">
                        {stat.name.replace('-', ' ')}
                      </span>
                      <span className="font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statColor} rounded-full transition-all`}
                        style={{ width: `${Math.min((stat.value / 255) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Evolution */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-bold">Evolution</h4>
              {isLoadingEvo && (
                <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-blue-500" />
                  Loading...
                </span>
              )}
            </div>

            {isLoadingEvo && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            )}

            {!isLoadingEvo && evolutions.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evolutions.map(evo => {
                  const isCurrent = evo.id === pokemon.id
                  return (
                    <button
                      key={evo.id}
                      type="button"
                      onClick={() => handleEvolutionClick(evo)}
                      disabled={isCurrent || isOpeningEvolution}
                      className={`group flex flex-col items-center border-2 rounded-lg p-2 text-center transition
                        ${!isCurrent ? evoTheme : ''}
                        ${isCurrent
                          ? `${primaryColor.border} ${primaryColor.bg}`
                          : 'border-gray-300 hover:border-blue-500 hover:shadow-md'
                        }
                        disabled:border-zinc-200 disabled:cursor-default disabled:opacity-50
                      `}
                    >
                      <PokemonImage
                        src={getEvolutionSpriteUrl(evo.id)}
                        alt={evo.name}
                        className="h-14 w-14"
                      />
                      <span className="mt-2 text-xs font-bold capitalize text-zinc-900">{evo.name}</span>
                      <span className="mt-1 text-[9px] text-zinc-600 text-center leading-tight">{evo.details}</span>
                      {isCurrent && (
                        <span className="mt-2 rounded-full bg-green-500 text-white px-2 py-0.5 text-[9px] font-bold">
                          Current
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {isOpeningEvolution && (
              <p className="text-xs text-gray-500">Opening selected Pokémon...</p>
            )}

            {!isLoadingEvo && evolutions.length <= 1 && (
              <p className="text-xs text-gray-500">This Pokémon does not evolve.</p>
            )}
          </div>

          {/* Alt Forms */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-bold">Alt Forms</h4>
              {isLoadingAltForms && (
                <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-blue-500" />
                  Loading...
                </span>
              )}
            </div>

            {!isLoadingAltForms && altForms.length <= 1 && (
              <p className="text-xs text-gray-500">No alternate forms.</p>
            )}

            {!isLoadingAltForms && altForms.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {altForms.map(form => {
                  const isCurrent = form.id === pokemon.id
                  return (
                    <button
                      key={form.id}
                      type="button"
                      disabled={isCurrent || isOpeningEvolution}
                      onClick={async () => {
                        try {
                          setIsOpeningEvolution(true)
                          const apiPokemon = await fetchPokemonByName(form.name)
                          const mapped = mapPokemon(apiPokemon)
                          onShinyChange?.(mapped.id, shiny)
                          onGenderChange?.(mapped.id, gender)
                          onOpenEvolution(mapped, gender)
                        } finally {
                          setIsOpeningEvolution(false)
                        }
                      }}
                      className={`group flex flex-col items-center border-2 rounded-lg p-2 text-center transition
                        ${isCurrent
                          ? `${primaryColor.border} ${primaryColor.bg}`
                          : 'border-gray-300 hover:border-blue-500 hover:shadow-md'
                        }
                      `}
                    >
                      <PokemonImage
                        src={getEvolutionSpriteUrl(form.id)}
                        alt={form.name}
                        className="h-14 w-14"
                      />
                      <span className="mt-2 text-xs font-bold capitalize text-zinc-900">{form.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}