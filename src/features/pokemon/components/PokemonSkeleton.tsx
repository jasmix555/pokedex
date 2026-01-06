import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface PokemonSkeletonProps {
  count?: number
}

export function PokemonSkeleton({ count = 8 }: PokemonSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex flex-col items-center gap-3">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
