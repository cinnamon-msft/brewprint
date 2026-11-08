import { cupCapacityMl, ingredients, totalMl, type IngredientId, type Layer, type Recipe } from './model';

export interface BuilderState { additions: Layer[]; message: string; revision: number }
export type BuilderAction =
  | { type: 'add'; ingredient: IngredientId }
  | { type: 'remove'; ingredient: IngredientId }
  | { type: 'load'; recipe: Recipe }
  | { type: 'undo' }
  | { type: 'reset' }
  | { type: 'reject'; message: string };

export const initialBuilder: BuilderState = {
  additions: [], message: 'Your cup is empty. Add an ingredient to begin.', revision: 0,
};

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  const result = (additions: Layer[], message: string): BuilderState =>
    ({ additions, message, revision: state.revision + 1 });
  switch (action.type) {
    case 'add': {
      const ingredient = ingredients[action.ingredient];
      const remaining = cupCapacityMl - totalMl(state.additions);
      if (ingredient.portionMl > remaining) {
        return result(state.additions,
          `Cannot add ${ingredient.name}: needs ${ingredient.portionMl} mL, only ${remaining} mL remaining. Your cup is unchanged.`);
      }
      return result([...state.additions, { ingredient: action.ingredient, amountMl: ingredient.portionMl }],
        `Added ${ingredient.portionMl} mL ${ingredient.name}. ${remaining - ingredient.portionMl} mL remaining.`);
    }
    case 'remove': {
      const removed = state.additions.filter(layer => layer.ingredient === action.ingredient);
      return result(state.additions.filter(layer => layer.ingredient !== action.ingredient),
        `Removed ${totalMl(removed)} mL ${ingredients[action.ingredient].name}.`);
    }
    case 'load': {
      if (totalMl(action.recipe.layers) > cupCapacityMl) {
        return result(state.additions, 'This recipe exceeds 360 mL. Your cup is unchanged.');
      }
      return result(action.recipe.layers.map(layer => ({ ...layer })),
        `Loaded ${action.recipe.name}, ${action.recipe.servingMl} mL. ${cupCapacityMl - action.recipe.servingMl} mL remaining.`);
    }
    case 'undo': {
      const last = state.additions.at(-1);
      return last
        ? result(state.additions.slice(0, -1), `Undid last addition: ${last.amountMl} mL ${ingredients[last.ingredient].name}.`)
        : result(state.additions, 'Nothing to undo. Your cup is empty.');
    }
    case 'reset':
      return result([], 'Cup reset. 360 mL remaining.');
    case 'reject':
      return result(state.additions, action.message);
  }
}
