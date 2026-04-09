import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PokemonType } from '../types/pokemon.types'
import { getTypeIcon } from '../utils/typeIcon'
import { getTypeColor } from '../utils/typeColor'
import { getDefensiveMatchups } from '../utils/typeChart'

function TypePill({ type, multiplier }: { type: PokemonType; multiplier: string }) {
  const color = getTypeColor(type)
  return (
    <span className={`inline-flex items-center gap-1 ${color.bg} ${color.text} px-2 py-0.5 rounded-full text-[10px] font-semibold`}>
      <img src={getTypeIcon(type)} alt={type} className="h-3 w-3" />
      {type}
      <span className="opacity-75">{multiplier}</span>
    </span>
  )
}

interface Props {
  type: PokemonType
  allTypes: PokemonType[]
}

export function TypeBadge({ type, allTypes }: Props) {
  const [open, setOpen] = useState(false)
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({})
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const color = getTypeColor(type)
  const { weaknesses, resistances, immunities } = getDefensiveMatchups(allTypes)

  useEffect(() => {
    if (!open || !buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const popoverWidth = 256
    const viewportWidth = window.innerWidth
    const margin = 8

    // Ideal: center the popover under the button
    const idealLeft = rect.left + rect.width / 2 - popoverWidth / 2

    // Clamp so it never goes off either edge
    const clampedLeft = Math.max(
      margin,
      Math.min(idealLeft, viewportWidth - popoverWidth - margin)
    )

    setPopoverStyle({
      position: 'fixed',
      top: rect.bottom + margin,
      left: clampedLeft,
      width: popoverWidth,
      zIndex: 99999,
    })
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node
      if (buttonRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }

    function handleScroll() {
      setOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [open])

  const popover = open ? (
    <div
      ref={popoverRef}
      style={popoverStyle}
      onClick={e => e.stopPropagation()}
      className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 space-y-3"
    >
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
        Defensive matchups
      </p>

      {weaknesses.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-red-600">Weak to</p>
          <div className="flex flex-wrap gap-1">
            {weaknesses.map(({ type: t, multiplier }) => (
              <TypePill key={t} type={t} multiplier={`×${multiplier}`} />
            ))}
          </div>
        </div>
      )}

      {resistances.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-green-600">Resists</p>
          <div className="flex flex-wrap gap-1">
            {resistances.map(({ type: t, multiplier }) => (
              <TypePill key={t} type={t} multiplier={`×${multiplier}`} />
            ))}
          </div>
        </div>
      )}

      {immunities.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-gray-500">Immune to</p>
          <div className="flex flex-wrap gap-1">
            {immunities.map(({ type: t }) => (
              <TypePill key={t} type={t} multiplier="×0" />
            ))}
          </div>
        </div>
      )}
    </div>
  ) : null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={e => {
          e.stopPropagation()
          setOpen(v => !v)
        }}
        className={`
          inline-flex items-center gap-1
          ${color.bg} ${color.text}
          px-2.5 py-1 rounded-full text-xs font-semibold
          transition hover:opacity-80 cursor-pointer
        `}
      >
        <img src={getTypeIcon(type)} alt={type} className="h-3.5 w-3.5" />
        {type}
      </button>

      {typeof document !== 'undefined' && createPortal(popover, document.body)}
    </div>
  )
}