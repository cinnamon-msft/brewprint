import { useEffect, useReducer, useState } from 'react';
import { fetchRecipes } from './api';
import { builderReducer, initialBuilder } from './builder';
import { Cup } from './Cup';
import { filterRecipes } from './filterRecipes';
import { cupCapacityMl, ingredientIds, ingredients, isIngredientId, mergeLayers, totalMl, type IngredientId, type Layer, type Recipe } from './model';

function Breakdown({ layers }: { layers: readonly Layer[] }) {
  return <ol className="breakdown" aria-label="Ingredients, bottom to top">
    {mergeLayers(layers).map((layer, index) => <li key={index}>
      <span className="swatch" style={{ background: ingredients[layer.ingredient].color }} aria-hidden="true" />
      <span>{ingredients[layer.ingredient].name}</span><strong>{layer.amountMl} mL</strong>
    </li>)}
  </ol>;
}

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedId, setSelectedId] = useState('latte');
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientId[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [builder, dispatch] = useReducer(builderReducer, initialBuilder);
  const [dragActive, setDragActive] = useState(false);
  const [overCup, setOverCup] = useState(false);
  const visibleRecipes = filterRecipes(recipes, selectedIngredients);
  const selected = visibleRecipes.find(recipe => recipe.id === selectedId) ?? visibleRecipes[0];
  const filled = totalMl(builder.additions);
  const present = ingredientIds.filter(id => builder.additions.some(layer => layer.ingredient === id));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchRecipes(controller.signal).then(data => {
      setRecipes(data);
      setLoading(false);
    }).catch((reason: unknown) => {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason.message : 'Unable to load recipes. Check the backend and retry.');
      setLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  return <>
    <a className="skip-link" href="#workbench">Skip to coffee builder</a>
    <header className="masthead">
      <div className="brand-mark" aria-hidden="true">B</div>
      <div><p className="eyebrow">The illustrated espresso bar</p><h1>Brewprint<span>.</span></h1></div>
      <p className="header-note">A little coffee knowledge.<br />A cup of your own.</p>
    </header>
    <main>
      <section className="gallery-section" aria-labelledby="menu-heading">
        <div className="section-heading"><div><p className="eyebrow">01 / The house menu</p>
          <h2 id="menu-heading">Every drink has a story.</h2></div>
          <p>Choose a classic to see what goes into it.</p></div>
        {loading && <p role="status" className="notice">Opening the recipe book...</p>}
        {error && <div role="alert" className="error"><h3>The recipe book couldn’t open.</h3>
          <p>{error}</p><button onClick={() => setAttempt(value => value + 1)}>Retry recipes</button></div>}
        {!loading && !error && <div className="menu-filters">
          <fieldset><legend>Contains every selected ingredient</legend>
            {ingredientIds.map(id => <label key={id}>
              <input type="checkbox" checked={selectedIngredients.includes(id)} onChange={event =>
                setSelectedIngredients(current => event.target.checked ? [...current, id] : current.filter(value => value !== id))} />
              {ingredients[id].name}
            </label>)}
          </fieldset>
          <button disabled={!selectedIngredients.length} onClick={() => setSelectedIngredients([])}>Reset filters</button>
          <p role="status">{visibleRecipes.length} of {recipes.length} drinks match.</p>
        </div>}
        {!loading && !error && visibleRecipes.length === 0 && <div className="notice">
          <h3>No drinks match these ingredients.</h3><p>Try fewer ingredients, or reset to see the full house menu.</p>
          <button onClick={() => setSelectedIngredients([])}>Show all drinks</button>
        </div>}
        {!loading && !error && <div className="recipe-gallery">
          {visibleRecipes.map(recipe => <button className={`recipe-tile ${selected?.id === recipe.id ? 'selected' : ''}`}
            key={recipe.id} aria-pressed={selected?.id === recipe.id} onClick={() => setSelectedId(recipe.id)}>
            <span className="tile-name">{recipe.name}</span>
            <Cup layers={recipe.layers} capacityMl={cupCapacityMl} label={`${recipe.name} recipe illustration`} />
            <span className="tile-footer"><span>{recipe.servingMl} mL</span>
              <span>{selected?.id === recipe.id ? 'Selected' : 'Explore'}</span></span>
          </button>)}
        </div>}
      </section>

      <div className="workbench" id="workbench" tabIndex={-1}>
        <section className="recipe-detail panel" aria-labelledby="recipe-heading">
          <p className="eyebrow">02 / Behind the drink</p>
          <h2 id="recipe-heading">{selected && !error ? selected.name : 'The recipe book'}</h2>
          {selected && !error && !loading ? <>
            <p>{selected.description}</p>
            <div className="detail-cup"><Cup layers={selected.layers} capacityMl={cupCapacityMl}
              label={`${selected.name}: ingredient layers`} /></div>
            <p className="volume-note">{selected.servingMl} mL serving / shown in a 360 mL cup</p>
            <Breakdown layers={selected.layers} />
            <button className="primary wide" onClick={() => dispatch({ type: 'load', recipe: selected })}>
              Use this recipe
            </button>
            <p className="hint">Replaces your current build. Browsing the menu does not.</p>
          </> : <p>{loading ? 'Loading recipe details...' : error ?
            'Retry the recipe book above. You can still build your own cup.' :
            'No recipe matches the selected ingredients. Reset filters to read a recipe; your manual cup is unchanged.'}</p>}
        </section>

        <section className="builder panel" aria-labelledby="builder-heading">
          <div className="builder-heading"><div><p className="eyebrow">03 / Make it yours</p>
            <h2 id="builder-heading">Build a cup.</h2></div><span className="capacity-badge">360 mL cup</span></div>
          <p>Drag an ingredient into the cup, or use its Add button. Layers stack in the order you add them.</p>
          <div className="assembly">
            <div className="ingredient-tray" aria-label="Ingredient tray">
              {ingredientIds.map(id => <div key={id} className="ingredient" draggable
                data-testid={`tray-${id}`} onDragStart={event => {
                  event.dataTransfer.setData('application/x-brewprint-ingredient', id);
                  event.dataTransfer.effectAllowed = 'copy';
                  setDragActive(true);
                }} onDragEnd={() => { setDragActive(false); setOverCup(false); }}>
                <span className="swatch" style={{ background: ingredients[id].color }} aria-hidden="true" />
                <div><strong>{ingredients[id].name}</strong><span className="portion">
                  {ingredients[id].portionMl} mL{id === 'milk-foam' ? ' occupied' : ''}</span></div>
                <button aria-label={`Add ${ingredients[id].name}`} onClick={() => dispatch({ type: 'add', ingredient: id })}>Add</button>
              </div>)}
            </div>
            <div className={`drop-zone ${dragActive ? 'drag-active' : ''} ${overCup ? 'drag-over' : ''}`}
              role="region" aria-label="Cup drop target" data-testid="cup-drop-target"
              onDragOver={event => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                setOverCup(true);
              }} onDragLeave={event => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverCup(false);
              }} onDrop={event => {
                event.preventDefault();
                setDragActive(false);
                setOverCup(false);
                const id = event.dataTransfer.getData('application/x-brewprint-ingredient');
                if (isIngredientId(id)) dispatch({ type: 'add', ingredient: id });
                else dispatch({ type: 'reject', message: 'Drop an ingredient from the tray, or use an Add button. Your cup is unchanged.' });
              }}>
              <span className="drop-label">{overCup ? 'Release to add' : 'Your cutaway cup'}</span>
              <Cup layers={builder.additions} capacityMl={cupCapacityMl} label="Your custom coffee build" />
              <strong className="fill-reading" data-testid="fill-reading">{filled} / 360 mL</strong>
              <span>{cupCapacityMl - filled} mL remaining</span>
            </div>
          </div>
          <div className="builder-status" role="status" aria-live="polite" aria-atomic="true">
            <span key={builder.revision}>{builder.message}</span>
          </div>
          <div className="builder-actions">
            <button disabled={!builder.additions.length} onClick={() => dispatch({ type: 'undo' })}>Undo last addition</button>
            <button disabled={!builder.additions.length} onClick={() => dispatch({ type: 'reset' })}>Reset cup</button>
          </div>
          {builder.additions.length > 0 && <div className="custom-breakdown">
            <h3>Your layers <span className="hint">(bottom to top)</span></h3>
            <Breakdown layers={builder.additions} />
            <div className="remove-actions">{present.map(id => <button key={id}
              onClick={() => dispatch({ type: 'remove', ingredient: id })}>Remove {ingredients[id].name}</button>)}</div>
          </div>}
        </section>
      </div>
      <section className="legend" aria-label="Ingredient color legend">
        {ingredientIds.map(id => <span key={id}><i className="swatch"
          style={{ background: ingredients[id].color }} aria-hidden="true" />{ingredients[id].name}</span>)}
      </section>
    </main>
    <footer><strong>Good coffee. Clear ingredients.</strong>
      <p>Educational schematics, not barista specifications. Recipes vary by café. Foam is illustrative occupied volume,
        not liquid yield; layers show assembly order, not fluid physics. Your custom cup stays in memory only.</p>
      <span>Brewprint / Est. 2026</span></footer>
  </>;
}
