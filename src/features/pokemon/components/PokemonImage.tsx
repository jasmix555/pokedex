import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface PokemonImageProps {
  src?: string | null
  alt: string
  className?: string
  pokemonId?: number
}

export function PokemonImage({ src, alt, className, pokemonId }: PokemonImageProps) {
  const fallbackList = [
    src,
    pokemonId
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
      : null,
  ].filter(Boolean) as string[]

  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setIndex(0)
    setLoaded(false)
  }, [src, pokemonId])

  const currentSrc = fallbackList[index]

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          className={`h-full w-full object-contain transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (index < fallbackList.length - 1) {
              setLoaded(false)
              setIndex(prev => prev + 1)
            }
          }}
          loading="lazy"
          draggable={false}
        />
      ) : null}

      {!loaded && currentSrc && (
        <Skeleton className="absolute inset-0 h-full w-full bg-zinc-100 rounded-none" />
      )}

      {!currentSrc && (
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-zinc-400">
          ?
        </div>
      )}
    </div>
  )
}