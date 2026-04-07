import { GENERATIONS, GenerationKey } from "@/constants/generations"

interface Props {
  value: GenerationKey
  onChange: (value: GenerationKey) => void
}

export function PokemonFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(GENERATIONS).map(([key, gen]) => (
        <button
          key={key}
          onClick={() => onChange(key as GenerationKey)}
          className={`
            px-3 py-2 rounded-md text-sm border whitespace-nowrap
            ${value === key
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'}
          `}
        >
          {gen.label}
        </button>
      ))}
    </div>
  )
}
