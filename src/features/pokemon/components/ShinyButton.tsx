// components/ShinyButton.tsx
interface Props {
  shiny: boolean
  onShinyChange: (shiny: boolean) => void
}

export function ShinyButton({ shiny, onShinyChange }: Props) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onShinyChange(!shiny)
      }}
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition border-2 ${
        shiny
          ? 'bg-yellow-400 border-yellow-500 shadow-md'
          : 'bg-white/60 border-gray-300'
      }`}
      title={shiny ? 'Shiny on' : 'Shiny off'}
    >
      ✨
    </button>
  )
}