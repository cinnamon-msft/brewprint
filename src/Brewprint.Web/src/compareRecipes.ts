import { ingredientIds, type Recipe } from './model';

export function compareRecipes(left: Recipe, right: Recipe) {
  return ingredientIds.map(ingredient => {
    const amount = (recipe: Recipe) => recipe.layers.filter(layer => layer.ingredient === ingredient)
      .reduce((sum, layer) => sum + layer.amountMl, 0);
    const leftMl = amount(left);
    const rightMl = amount(right);
    return { ingredient, leftMl, rightMl, differenceMl: rightMl - leftMl };
  });
}
