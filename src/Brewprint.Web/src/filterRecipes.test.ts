import { expect, it } from 'vitest';
import { filterRecipes } from './filterRecipes';
import type { Recipe } from './model';

const recipes: Recipe[] = [
  { id: 'latte', name: 'Latte', description: '', servingMl: 60,
    layers: [{ ingredient: 'espresso', amountMl: 30 }, { ingredient: 'steamed-milk', amountMl: 30 }] },
  { id: 'coffee', name: 'Coffee', description: '', servingMl: 60,
    layers: [{ ingredient: 'brewed-coffee', amountMl: 60 }] },
];
it('zero filters returns all, AND matching includes only complete matches', () => {
  expect(filterRecipes(recipes, [])).toEqual(recipes);
  expect(filterRecipes(recipes, ['espresso', 'steamed-milk']).map(recipe => recipe.id)).toEqual(['latte']);
  expect(filterRecipes(recipes, ['espresso', 'brewed-coffee'])).toEqual([]);
});
it('does not mutate the source recipes or layers', () => {
  const original = JSON.stringify(recipes);
  filterRecipes(recipes, ['espresso']);
  expect(JSON.stringify(recipes)).toBe(original);
});
