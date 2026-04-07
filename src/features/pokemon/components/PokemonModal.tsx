import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
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
  onOpenEvolution: (pokemon: Pokemon) => void
}

export function PokemonModal({ pokemon, onClose, onOpenEvolution }: Props) {
  const [evolutions, setEvolutions] = useState<EvolutionNode[]>([])
  const [isLoadingEvo, setIsLoadingEvo] = useState(false)
  const [isOpeningEvolution, setIsOpeningEvolution] = useState(false)

  useEffect(() => {
    if (!pokemon) return

    let cancelled = false

    async function loadEvolution() {
      try {
        setIsLoadingEvo(true)
        const chain = await fetchPokemonEvolutionChain(pokemon!.id)
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

  async function handleEvolutionClick(evo: EvolutionNode) {
    if (!pokemon || evo.id === pokemon.id) return

    try {
      setIsOpeningEvolution(true)
      const apiPokemon = await fetchPokemonByName(String(evo.id))
      onOpenEvolution(mapPokemon(apiPokemon))
    } catch (error) {
      console.error('Failed to open evolution:', error)
    } finally {
      setIsOpeningEvolution(false)
    }
  }

  if (!pokemon) return null

  const primaryType = pokemon.types[0]
  const primaryColor = getTypeColor(primaryType)

  return (
    <Dialog open={!!pokemon} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className={`bg-white text-gray-900 border-0 shadow-xl rounded-xl overflow-hidden`}>
        <div className={`${primaryColor.bg} px-6 py-5 flex items-start justify-between`}>
          <div>
            <h2 className="capitalize text-2xl font-bold text-gray-900">
              {pokemon.name}
            </h2>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              #{String(pokemon.id).padStart(3, '0')}
            </p>
          </div>
          <DialogClose className="text-gray-900 hover:bg-black/10 rounded p-1 opacity-70 hover:opacity-100 transition-opacity">
            <XIcon className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <p className="text-center text-sm text-zinc-600">
            View details, stats, and the evolution path for this Pokémon.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Image and Types */}
            <div className="col-span-1 space-y-4">
              <div className="flex justify-center">
                <PokemonImage
                  src={pokemon.sprite ?? pokemon.image}
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

            {/* Stats */}
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

          {/* Evolution Section */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h4 className="text-sm font-bold">
                Evolution
              </h4>
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
                {evolutions.map(evo => (
                  <button
                    key={evo.id}
                    type="button"
                    onClick={() => handleEvolutionClick(evo)}
                    disabled={evo.id === pokemon.id || isOpeningEvolution}
                    className={`group flex flex-col items-center border-2 rounded-lg p-2 text-center transition ${
                      evo.id === pokemon.id
                        ? `${primaryColor.border} ${primaryColor.bg}`
                        : 'border-gray-300 hover:border-blue-500 hover:shadow-md'
                    } disabled:border-zinc-200 disabled:cursor-default disabled:opacity-50`}
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                      className="h-14 w-14"
                      alt={evo.name}
                    />
                    <span className="mt-2 text-xs font-bold capitalize text-zinc-900">
                      {evo.name}
                    </span>
                    <span className="mt-1 text-[9px] text-zinc-600 text-center leading-tight">
                      {evo.details}
                    </span>
                    {evo.id === pokemon.id && (
                      <span className="mt-2 rounded-full bg-green-500 text-white px-2 py-0.5 text-[9px] font-bold">
                        Current
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {isOpeningEvolution && (
              <p className="text-xs text-gray-500">Opening selected Pokémon...</p>
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
