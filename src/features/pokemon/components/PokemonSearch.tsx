import { Input } from '@/components/ui/input'

interface PokemonSearchProps {
  value: string
  onChange: (value: string) => void
}

export function PokemonSearch({ value, onChange }: PokemonSearchProps) {
  return (
    <div className="relative max-w-sm">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Browse
      </label>

      <div className="relative">
        <Input
          placeholder="Search Pokémon by name…"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pr-10"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 transition text-lg leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}