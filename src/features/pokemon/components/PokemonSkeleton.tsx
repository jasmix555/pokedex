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
            flex flex-col
            text-left
            rounded-lg
            border-2
            border-zinc-200
            bg-white
            overflow-hidden
            shadow-sm
          "
        >
          {/* Header */}
          <div className="bg-zinc-100 px-4 py-3">
            <Skeleton className="h-3 w-10 rounded bg-zinc-200" />

            <div className="flex flex-col gap-2 md:gap-0 md:flex-row items-start justify-between mt-1">
              <Skeleton className="h-5 w-28 rounded bg-zinc-200" />

              <div className="flex items-center gap-3 md:gap-2">
                <Skeleton className="h-6 w-6 rounded-full bg-zinc-200" />
                <Skeleton className="h-6 w-6 rounded-full bg-zinc-200" />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col p-4 space-y-3 flex-1">
            <div className="w-full aspect-square flex items-center justify-center">
              {/* Match PokemonImage sizing */}
              <Skeleton className="w-40 sm:w-48 md:w-56 aspect-square rounded-xl bg-zinc-200" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full bg-zinc-200" />
              <Skeleton className="h-6 w-20 rounded-full bg-zinc-200" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}