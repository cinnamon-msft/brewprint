import { useId, useState } from 'react';
import { compareRecipes } from './compareRecipes';
import { Cup } from './Cup';
import { ingredients, type Recipe } from './model';

export function CompareDrinks({ recipes }: { recipes: Recipe[] }) {
  const id = useId();
  const [leftId, setLeftId] = useState('latte');
  const [rightId, setRightId] = useState('cappuccino');
  const left = recipes.find(recipe => recipe.id === leftId) ?? recipes[0];
  const right = recipes.find(recipe => recipe.id === rightId) ?? recipes[0];
  if (!left || !right) return <p role="alert">No recipes are available to compare. Retry the recipe book.</p>;
  const rows = compareRecipes(left, right);
  return <section className="panel comparison" aria-labelledby={`${id}-heading`}>
    <p className="eyebrow">04 / A closer look</p><h2 id={`${id}-heading`}>Compare two classics.</h2>
    <p>Independent predefined drink selections. Your manual build stays unchanged.</p>
    <div className="comparison-cups">
      <div><label htmlFor={`${id}-left`}>Left drink</label>
        <select id={`${id}-left`} value={left.id} onChange={event => setLeftId(event.target.value)}>
          {recipes.map(recipe => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}
        </select>
        <Cup layers={left.layers} capacityMl={360} label={`Left: ${left.name}`} />
        <h3>{left.name}</h3><p>{left.servingMl} mL serving</p>
      </div>
      <div><label htmlFor={`${id}-right`}>Right drink</label>
        <select id={`${id}-right`} value={right.id} onChange={event => setRightId(event.target.value)}>
          {recipes.map(recipe => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}
        </select>
        <Cup layers={right.layers} capacityMl={360} label={`Right: ${right.name}`} />
        <h3>{right.name}</h3><p>{right.servingMl} mL serving</p>
      </div>
    </div>
    {left.id === right.id && <p role="status">Same drink on both sides: all ingredient differences are zero.</p>}
    <table className="comparison-table"><caption>Ingredient amounts in mL. Difference is right minus left.</caption>
      <thead><tr><th scope="col">Ingredient</th><th scope="col">Left</th><th scope="col">Right</th><th scope="col">Right - left</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.ingredient}><th scope="row">{ingredients[row.ingredient].name}</th>
        <td>{row.leftMl}</td><td>{row.rightMl}</td>
        <td data-difference={row.differenceMl}>{row.differenceMl > 0 ? '+' : ''}{row.differenceMl}</td>
      </tr>)}</tbody>
    </table>
    <p className="hint">Both diagrams use the same 360mL scale. Foam is illustrative occupied volume, not liquid yield.</p>
  </section>;
}
