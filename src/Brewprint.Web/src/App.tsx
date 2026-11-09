import { useEffect, useReducer, useRef, useState } from 'react';
import { fetchRecipes } from './api';
import { builderReducer, initialBuilder } from './builder';
import { Cup } from './Cup';
import { IngredientIcon } from './IngredientIcon';
import { cupCapacityMl, findMatchingRecipe, ingredientIds, ingredients, isIngredientId, mergeLayers, totalMl, type Layer, type Recipe } from './model';

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
  const [mode, setMode] = useState<'recipe' | 'builder'>('recipe');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [builder, dispatch] = useReducer(builderReducer, initialBuilder);
  const [dragActive, setDragActive] = useState(false);
  const [overCup, setOverCup] = useState(false);
  const cupScene = useRef<HTMLDivElement>(null);
  const selected = recipes.find(recipe => recipe.id === selectedId) ?? recipes[0];
  const ready = !loading && !error && selected !== undefined;
  const layers = mode === 'builder' ? builder.additions : ready ? selected.layers : [];
  const filled = totalMl(layers);
  const present = ingredientIds.filter(id => builder.additions.some(layer => layer.ingredient === id));
  const matchedRecipe = ready ? findMatchingRecipe(builder.additions, recipes) : undefined;

  function changeMode(next: 'recipe' | 'builder') {
    setMode(next);
    setDragActive(false);
    setOverCup(false);
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchRecipes(controller.signal).then(data => {
      if (controller.signal.aborted) return;
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
    <a className="skip-link" href="#workbench">Skip to cup display</a>
    <header className="masthead">
      <a className="wordmark" href="/" aria-label="Brewprint home">Brewprint<span aria-hidden="true">.</span></a>
      <span className="header-note">THE MIDNIGHT ESPRESSO BAR</span>
      <span className="header-edition">EST. 2026</span>
    </header>
    <main>
      <div className="mode-switch" role="group" aria-label="Cup mode">
        <button aria-pressed={mode === 'recipe'} onClick={() => changeMode('recipe')}>House menu</button>
        <button aria-pressed={mode === 'builder'} onClick={() => changeMode('builder')}>Build your own</button>
      </div>

      <section className={`experience ${mode === 'builder' ? 'is-building' : ''}`} id="workbench" tabIndex={-1} aria-labelledby="cup-heading">
        <div className="drink-heading">
          <p className="eyebrow">{mode === 'builder'
            ? matchedRecipe ? 'A house classic, made by you.' : 'A little imagination. Your own creation.'
            : 'Coffee, beautifully deconstructed.'}</p>
          <h1 id="cup-heading">{mode === 'builder' ? matchedRecipe?.name ?? 'Your signature cup.' : ready ? selected.name : 'The house menu.'}</h1>
          <p className="drink-description">{mode === 'builder'
            ? matchedRecipe?.description ?? 'Start with a shot. Add a little silk. Make it yours.'
            : ready ? selected.description : 'Six classics. One cup. A closer look at what goes inside.'}</p>
        </div>
        <div className={`cup-workspace ${mode === 'builder' ? 'has-ingredients' : ''}`}>
        <div ref={cupScene} className={`cup-scene ${mode === 'builder' ? 'drop-zone' : ''} ${dragActive ? 'drag-active' : ''} ${overCup ? 'drag-over' : ''}`}
          role="region" aria-label={mode === 'builder' ? 'Cup drop target' : 'Selected drink display'}
          data-testid="cup-drop-target"
          onDragOver={mode === 'builder' ? event => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            setOverCup(true);
          } : undefined}
          onDragLeave={event => {
            if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setOverCup(false);
          }}
          onDrop={mode === 'builder' ? event => {
            event.preventDefault();
            setDragActive(false);
            setOverCup(false);
            const id = event.dataTransfer.getData('application/x-brewprint-ingredient');
            if (isIngredientId(id)) dispatch({ type: 'add', ingredient: id });
            else dispatch({ type: 'reject', message: 'Drop an ingredient from the tray, or use an Add button. Your cup is unchanged.' });
          } : undefined}>
          <div className="scene-halo" aria-hidden="true" />
          <span className="scene-caption">{mode === 'builder' ? overCup ? 'Release to pour' : 'Drag ingredients into your cup' : 'THE ANATOMY OF A CLASSIC'}</span>
          <Cup layers={layers} capacityMl={cupCapacityMl}
            label={mode === 'builder' ? matchedRecipe ? `${matchedRecipe.name}: your custom build` : 'Your custom coffee build'
              : ready ? `${selected.name}: ingredient layers` : 'Empty cup, recipes unavailable'} />
          <span className="capacity-mark">360 mL <span>cutaway glass</span></span>
        </div>
        {mode === 'builder' && <aside className="ingredient-palette" aria-labelledby="ingredient-heading">
          <h2 id="ingredient-heading">Ingredients</h2>
          <p className="palette-hint">Drag to pour. Select to add.</p>
          <div className="ingredient-tray" role="group" aria-label="Ingredient tray">
            {ingredientIds.map(id => <button key={id} className="ingredient" draggable data-testid={`tray-${id}`}
              aria-label={`Add ${ingredients[id].name}`} aria-describedby={`portion-${id}`}
              onClick={() => dispatch({ type: 'add', ingredient: id })}
              onDragStart={event => {
                event.dataTransfer.setData('application/x-brewprint-ingredient', id);
                event.dataTransfer.effectAllowed = 'copy';
                const icon = event.currentTarget.querySelector('.ingredient-glyph');
                if (icon) {
                  const bounds = icon.getBoundingClientRect();
                  event.dataTransfer.setDragImage(icon, bounds.width / 2, bounds.height / 2);
                }
                setDragActive(true);
              }}
              onDragEnd={() => { setDragActive(false); setOverCup(false); }}>
              <span className="ingredient-glyph" style={{ color: ingredients[id].color }}>
                <IngredientIcon ingredient={id} />
              </span>
              <span className="ingredient-copy"><strong>{ingredients[id].name}</strong>
                <span className="portion" id={`portion-${id}`}>{ingredients[id].portionMl} mL{
                  id === 'milk-foam' && <span className="occupied-volume"> occupied</span>
                }</span>
              </span>
            </button>)}
          </div>
        </aside>}
        </div>
        <div className="cup-readout">
          <p className="fill-reading" data-testid="fill-reading"><strong>{filled}</strong><span> / 360 mL</span></p>
          <span className="remaining">{cupCapacityMl - filled} mL of room to play</span>
        </div>
        <Breakdown layers={layers} />
        {mode === 'recipe' && ready && <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Selected {selected.name}, {selected.servingMl} mL. Ingredients, bottom to top: {
            selected.layers.map(layer => `${ingredients[layer.ingredient].name} ${layer.amountMl} mL`).join(', ')
          }.
        </p>}
      </section>

      {mode === 'builder' && <section className="builder" aria-label="Cup controls">
        <div className="builder-status" role="status" aria-live="polite" aria-atomic="true">
          <span key={builder.revision}>{builder.message}</span>
          <span className="builder-recognition" data-testid="drink-recognition">
            {matchedRecipe ? `Recognized ${matchedRecipe.name}: ${filled} mL, matching the house recipe's ingredient proportions.`
              : !ready ? 'Drink recognition is unavailable until the recipe book loads. You can still build your cup.'
              : 'Match a house drink\'s ingredient proportions to discover its name. Serving size and pouring order can vary.'}
          </span>
        </div>
        <div className="builder-actions">
          <button disabled={!builder.additions.length} onClick={() => dispatch({ type: 'undo' })}>Undo last addition</button>
          <button disabled={!builder.additions.length} onClick={() => dispatch({ type: 'reset' })}>Reset cup</button>
        </div>
        {present.length > 0 && <div className="remove-actions" aria-label="Remove ingredients">
          {present.map(id => <button key={id} onClick={() => dispatch({ type: 'remove', ingredient: id })}>
            Remove {ingredients[id].name}
          </button>)}
        </div>}
      </section>}

      <section className="gallery-section" aria-labelledby="menu-heading">
        <div className="section-heading"><span className="section-rule" aria-hidden="true" />
          <h2 id="menu-heading">Find your favorite.</h2><span className="section-rule" aria-hidden="true" /></div>
        {loading && <p role="status" className="notice">Opening the recipe book...</p>}
        {error && <div role="alert" className="error"><h3>The recipe book couldn't open.</h3>
          <p>{error}</p><button onClick={() => setAttempt(value => value + 1)}>Retry recipes</button>
          <p className="hint">You can still use Build your own without the recipe API.</p></div>}
        {ready && <div className="recipe-gallery" role="group" aria-label="Choose a drink">
          {recipes.map((recipe, index) => {
            const active = mode === 'recipe' && selected.id === recipe.id;
            return <button className={`recipe-tile ${active ? 'selected' : ''}`} key={recipe.id}
              data-testid={`recipe-${recipe.id}`} aria-pressed={active}
              aria-label={`${recipe.name}, ${recipe.servingMl} mL${active ? ', selected' : ''}`}
              onClick={event => {
                setSelectedId(recipe.id);
                changeMode('recipe');
                const scene = cupScene.current;
                const bounds = scene?.getBoundingClientRect();
                if (event.detail > 0 && scene && bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
                  scene.scrollIntoView({ block: 'center',
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
                }
              }}>
              <span className="recipe-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span className="tile-name">{recipe.name}</span>
              <span className="tile-footer"><span>{recipe.servingMl} mL</span>
                <span className="selection-dot" aria-hidden="true">{active ? '\u25CF' : '\u25CB'}</span></span>
            </button>;
          })}
        </div>}
        {mode === 'recipe' && ready && <div className="recipe-load">
          <button className="primary" onClick={() => { dispatch({ type: 'load', recipe: selected }); changeMode('builder'); }}>
            Use this recipe
          </button>
          <p className="hint">Make it your starting point. Replaces your custom build; browsing never does.</p>
        </div>}
      </section>

      <p className="schematic-note">A glass of knowledge, not a fluid simulation. Foam is illustrative occupied volume.</p>
    </main>
    <footer><span className="footer-brand">Brewprint.</span><p>Recipes vary by cafe. Educational schematics, not barista specifications.
      Layers show assembly order, not fluid physics. Custom cups stay in memory only.</p><span>CRAFTED FOR CURIOSITY</span></footer>
  </>;
}
