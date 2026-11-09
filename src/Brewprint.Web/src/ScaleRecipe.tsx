import { useEffect, useRef, useState } from 'react';
import { parseRecipes } from './api';
import { Cup } from './Cup';
import { ingredients, type Recipe } from './model';

export function ScaleRecipe({ recipe }: { recipe: Recipe }) {
  const [target, setTarget] = useState('237');
  const [scaled, setScaled] = useState<Recipe>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const shown = scaled ?? recipe;
  async function scale() {
    const size = Number(target);
    if (!Number.isInteger(size) || size < 60 || size > 480) {
      setError('Choose a whole-mL size from 60 through 480.');
      return;
    }
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/recipes/${recipe.id}/scale?targetMl=${size}`, { signal: request.signal });
      if (!response.ok) throw new Error(`Scaling failed (HTTP ${response.status}). Choose a valid cup size and retry.`);
      // Scaling can exceed the starter builder's 360mL capacity.
      const data: unknown = await response.json();
      const validated = parseRecipes([data], 480)[0];
      if (!validated) throw new Error('The scaling API returned no recipe.');
      setScaled(validated);
    } catch (reason: unknown) {
      if (!request.signal.aborted) setError(reason instanceof Error ? reason.message : 'Scaling failed. Retry.');
    } finally {
      if (!request.signal.aborted) setPending(false);
    }
  }
  return <section className="panel recipe-size" aria-labelledby="size-heading">
    <h2 id="size-heading">{recipe.name} size preview</h2>
    <p>Predefined recipe only. The manual cup and “Use this recipe” still use the original base recipe.</p>
    <div className="size-controls"><label>Recipe cup size (mL)
      <input type="number" min="60" max="480" step="1" value={target} onChange={event => setTarget(event.target.value)} />
    </label><button disabled={pending} onClick={scale}>{pending ? 'Scaling...' : 'Scale recipe'}</button>
      <button disabled={!scaled || pending} onClick={() => { setScaled(undefined); setError(''); }}>Show base recipe</button></div>
    {error && <p role="alert">{error}</p>}
    <div className="size-result"><Cup layers={shown.layers} capacityMl={scaled ? shown.servingMl : 360}
      label={`${shown.name} size preview`} />
      <div><p role="status"><strong>{shown.servingMl} mL {scaled ? 'scaled serving' : 'base serving'}</strong></p>
        <ol className="breakdown scale-breakdown">{shown.layers.map((layer, index) => <li key={index}>
          <span>{ingredients[layer.ingredient].name}</span><strong data-scaled-amount={layer.amountMl}>{layer.amountMl} mL</strong>
          {layer.amountMl === 0 && <span>Rounded to zero at this size</span>}
        </li>)}</ol>
        <p className="hint">Integer amounts conserve total volume. Rounding ties follow assembly order. Foam is illustrative occupied volume.</p>
      </div></div>
  </section>;
}
