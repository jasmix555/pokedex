interface Props {
  gender: 'male' | 'female'
  onGenderChange: (gender: 'male' | 'female') => void
}

export function GenderButton({ gender, onGenderChange }: Props) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onGenderChange(gender === 'male' ? 'female' : 'male')
      }}
      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition border-2 ${
        gender === 'male'
          ? 'bg-blue-500 text-white border-blue-600 shadow-md'
          : 'bg-pink-500 text-white border-pink-600 shadow-md'
      }`}
      title={`Switch to ${gender === 'male' ? 'female' : 'male'}`}
      style={{ fontSize: '14px', lineHeight: 1 }}
    >
      {gender === 'male' ? '♂\uFE0E' : '♀\uFE0E'}
    </button>
  )
}