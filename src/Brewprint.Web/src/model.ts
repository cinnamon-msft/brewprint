export const ingredients = {
  espresso: { name: 'Espresso', portionMl: 30, color: 'var(--espresso)' },
  'brewed-coffee': { name: 'Brewed coffee', portionMl: 60, color: 'var(--coffee)' },
  water: { name: 'Water', portionMl: 60, color: 'var(--water)' },
  'steamed-milk': { name: 'Steamed milk', portionMl: 30, color: 'var(--milk)' },
  'milk-foam': { name: 'Milk foam', portionMl: 30, color: 'var(--foam)' },
} as const;

export type IngredientId = keyof typeof ingredients;
export const ingredientIds = Object.keys(ingredients) as IngredientId[];
export const cupCapacityMl = 360;
export interface Layer { ingredient: IngredientId; amountMl: number; label?: string | null }
export interface Recipe {
  id: string;
  name: string;
  description: string;
  servingMl: number;
  layers: Layer[];
}
export function isIngredientId(value: unknown): value is IngredientId {
  return typeof value === 'string' && Object.hasOwn(ingredients, value);
}
export function totalMl(layers: readonly Layer[]): number {
  return layers.reduce((sum, layer) => sum + layer.amountMl, 0);
}
export function mergeLayers(layers: readonly Layer[]): Layer[] {
  return layers.reduce<Layer[]>((merged, layer) => {
    const previous = merged.at(-1);
    if (previous?.ingredient === layer.ingredient) previous.amountMl += layer.amountMl;
    else merged.push({ ...layer });
    return merged;
  }, []);
}
