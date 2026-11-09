import { expect, it } from 'vitest';
import { compareRecipes } from './compareRecipes';
import type { Recipe } from './model';

const left: Recipe = { id: 'espresso', name: 'Espresso', description: '', servingMl: 30,
  layers: [{ ingredient: 'espresso', amountMl: 30 }] };
const right: Recipe = { id: 'latte', name: 'Latte', description: '', servingMl: 240,
  layers: [{ ingredient: 'espresso', amountMl: 30 }, { ingredient: 'steamed-milk', amountMl: 180 },
    { ingredient: 'milk-foam', amountMl: 30 }] };
it('includes absent ingredients as zero and computes right minus left', () => {
  const rows = compareRecipes(left, right);
  expect(rows).toHaveLength(5);
  expect(rows.find(row => row.ingredient === 'steamed-milk')).toEqual({
    ingredient: 'steamed-milk', leftMl: 0, rightMl: 180, differenceMl: 180,
  });
  expect(compareRecipes(right, left).find(row => row.ingredient === 'steamed-milk')?.differenceMl).toBe(-180);
});
it('same selection is valid and all differences are zero', () => {
  expect(compareRecipes(left, left).every(row => row.differenceMl === 0)).toBe(true);
});
