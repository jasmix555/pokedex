import { ReactNode } from 'react'

interface PokedexFrameProps {
  /** Controls placed in the screen header (search + filter). */
  controls?: ReactNode
  /** Main screen content (the grid). */
  children: ReactNode
}

/**
 * The iconic red Pokédex device chrome: a glossy blue lens with indicator
 * lights up top, a recessed LCD "screen" that holds the controls and grid,
 * and a hinge running down the side.
 */
export function PokedexFrame({ controls, children }: PokedexFrameProps) {
  return (
    <div className="min-h-screen w-full px-2 py-4 sm:px-4 sm:py-8 flex justify-center">
      <div className="pkdx-device w-full max-w-5xl rounded-[1.75rem] p-3 sm:p-5">
        {/* ---------- Top control panel ---------- */}
        <div className="flex items-center gap-4 px-2 pb-4 sm:px-3">
          {/* Big blue lens */}
          <div className="pkdx-lens relative h-12 w-12 shrink-0 rounded-full ring-4 ring-white/90 sm:h-16 sm:w-16" />

          {/* Indicator lights */}
          <div className="flex items-center gap-2">
            <span className="pkdx-light pkdx-blink h-3 w-3 rounded-full bg-red-400 text-red-400 sm:h-3.5 sm:w-3.5" />
            <span className="pkdx-light h-3 w-3 rounded-full bg-yellow-300 text-yellow-300 sm:h-3.5 sm:w-3.5" />
            <span className="pkdx-light h-3 w-3 rounded-full bg-green-400 text-green-400 sm:h-3.5 sm:w-3.5" />
          </div>

          {/* Title */}
          <div className="ml-auto text-right">
            <h1 className="pkdx-font text-sm leading-none text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:text-lg">
              Pokédex
            </h1>
          </div>
        </div>

        {/* ---------- Screen ---------- */}
        <div className="relative">
          {/* Hinge accent on the left */}
          <div className="pkdx-hinge absolute -left-1 top-6 bottom-6 hidden w-3 rounded-full sm:block" />

          <div className="pkdx-bezel rounded-2xl p-2 sm:p-3 sm:ml-4">
            <div className="pkdx-screen rounded-xl p-3 sm:p-5">
              {controls && <div className="mb-5 space-y-4">{controls}</div>}
              {children}
            </div>
          </div>
        </div>

        {/* ---------- Bottom decorative controls ---------- */}
        <div className="mt-4 flex items-center justify-between px-2 sm:px-3">
          {/* D-pad */}
          <div className="relative h-10 w-10 opacity-90">
            <div className="absolute left-1/2 top-0 h-10 w-3 -translate-x-1/2 rounded-sm bg-black/70" />
            <div className="absolute top-1/2 left-0 h-3 w-10 -translate-y-1/2 rounded-sm bg-black/70" />
          </div>

          {/* Speaker lines + button */}
          <div className="flex items-center gap-4">
            <div className="hidden flex-col gap-1 sm:flex">
              <span className="block h-0.5 w-10 rounded bg-black/30" />
              <span className="block h-0.5 w-10 rounded bg-black/30" />
              <span className="block h-0.5 w-10 rounded bg-black/30" />
            </div>
            <div className="h-7 w-7 rounded-full border-2 border-black/30 bg-white/80 shadow-inner" />
          </div>
        </div>
      </div>
    </div>
  )
}
