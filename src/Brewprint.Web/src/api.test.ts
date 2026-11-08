import { expect, it, vi, afterEach } from 'vitest';
import { fetchRecipes, parseRecipes } from './api';

const espresso = { id: 'espresso', name: 'Espresso', description: 'A small coffee', servingMl: 30,
  layers: [{ ingredient: 'espresso', amountMl: 30 }] };

afterEach(() => vi.unstubAllGlobals());
it('accepts valid recipes', () => expect(parseRecipes([espresso])).toEqual([espresso]));
it.each([null, [], [{}], [espresso, espresso], [{ ...espresso, servingMl: 31 }],
  [{ ...espresso, servingMl: Infinity }], [{ ...espresso, layers: [{ ingredient: 'mystery', amountMl: 30 }] }],
  [{ ...espresso, layers: [{ ingredient: 'espresso', amountMl: -30 }] }],
])('rejects malformed recipe data %j', value => expect(() => parseRecipes(value)).toThrow('invalid data'));
it('surfaces non-success API responses', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Down', { status: 503 })));
  await expect(fetchRecipes(new AbortController().signal)).rejects.toThrow('HTTP 503');
});
it('surfaces malformed JSON without a sample-data fallback', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>not JSON</html>')));
  await expect(fetchRecipes(new AbortController().signal)).rejects.toThrow();
});
