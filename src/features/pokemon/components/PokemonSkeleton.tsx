import { Skeleton } from '@/components/ui/skeleton'

interface PokemonSkeletonProps {
  count?: number
}

export function PokemonSkeleton({ count = 8 }: PokemonSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="
            w-full
            rounded-lg
            border
            border-zinc-100
            bg-zinc-100
            p-3
            space-y-2
            shadow-sm
          "
        >
          {/* Image */}
          <div className="w-full aspect-square overflow-hidden rounded-lg bg-zinc-50">
            <Skeleton className="h-full w-full rounded-2xl bg-zinc-100 shadow-inner" />
          </div>

          {/* ID + name */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-10 bg-zinc-100" />
            <Skeleton className="h-4 w-24 bg-zinc-100" />
          </div>

          {/* Types */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-zinc-100 shadow" />
            <Skeleton className="h-5 w-5 rounded-full bg-zinc-100 shadow" />
          </div>
        </div>
      ))}
    </>
  )
}
