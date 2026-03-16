interface Props {
  options: string[]
  value: string
  onChange: (v: string)=>void
  placeholder?: string
}

export const Select = ({ options,value,onChange,placeholder }:Props) => {
  return(
    <div className="relative">
      <select
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition cursor-pointer"
      >
        <option value="" disabled>
          {placeholder || "Выберите..."}
        </option>

        {options.map(o=>(
          <option key={o} value={o}>{o}</option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>
  )
}