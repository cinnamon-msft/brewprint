import { cupCapacityMl, isIngredientId, totalMl, type Layer, type Recipe } from './model';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isLayer(value: unknown): value is Layer {
  return isRecord(value) && isIngredientId(value.ingredient) &&
    typeof value.amountMl === 'number' && Number.isInteger(value.amountMl) && value.amountMl > 0 &&
    (value.label == null || typeof value.label === 'string');
}
function isRecipe(value: unknown): value is Recipe {
  return isRecord(value) &&
    typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.name === 'string' && value.name.length > 0 &&
    typeof value.description === 'string' &&
    typeof value.servingMl === 'number' && Number.isInteger(value.servingMl) &&
    value.servingMl > 0 && value.servingMl <= cupCapacityMl &&
    Array.isArray(value.layers) && value.layers.length > 0 && value.layers.every(isLayer) &&
    totalMl(value.layers) === value.servingMl;
}
export function parseRecipes(value: unknown): Recipe[] {
  if (!Array.isArray(value) || value.length === 0 || !value.every(isRecipe) ||
      new Set(value.map(recipe => recipe.id)).size !== value.length) {
    throw new Error('The recipe API returned invalid data. Check the backend and retry.');
  }
  return value;
}
export async function fetchRecipes(signal: AbortSignal): Promise<Recipe[]> {
  const response = await fetch('/api/recipes', { signal });
  if (!response.ok) throw new Error(`Recipe API returned HTTP ${response.status}. Check that the backend is running.`);
  return parseRecipes(await response.json());
}
