import { useState } from 'react'
import { Pokemon } from '../types/pokemon.types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface PokemonCardProps {
  pokemon: Pokemon
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col items-center gap-2">
        <div className="relative h-24 w-24">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 rounded-full" />
          )}

          <img
            src={pokemon.image}
            alt={pokemon.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`h-24 w-24 object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <h3 className="capitalize font-semibold">
          {pokemon.name}
        </h3>

        <div className="flex gap-2">
          {pokemon.types.map(type => (
            <span
              key={type}
              className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize"
            >
              {type}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
