import type { FilterState } from './types';

export const statisticsConfig = [
  { key: 'grade9_budget_total', colorBlock: 'bg-blue-50', colorText: 'text-blue-600', colorNum: 'text-blue-700', lable: 'Подано всего 9 класс на бюджет', count: 0 },
  { key: 'grade9_budget_attest_original', colorBlock: 'bg-emerald-50', colorText: 'text-emerald-600', colorNum: 'text-emerald-700', lable: 'Подано 9 класс с оригиналом аттестата', count: 0 },
  { key: 'grade9_commerce_total', colorBlock: 'bg-rose-50', colorText: 'text-rose-600', colorNum: 'text-rose-700', lable: '9 класс на коммерцию', count: 0 },
  { key: 'grade11_budget_total', colorBlock: 'bg-blue-50', colorText: 'text-blue-600', colorNum: 'text-blue-700', lable: 'Подано всего 11 класс на бюджет', count: 0 },
  { key: 'grade11_budget_attest_original', colorBlock: 'bg-emerald-50', colorText: 'text-emerald-600', colorNum: 'text-emerald-700', lable: 'Подано 11 класс с оригиналом аттестата', count: 0 },
  { key: 'grade11_commerce_total', colorBlock: 'bg-rose-50', colorText: 'text-rose-600', colorNum: 'text-rose-700', lable: '11 класс на коммерцию', count: 0 },
] as const;

export const EMPTY_FILTERS: FilterState = {
  docStatus: [],
  classes: [],
  profession: [],
  finance: [],
  point: [],
  benefit: [],
};

export const countableDocLabels = [
  'Копия аттестат',
  'Копия паспорт',
  'Фото',
  'Копия карты прививок',
  'Копия СНИЛС',
] as const;
