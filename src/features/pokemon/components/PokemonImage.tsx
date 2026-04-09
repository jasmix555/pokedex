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
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setIndex(0)
    setLoaded(false)
    setFailed(false)
  }, [src, pokemonId])

  const currentSrc = fallbackList[index]
  const noSprite = !currentSrc || failed

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {!noSprite && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          loading="eager"
          decoding="async"
          draggable={false}
          className={`h-full w-full object-contain transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (index < fallbackList.length - 1) {
              setLoaded(false)
              setIndex(prev => prev + 1)
            } else {
              setFailed(true)
            }
          }}
        />
      )}

      {!loaded && !noSprite && (
        <Skeleton className="absolute inset-0 h-full w-full bg-zinc-100 rounded-none" />
      )}

      {noSprite && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-2 relative flex items-center justify-center rounded-full bg-zinc-300 shadow-inner"
            style={{ width: '100%', aspectRatio: '1' }}
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-6 border-zinc-400" />
            {/* Inner darker circle */}
            <div className="absolute rounded-full bg-zinc-400"
              style={{ width: '60%', height: '60%' }}
            />
            {/* Question mark */}
            <span className="relative z-10 font-black text-zinc-200 select-none"
              style={{ fontSize: 'clamp(14px, 4cqi, 28px)' }}
            >
              ?
            </span>
          </div>
        </div>
      )}
    </div>
  )
}