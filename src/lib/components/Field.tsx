interface Props {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const Field = ({ label, required, children, className = "" }: Props) => {
  return (
    <div className={className}>
      <label className="block text-sm text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}