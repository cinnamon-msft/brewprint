import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Cup } from './Cup';

it('uses actual fill fraction, with a 30mL layer in a 360mL cup', () => {
  const markup = renderToStaticMarkup(<Cup capacityMl={360} label="Test"
    layers={[{ ingredient: 'espresso', amountMl: 30 }]} />);
  expect(markup).toContain('height="15.333333333333332"');
  expect(markup).toContain('y="204.66666666666666"');
  expect(markup).toContain('330 mL remaining');
});
it('leaves empty cups empty and full cups exactly full', () => {
  const empty = renderToStaticMarkup(<Cup capacityMl={360} label="Empty" layers={[]} />);
  expect(empty).not.toContain('data-layer=');
  expect(empty).not.toContain('data-callout=');
  const full = renderToStaticMarkup(<Cup capacityMl={360} label="Full" layers={[{ ingredient: 'water', amountMl: 360 }]} />);
  expect(full).toContain('height="184"');
  expect(full).toContain('y="36"');
});

it('labels actual layers, merging adjacent additions but preserving separated layers', () => {
  const markup = renderToStaticMarkup(<Cup capacityMl={360} label="Custom" layers={[
    { ingredient: 'espresso', amountMl: 30 }, { ingredient: 'espresso', amountMl: 30 },
    { ingredient: 'steamed-milk', amountMl: 30 }, { ingredient: 'espresso', amountMl: 30 },
  ]} />);
  expect(markup.match(/data-callout=/g)).toHaveLength(3);
  expect(markup).toContain('data-callout="espresso" data-amount="60"');
  expect(markup).toContain('data-callout="espresso" data-amount="30"');
  expect(markup).toContain('Steamed milk');
  expect(markup).toContain('60 mL');
});
