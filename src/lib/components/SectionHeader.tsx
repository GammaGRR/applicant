interface Props {
  title: string
}

export const SectionHeader = ({ title }: Props) => {
  return (
    <div className="border-b border-gray-200 pb-2 mb-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {title}
      </h2>
    </div>
  )
}