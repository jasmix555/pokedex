import { Input } from '@/components/ui/input'

interface PokemonSearchProps {
  value: string
  onChange: (value: string) => void
}

export function PokemonSearch({
  value,
  onChange,
}: PokemonSearchProps) {
  return (
    <Input
      placeholder="Search Pokémon by name…"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="max-w-sm"
    />
  )
}
