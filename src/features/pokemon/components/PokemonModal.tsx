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
import { getTypeIcon } from '../utils/typeIcon'
import { getTypeColor } from '../utils/typeColor'
import { fetchPokemonEvolutionChain } from '../api/pokemonEvolution.api'
import { fetchPokemonByName } from '../api/pokemon.api'
import { mapPokemon } from '../utils/mapPokemon'
import { PokemonImage } from './PokemonImage'

interface EvolutionNode {
  id: number
  name: string
  details: string
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

  // modal-only state
  const [gender, setGender] = useState<'male' | 'female'>(initialGender)
  const [shiny, setShiny] = useState(initialShiny)

  useEffect(() => {
    setGender(initialGender)
    setShiny(initialShiny)
  }, [pokemon, initialGender, initialShiny])

  useEffect(() => {
    if (!pokemon) return
    let cancelled = false

    const pokemonId = pokemon.id

    async function loadEvolution() {
      try {
        setIsLoadingEvo(true)
        const chain = await fetchPokemonEvolutionChain(pokemonId)
        if (!cancelled) setEvolutions(chain)
      } finally {
        if (!cancelled) setIsLoadingEvo(false)
      }
    }

    loadEvolution()

    return () => {
      cancelled = true
    }
  }, [pokemon])

  function getEvolutionSpriteUrl(evoId: number) {
    const base =
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

    // female sprites are often missing, so fallback to male/default paths
    if (gender === 'female') {
      if (shiny) return `${base}/shiny/female/${evoId}.png`
      return `${base}/female/${evoId}.png`
    }

    if (shiny) return `${base}/shiny/${evoId}.png`
    return `${base}/${evoId}.png`
  }

  async function handleEvolutionClick(evo: EvolutionNode) {
    if (!pokemon || evo.id === pokemon.id) return

    try {
      setIsOpeningEvolution(true)
      const apiPokemon = await fetchPokemonByName(String(evo.id))

      // IMPORTANT:
      // evolution opening inherits the modal's gender state
      // but shiny is NOT passed (you handle shiny locally per Pokémon anyway)
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
        ? pokemon.shinyFemaleSprite ??
        pokemon.shinySprite ??
        pokemon.sprite ??
        pokemon.image
        : pokemon.shinySprite ?? pokemon.sprite ?? pokemon.image
    }

    return gender === 'female'
      ? pokemon.femaleSprite ?? pokemon.sprite ?? pokemon.image
      : pokemon.sprite ?? pokemon.image
  })()

  const evoTheme =
    shiny
      ? 'ring-2 ring-yellow-400/60 bg-yellow-50/60'
      : gender === 'female'
        ? 'ring-2 ring-pink-400/50 bg-pink-50/60'
        : 'ring-2 ring-blue-400/50 bg-blue-50/60'

  return (
    <Dialog open={!!pokemon} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="bg-white text-gray-900 border-0 shadow-xl rounded-xl overflow-hidden"
      >
        <DialogTitle className="sr-only">{pokemon.name} Details</DialogTitle>
        <DialogDescription className="sr-only">
          View details, stats, and the evolution path for this Pokémon.
        </DialogDescription>

        <div
          className={`${primaryColor.bg} px-5 py-2 flex items-start justify-between`}
        >
          <div className="flex-1">
            <div className="flex items-end justify-between mr-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  #{String(pokemon.id).padStart(3, '0')}
                </p>
                <h2 className="capitalize text-2xl font-bold text-gray-900">
                  {pokemon.name}
                </h2>
              </div>

              <div className="flex items-center gap-1 mb-1">
                {hasShiny && (
                  <button
                    type="button"
                    onClick={() => {
                      const newShiny = !shiny
                      setShiny(newShiny)

                      // keep your page-level persistence behavior
                      if (onShinyChange) onShinyChange(pokemon.id, newShiny)
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition border-2 ${shiny
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
                    onClick={() => {
                      const newGender = gender === 'male' ? 'female' : 'male'
                      setGender(newGender)

                      // keep your page-level persistence behavior
                      if (onGenderChange) onGenderChange(pokemon.id, newGender)
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition border-2 ${gender === 'male'
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

          <DialogClose className="text-gray-900 bg-white rounded p-1 hover:opacity-80 transition-opacity my-auto">
            <XIcon className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="px-6 pb-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <p className="text-center text-sm text-zinc-600">
            View details, stats, and the evolution path for this Pokémon.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
              <div className="flex justify-center">
                <PokemonImage
                  src={spriteUrl}
                  alt={pokemon.name}
                  className="h-32 w-32 sm:h-40 sm:w-40"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {pokemon.types.map(type => {
                  const color = getTypeColor(type)
                  return (
                    <div
                      key={type}
                      className={`flex items-center gap-1.5 rounded-full ${color.bg} ${color.text} px-3 py-1 text-xs font-semibold`}
                    >
                      <img src={getTypeIcon(type)} className="h-4 w-4" />
                      <span className="capitalize">{type}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Stats</h4>
              <div className="space-y-2">
                {pokemon.stats.map(stat => {
                  const statColor =
                    stat.value >= 100
                      ? 'bg-green-500'
                      : stat.value >= 75
                        ? 'bg-blue-500'
                        : stat.value >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'

                  return (
                    <div key={stat.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize font-semibold text-gray-700">
                          {stat.name.replace('-', ' ')}
                        </span>
                        <span className="font-bold text-gray-900">
                          {stat.value}
                        </span>
                      </div>

                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statColor} rounded-full transition-all`}
                          style={{
                            width: `${Math.min(
                              (stat.value / 255) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h4 className="text-sm font-bold">Evolution</h4>

              {isLoadingEvo && (
                <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-blue-500" />
                  Loading...
                </span>
              )}
            </div>

            {isLoadingEvo && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      <img
                        src={getEvolutionSpriteUrl(evo.id)}
                        onError={(e) => {
                          const target = e.currentTarget
                          target.onerror = null

                          // fallback priority:
                          // female shiny -> shiny -> normal
                          if (shiny) {
                            target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${evo.id}.png`
                          } else {
                            target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`
                          }
                        }}
                        className="h-14 w-14"
                        alt={evo.name}
                      />

                      <span className="mt-2 text-xs font-bold capitalize text-zinc-900">
                        {evo.name}
                      </span>

                      <span className="mt-1 text-[9px] text-zinc-600 text-center leading-tight">
                        {evo.details}
                      </span>

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
              <p className="text-xs text-gray-500">
                Opening selected Pokémon...
              </p>
            )}

            {!isLoadingEvo && evolutions.length <= 1 && (
              <p className="text-xs text-gray-500">
                This Pokémon does not evolve.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}