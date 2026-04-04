export const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: 10 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
      </td>
    ))}
  </tr>
);
