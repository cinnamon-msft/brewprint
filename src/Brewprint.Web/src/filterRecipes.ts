import type { IngredientId, Recipe } from './model';

export function filterRecipes(recipes: readonly Recipe[], selected: readonly IngredientId[]): Recipe[] {
  return recipes.filter(recipe => selected.every(id =>
    recipe.layers.some(layer => layer.ingredient === id)));
}
