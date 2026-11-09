import { useEffect, useRef, useState } from 'react';
import { parseRecipes } from './api';
import { Cup } from './Cup';
import { ingredients, type Recipe } from './model';

export function CustomizeRecipe({ recipe }: { recipe: Recipe }) {
  const baseEspresso = recipe.layers.find(layer => layer.ingredient === 'espresso');
  const hasMilk = recipe.layers.some(layer => layer.ingredient === 'steamed-milk');
  const [shots, setShots] = useState(String((baseEspresso?.amountMl ?? 30) / 30));
  const [milk, setMilk] = useState('Whole');
  const [custom, setCustom] = useState<Recipe>();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const shown = custom ?? recipe;
  async function customize() {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setPending(true);
    setError('');
    try {
      const query = new URLSearchParams({ shots });
      if (hasMilk) query.set('milk', milk);
      const response = await fetch(`/api/recipes/${recipe.id}/customize?${query}`, { signal: request.signal });
      const data: unknown = await response.json();
      if (!response.ok) {
        const detail = typeof data === 'object' && data !== null && 'detail' in data && typeof data.detail === 'string'
          ? data.detail : `HTTP ${response.status}`;
        throw new Error(`Cannot customize: ${detail}`);
      }
      const validated = parseRecipes([data])[0];
      if (!validated) throw new Error('Customization API returned no recipe.');
      setCustom(validated);
    } catch (reason: unknown) {
      if (!request.signal.aborted) setError(reason instanceof Error ? reason.message : 'Customization failed. Retry.');
    } finally {
      if (!request.signal.aborted) setPending(false);
    }
  }
  return <section className="panel customization" aria-labelledby="customize-heading">
    <h2 id="customize-heading">Customize {recipe.name}</h2>
    <p>Predefined recipe preview. Your manual cup and base recipe remain unchanged.</p>
    {!baseEspresso && <p>Brewed coffee is not eligible for espresso shots.</p>}
    <div className="customize-controls">
      <label>Espresso shots<select value={shots} disabled={!baseEspresso || pending} onChange={event => setShots(event.target.value)}>
        {[1, 2, 3, 4].map(count => <option key={count} value={count}>{count} shot{count === 1 ? '' : 's'} / {count * 30} mL</option>)}
      </select></label>
      <label>Milk choice<select value={milk} disabled={!hasMilk || pending} onChange={event => setMilk(event.target.value)}>
        {['Whole', 'Oat', 'Soy'].map(choice => <option key={choice}>{choice}</option>)}
      </select></label>
      <button disabled={!baseEspresso || pending} onClick={customize}>{pending ? 'Customizing...' : 'Apply shots and milk'}</button>
      <button disabled={!custom || pending} onClick={() => { setCustom(undefined); setError(''); }}>Show base recipe</button>
    </div>
    {!hasMilk && <p className="hint">Milk choice applies only to recipes containing milk.</p>}
    {recipe.id === 'espresso' && <p>Espresso-only exception: serving volume changes with the number of shots.</p>}
    {error && <p role="alert">{error}</p>}
    <div className="customize-result"><Cup layers={shown.layers} capacityMl={360} label={`${shown.name} customization preview`} />
      <div><p role="status"><strong>{shown.servingMl} mL {custom ? 'customized serving' : 'base serving'}</strong></p>
        <ol className="breakdown">{shown.layers.map((layer, index) => <li key={index}>
          <span>{layer.label ?? ingredients[layer.ingredient].name}</span><strong>{layer.amountMl} mL</strong>
        </li>)}</ol><p className="hint">Milk labels are descriptive only: no nutrition, allergy-safety or equivalent-foaming claims. Foam is illustrative occupied volume.</p>
      </div></div>
  </section>;
}
