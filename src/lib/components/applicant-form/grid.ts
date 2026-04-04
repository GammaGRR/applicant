export const getColClass = (cols: number) => {
  if (cols === 1) return 'col-span-1';
  if (cols === 2) return 'col-span-2';
  return 'col-span-3';
};
