import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { XIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

import { Pokemon } from '../types/pokemon.types'
import { getTypeColor } from '../utils/typeColor'
import { fetchPokemonEvolutionChain } from '../api/pokemonEvolution.api'
import { fetchPokemonByName } from '../api/pokemon.api'
import { mapPokemon } from '../utils/mapPokemon'
import { PokemonImage } from './PokemonImage'
import { ShinyButton } from './ShinyButton'
import { GenderButton } from './GenderButton'
import { TypeBadge } from './TypeBadge'

interface EvolutionNode {
  id: number
  name: string
  details: string
}

interface AltFormNode {
  id: number
  name: string
}

interface Props {
  pokemon: Pokemon | null
  onClose: () => void
  onOpenEvolution: (pokemon: Pokemon, gender: 'male' | 'female') => void
  initialGender?: 'male' | 'female'
  onGenderChange?: (pokemonId: number, gender: 'male' | 'female') => void
  initialShiny?: boolean
  onShinyChange?: (pokemonId: number, shiny: boolean) => void
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
}

function getEvolutionSpriteUrl(evoId: number, shiny: boolean, gender: 'male' | 'female'): string {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
  if (shiny && gender === 'female') return `${base}/shiny/female/${evoId}.png`
  if (shiny) return `${base}/shiny/${evoId}.png`
  if (gender === 'female') return `${base}/female/${evoId}.png`
  return `${base}/${evoId}.png`
}

export function PokemonModal({
  pokemon,
  onClose,
  onOpenEvolution,
  initialGender = 'male',
  onGenderChange,
  initialShiny = false,
  onShinyChange,
}: Props) {
  const [evolutions, setEvolutions] = useState<EvolutionNode[]>([])
  const [isLoadingEvo, setIsLoadingEvo] = useState(false)
  const [isOpeningEvolution, setIsOpeningEvolution] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>(initialGender)
  const [shiny, setShiny] = useState(initialShiny)
  const [altForms, setAltForms] = useState<AltFormNode[]>([])
  const [isLoadingAltForms, setIsLoadingAltForms] = useState(false)

  useEffect(() => {
    setGender(initialGender)
    setShiny(initialShiny)
  }, [pokemon, initialGender, initialShiny])

  useEffect(() => {
    if (!pokemon) return
    let cancelled = false

    async function loadEvolution() {
      try {
        setIsLoadingEvo(true)
        setEvolutions([])
        const chain = await fetchPokemonEvolutionChain(pokemon!.name)
        if (!cancelled) setEvolutions(chain)
      } catch (err) {
        console.error('Failed to load evolution chain', err)
      } finally {
        if (!cancelled) setIsLoadingEvo(false)
      }
    }

    loadEvolution()
    return () => { cancelled = true }
  }, [pokemon])

  useEffect(() => {
    if (!pokemon) return
    let cancelled = false
    const speciesKey = pokemon.name.split('-')[0]

    async function loadAltForms() {
      try {
        setIsLoadingAltForms(true)
        setAltForms([])
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesKey}`)
        if (!res.ok) return
        const data = await res.json()
        const forms = data.varieties.map((v: { pokemon: { name: string; url: string } }) => {
          const url: string = v.pokemon.url
          const id = Number(url.split('/').filter(Boolean).pop())
          return { id, name: v.pokemon.name }
        })
        if (!cancelled) setAltForms(forms)
      } catch (err) {
        console.error('Failed to load alt forms', err)
      } finally {
        if (!cancelled) setIsLoadingAltForms(false)
      }
    }

    loadAltForms()
    return () => { cancelled = true }
  }, [pokemon])

  async function handleEvolutionClick(evo: EvolutionNode) {
    if (!pokemon || evo.id === pokemon.id) return
    try {
      setIsOpeningEvolution(true)
      const apiPokemon = await fetchPokemonByName(String(evo.id))
      const mapped = mapPokemon(apiPokemon)
      const targetGender = mapped.femaleSprite ? gender : 'male'
      onOpenEvolution(mapped, targetGender)
    } catch (error) {
      console.error('Failed to open evolution:', error)
    } finally {
      setIsOpeningEvolution(false)
    }
  }

  if (!pokemon) return null

  const primaryType = pokemon.types[0]
  const primaryColor = getTypeColor(primaryType)
  const hasFemaleSprite = Boolean(pokemon.femaleSprite)
  const hasShiny = Boolean(pokemon.shinySprite)

  const spriteUrl = (() => {
    if (shiny) {
      return gender === 'female'
        ? pokemon.shinyFemaleSprite ?? pokemon.shinySprite ?? pokemon.sprite ?? pokemon.image
        : pokemon.shinySprite ?? pokemon.sprite ?? pokemon.image
    }
    return gender === 'female'
      ? pokemon.femaleSprite ?? pokemon.sprite ?? pokemon.image
      : pokemon.sprite ?? pokemon.image
  })()

  const statTotal = pokemon.stats.reduce((sum, s) => sum + s.value, 0)

  return (
    <Dialog open={!!pokemon} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="border border-zinc-200 bg-white text-gray-900 shadow-2xl rounded-2xl overflow-hidden p-0 gap-0 max-w-[95vw] sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">{pokemon.name} Details</DialogTitle>
        <DialogDescription className="sr-only">
          View details, stats, and the evolution path for this Pokémon.
        </DialogDescription>

        {/* Header — device control strip */}
        <div className={`relative ${primaryColor.bg} px-4 py-3 sm:px-5`}>
          {/* Indicator lights echoing the device */}
          <div className="flex items-center gap-1.5">
            <span className="pkdx-light h-3 w-3 rounded-full bg-sky-300 text-sky-300" />
            <span className="pkdx-light h-2 w-2 rounded-full bg-red-400 text-red-400" />
            <span className="pkdx-light h-2 w-2 rounded-full bg-yellow-300 text-yellow-300" />
            <span className="pkdx-light h-2 w-2 rounded-full bg-green-400 text-green-400" />
          </div>

          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className={`inline-block rounded-full bg-black/15 px-2 py-0.5 text-[11px] font-bold tabular-nums ${primaryColor.text}`}>
                #{String(pokemon.id).padStart(4, '0')}
              </span>
              <h2 className={`mt-1 truncate text-2xl font-extrabold capitalize leading-tight ${primaryColor.text}`}>
                {pokemon.name.replace('-', ' ')}
              </h2>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {hasShiny && (
                <ShinyButton
                  shiny={shiny}
                  onShinyChange={newShiny => {
                    setShiny(newShiny)
                    onShinyChange?.(pokemon.id, newShiny)
                  }}
                />
              )}
              {hasFemaleSprite && (
                <GenderButton
                  gender={gender}
                  onGenderChange={newGender => {
                    setGender(newGender)
                    onGenderChange?.(pokemon.id, newGender)
                  }}
                />
              )}
              <DialogClose className="ml-1 rounded-full bg-white/80 p-1.5 text-gray-900 shadow-sm transition hover:bg-white shrink-0">
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 overflow-y-auto bg-zinc-50 p-4 sm:p-6 max-h-[calc(90vh-150px)]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">

            {/* Sprite viewer + types */}
            <div className="sm:col-span-2 flex flex-col items-center gap-3">
              <div
                className="relative flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white"
                style={{
                  background: `radial-gradient(circle at 50% 45%, ${primaryColor.hex}26 0%, ${primaryColor.hex}0d 55%, #ffffff 80%)`,
                }}
              >
                <img
                  src="/pokeball.png"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="pointer-events-none absolute left-1/2 top-1/2 w-3/4 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
                />
                <div className="relative z-10 flex h-full w-full items-center justify-center p-5">
                  <PokemonImage
                    src={spriteUrl}
                    alt={pokemon.name}
                    className="h-full w-full object-contain"
                    pokemonId={pokemon.id}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {pokemon.types.map(type => (
                  <TypeBadge key={type} type={type} allTypes={pokemon.types} />
                ))}
              </div>
            </div>

            {/* Base stats */}
            <div className="sm:col-span-3 rounded-2xl border-2 border-zinc-200 bg-white p-4">
              <p className="pkdx-font mb-3 text-[9px] tracking-wider text-zinc-500">BASE STATS</p>
              <div className="space-y-2">
                {pokemon.stats.map(stat => {
                  const statColor =
                    stat.value >= 100 ? 'bg-emerald-500'
                    : stat.value >= 75 ? 'bg-sky-500'
                    : stat.value >= 50 ? 'bg-amber-400'
                    : 'bg-rose-500'
                  return (
                    <div key={stat.name} className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-[10px] font-bold uppercase text-zinc-500">
                        {STAT_LABELS[stat.name] ?? stat.name}
                      </span>
                      <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums text-zinc-800">
                        {stat.value}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
                        <div
                          className={`h-full ${statColor} rounded-full transition-all`}
                          style={{ width: `${Math.min((stat.value / 255) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2">
                <span className="text-[10px] font-bold uppercase text-zinc-500">Total</span>
                <span className="text-sm font-extrabold tabular-nums text-zinc-900">{statTotal}</span>
              </div>
            </div>
          </div>

          {/* Evolution */}
          <section className="rounded-2xl border-2 border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <p className="pkdx-font text-[9px] tracking-wider text-zinc-500">EVOLUTION</p>
              {isLoadingEvo && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-[var(--pkdx-red)]" />
              )}
            </div>

            {isLoadingEvo && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            )}

            {!isLoadingEvo && evolutions.length > 1 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {evolutions.map(evo => {
                  const isCurrent = evo.id === pokemon.id
                  return (
                    <button
                      key={evo.id}
                      type="button"
                      onClick={() => handleEvolutionClick(evo)}
                      disabled={isCurrent || isOpeningEvolution}
                      className={`group flex flex-col items-center rounded-xl border-2 p-2 text-center transition
                        ${isCurrent
                          ? `${primaryColor.border} ${primaryColor.bg}`
                          : 'border-zinc-200 bg-zinc-50 hover:-translate-y-0.5 hover:border-[var(--pkdx-red)] hover:shadow-md'
                        }
                        disabled:cursor-default disabled:opacity-60
                      `}
                    >
                      <PokemonImage
                        src={getEvolutionSpriteUrl(evo.id, shiny, gender)}
                        alt={evo.name}
                        className="h-14 w-14"
                        pokemonId={evo.id}
                      />
                      <span className={`mt-2 text-xs font-bold capitalize ${isCurrent ? primaryColor.text : 'text-zinc-900'}`}>
                        {evo.name.replace('-', ' ')}
                      </span>
                      <span className={`mt-1 text-[9px] leading-tight ${isCurrent ? primaryColor.text : 'text-zinc-500'}`}>
                        {evo.details}
                      </span>
                      {isCurrent && (
                        <span className="mt-2 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold text-zinc-700">
                          Current
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {isOpeningEvolution && (
              <p className="mt-2 text-xs text-zinc-500">Opening selected Pokémon...</p>
            )}

            {!isLoadingEvo && evolutions.length <= 1 && (
              <p className="text-xs text-zinc-500">This Pokémon does not evolve.</p>
            )}
          </section>

          {/* Alt Forms */}
          <section className="rounded-2xl border-2 border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <p className="pkdx-font text-[9px] tracking-wider text-zinc-500">ALT FORMS</p>
              {isLoadingAltForms && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-[var(--pkdx-red)]" />
              )}
            </div>

            {!isLoadingAltForms && altForms.length <= 1 && (
              <p className="text-xs text-zinc-500">No alternate forms.</p>
            )}

            {!isLoadingAltForms && altForms.length > 1 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {altForms.map(form => {
                  const isCurrent = form.id === pokemon.id
                  return (
                    <button
                      key={form.id}
                      type="button"
                      disabled={isCurrent || isOpeningEvolution}
                      onClick={async () => {
                        try {
                          setIsOpeningEvolution(true)
                          const apiPokemon = await fetchPokemonByName(form.name)
                          const mapped = mapPokemon(apiPokemon)
                          const targetGender = mapped.femaleSprite ? gender : 'male'
                          onShinyChange?.(mapped.id, shiny)
                          onGenderChange?.(mapped.id, targetGender)
                          onOpenEvolution(mapped, targetGender)
                        } finally {
                          setIsOpeningEvolution(false)
                        }
                      }}
                      className={`group flex flex-col items-center rounded-xl border-2 p-2 text-center transition
                        ${isCurrent
                          ? `${primaryColor.border} ${primaryColor.bg}`
                          : 'border-zinc-200 bg-zinc-50 hover:-translate-y-0.5 hover:border-[var(--pkdx-red)] hover:shadow-md'
                        }
                      `}
                    >
                      <PokemonImage
                        src={getEvolutionSpriteUrl(form.id, shiny, gender)}
                        alt={form.name}
                        className="h-14 w-14"
                        pokemonId={form.id}
                      />
                      <span className={`mt-2 text-xs font-bold capitalize ${isCurrent ? primaryColor.text : 'text-zinc-900'}`}>
                        {form.name.replace('-', ' ')}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
