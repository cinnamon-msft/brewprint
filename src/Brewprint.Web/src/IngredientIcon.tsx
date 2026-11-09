import type { ReactNode } from 'react';
import type { IngredientId } from './model';

const drawings: Record<IngredientId, ReactNode> = {
  espresso: <>
    <path d="M10 19h23v10c0 10-23 10-23 0Z" fill="currentColor" />
    <path d="M33 21h4c8 0 8 10 0 10h-4M7 40h31M14 23h15M17 13c-4-4 4-5 0-9M26 13c-4-4 4-5 0-9" />
  </>,
  'brewed-coffee': <>
    <path d="M17 8h14v10l7 17c2 5-2 7-7 7H17c-5 0-9-2-7-7l7-17Z" />
    <path d="M13 29h22l3 6c2 5-2 7-7 7H17c-5 0-9-2-7-7Z" fill="currentColor" />
    <path d="M16 8h16M17 17h14M21 5h6" />
  </>,
  water: <>
    <path d="M24 5C20 15 10 23 10 31a14 14 0 0 0 28 0C38 23 28 15 24 5Z" fill="currentColor" />
    <path d="M16 31c0 5 3 8 7 8" />
  </>,
  'steamed-milk': <>
    <path d="M10 12h24l-3 28H14Z" fill="currentColor" />
    <path d="M33 16h4c8 0 7 15-5 15M10 12l-4-4h14M18 18v15M24 8c-4-4 4-5 0-8" />
  </>,
  'milk-foam': <>
    <path d="M10 28h28l-5 13H15Z" fill="currentColor" />
    <path d="M10 28C1 23 8 13 15 17c0-12 17-14 19-2 10-2 15 10 4 13Z" fill="currentColor" />
    <path d="M16 23h1M24 18h1M31 24h1" />
  </>,
};

export function IngredientIcon({ ingredient }: { ingredient: IngredientId }) {
  return <svg viewBox="0 0 48 48" className="ingredient-drawing" aria-hidden="true" focusable="false"
    fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {drawings[ingredient]}
  </svg>;
}
