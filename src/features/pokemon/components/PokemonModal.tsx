import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

import { Pokemon } from '../types/pokemon.types'
import { getTypeIcon } from '../utils/typeIcon'
import { fetchPokemonEvolutionChain } from '../api/pokemonEvolution.api'

interface EvolutionNode {
  id: number
  name: string
}

interface Props {
  pokemon: Pokemon | null
  onClose: () => void
}

export function PokemonModal({ pokemon, onClose }: Props) {
  const [evolutions, setEvolutions] = useState<EvolutionNode[]>([])
  const [isLoadingEvo, setIsLoadingEvo] = useState(false)

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

  if (!pokemon) return null

  return (
    <Dialog open={!!pokemon} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white text-gray-900 border shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="capitalize text-lg font-semibold">
            {pokemon.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="h-48 object-contain"
          />
        </div>

        <div className="flex gap-2 justify-center">
          {pokemon.types.map(type => (
            <div
              key={type}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"
            >
              <img src={getTypeIcon(type)} className="h-4 w-4" />
              <span className="text-xs capitalize">{type}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3 mt-4">
          {pokemon.stats.map(stat => (
            <div key={stat.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize text-gray-600">
                  {stat.name.replace('-', ' ')}
                </span>
                <span className="font-medium">
                  {stat.value}
                </span>
              </div>

              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-full bg-blue-500 rounded"
                  style={{
                    width: `${Math.min(
                      (stat.value / 255) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold">
            Evolution
          </h4>

          {isLoadingEvo && (
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <Skeleton className="h-20 w-20 rounded-lg" />
            </div>
          )}

          {!isLoadingEvo && evolutions.length > 1 && (
            <div className="flex gap-4 overflow-x-auto">
              {evolutions.map(evo => (
                <div
                  key={evo.id}
                  className="flex flex-col items-center border rounded-lg p-2 min-w-[80px]"
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                    className="h-16 w-16"
                  />
                  <span className="text-xs capitalize">
                    {evo.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!isLoadingEvo && evolutions.length <= 1 && (
            <p className="text-xs text-gray-500">
              This Pokémon does not evolve.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
