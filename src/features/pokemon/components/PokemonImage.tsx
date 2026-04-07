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
    <div className={`relative overflow-hidden rounded-xl ${className} border-2 border-zinc-100`}>
      {/* <div className="absolute left-1/2 bottom-4 h-10 w-20 -translate-x-1/2 rounded-full bg-black/10" /> */}
      <img
        src={src}
        alt={alt}
        className={`relative h-full w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />

      {!loaded && (
        <Skeleton className="absolute inset-0 h-full w-full bg-zinc-100 rounded-none" />
      )}
    </div>
  )
}
