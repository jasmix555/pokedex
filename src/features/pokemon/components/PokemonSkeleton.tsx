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
          className="w-full flex flex-col overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-sm"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between gap-2 bg-zinc-100 px-3 py-2">
            <Skeleton className="h-5 w-12 rounded-full bg-zinc-200" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-7 w-7 rounded-full bg-zinc-200" />
              <Skeleton className="h-7 w-7 rounded-full bg-zinc-200" />
            </div>
          </div>

          {/* Sprite viewer */}
          <div className="relative aspect-square w-full bg-zinc-50">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <Skeleton className="h-full w-full rounded-full bg-zinc-200/80" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 border-t border-zinc-100 px-3 py-3">
            <Skeleton className="h-4 w-24 rounded bg-zinc-200" />
            <div className="flex gap-1.5">
              <Skeleton className="h-6 w-16 rounded-full bg-zinc-200" />
              <Skeleton className="h-6 w-14 rounded-full bg-zinc-200" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
