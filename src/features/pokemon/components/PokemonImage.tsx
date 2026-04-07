import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface PokemonImageProps {
  src: string
  alt: string
  className?: string
}

export function PokemonImage({ src, alt, className }: PokemonImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`block relative overflow-hidden rounded-xl bg-zinc-50 ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />

      {!loaded && (
        <Skeleton className="absolute inset-0 h-full w-full bg-zinc-100 rounded-none" />
      )}
    </div>
  )
}
