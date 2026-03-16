interface Props {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  className?: string
}

export const TextInput = ({ placeholder, value, onChange, className = "" }: Props) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition ${className}`}
    />
  )
}