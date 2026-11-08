import { describe, expect, it } from 'vitest';
import { builderReducer, initialBuilder } from './builder';
import { cupCapacityMl, ingredientIds, ingredients, mergeLayers, totalMl, type Recipe } from './model';

const latte: Recipe = { id: 'latte', name: 'Latte', description: 'Milk forward', servingMl: 240,
  layers: [{ ingredient: 'espresso', amountMl: 30 }, { ingredient: 'steamed-milk', amountMl: 180 }, { ingredient: 'milk-foam', amountMl: 30 }] };

describe('fixed-capacity assembly', () => {
  it.each(ingredientIds)('adds the fixed portion for %s', ingredient => {
    const state = builderReducer(initialBuilder, { type: 'add', ingredient });
    expect(state.additions).toEqual([{ ingredient, amountMl: ingredients[ingredient].portionMl }]);
  });
  it('fills exactly and rejects overflow without mutating additions', () => {
    let state = initialBuilder;
    for (let i = 0; i < 6; i++) state = builderReducer(state, { type: 'add', ingredient: 'water' });
    expect(totalMl(state.additions)).toBe(cupCapacityMl);
    const rejected = builderReducer(state, { type: 'add', ingredient: 'espresso' });
    expect(rejected.additions).toBe(state.additions);
    expect(rejected.message).toContain('Cannot add');
    expect(rejected.message).toContain('only 0 mL remaining');
  });
  it('rejects a portion larger than remaining space, not just a full cup', () => {
    let state = builderReducer(initialBuilder, { type: 'load', recipe: { ...latte, servingMl: 345,
      layers: [{ ingredient: 'water', amountMl: 345 }] } });
    state = builderReducer(state, { type: 'add', ingredient: 'espresso' });
    expect(totalMl(state.additions)).toBe(345);
    expect(state.message).toContain('only 15 mL remaining');
  });
  it('keeps assembly order, merges only contiguous layers, and undoes one addition', () => {
    let state = builderReducer(initialBuilder, { type: 'add', ingredient: 'espresso' });
    state = builderReducer(state, { type: 'add', ingredient: 'espresso' });
    state = builderReducer(state, { type: 'add', ingredient: 'water' });
    state = builderReducer(state, { type: 'add', ingredient: 'espresso' });
    expect(mergeLayers(state.additions)).toEqual([
      { ingredient: 'espresso', amountMl: 60 }, { ingredient: 'water', amountMl: 60 }, { ingredient: 'espresso', amountMl: 30 },
    ]);
    expect(state.additions[0]?.amountMl).toBe(30);
    state = builderReducer(state, { type: 'undo' });
    expect(totalMl(state.additions)).toBe(120);
    state = builderReducer(state, { type: 'undo' });
    state = builderReducer(state, { type: 'undo' });
    expect(totalMl(state.additions)).toBe(30);
  });
  it('removes all of one ingredient and preserves the others', () => {
    let state = builderReducer(initialBuilder, { type: 'load', recipe: latte });
    state = builderReducer(state, { type: 'add', ingredient: 'espresso' });
    state = builderReducer(state, { type: 'remove', ingredient: 'espresso' });
    expect(state.additions).toEqual(latte.layers.slice(1));
    expect(state.message).toContain('Removed 60 mL Espresso');
  });
  it('loads a copied recipe, resets, and announces repeated actions', () => {
    const loaded = builderReducer(initialBuilder, { type: 'load', recipe: latte });
    expect(loaded.additions).toEqual(latte.layers);
    expect(loaded.additions).not.toBe(latte.layers);
    const reset = builderReducer(loaded, { type: 'reset' });
    expect(reset.additions).toEqual([]);
    expect(builderReducer(reset, { type: 'reset' }).revision).toBe(reset.revision + 1);
  });
  it('rejects oversized recipe loads and invalid drops accessibly', () => {
    const state = builderReducer(initialBuilder, { type: 'load', recipe: { ...latte,
      layers: [{ ingredient: 'water', amountMl: 400 }], servingMl: 400 } });
    expect(state.additions).toBe(initialBuilder.additions);
    expect(state.message).toContain('unchanged');
    expect(builderReducer(state, { type: 'reject', message: 'Invalid drop' }).message).toBe('Invalid drop');
  });
});
