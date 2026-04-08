import { GENERATIONS, GenerationKey } from "@/constants/generations"

interface Props {
  value: GenerationKey
  onChange: (value: GenerationKey) => void
}

export function PokemonFilter({ value, onChange }: Props) {
  return (
    <div className="w-full max-w-sm">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Generation
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as GenerationKey)}
        className="
          w-full px-3 py-2 rounded-md text-sm border border-gray-300
          bg-white text-black
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        "
      >
        {Object.entries(GENERATIONS).map(([key, gen]) => (
          <option key={key} value={key}>
            {gen.label}
          </option>
        ))}
      </select>
    </div>
  )
}