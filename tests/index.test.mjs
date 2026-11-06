import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHorspool } from '../dist/esm/index.js';
test('Horspool shifts overlaps no match and longer pattern', () => {
  assert.deepEqual(createHorspool('ana').findAll('bananana'), [1, 3, 5]);
  assert.deepEqual(createHorspool('aaaa').findAll('aaaaaa'), [0, 1, 2]);
  assert.deepEqual(createHorspool('ab').findAll('xxxx'), []);
  assert.deepEqual(createHorspool('long').findAll('a'), []);
});
test('UTF16 code-unit offsets and controls', () => {
  assert.deepEqual(createHorspool('😀').findAll('x😀😀'), [1, 3]);
  assert.deepEqual(createHorspool('\ude00').findAll('😀'), [1]);
  assert.deepEqual(createHorspool('\0').findAll('a\0b'), [1]);
});
test('empty pattern and invalid pattern budgets rejected', () => {
  for (const pattern of ['', null, 2]) assert.throws(() => createHorspool(pattern), TypeError);
  assert.throws(() => createHorspool('aa', { maxPattern: 1 }), TypeError);
  assert.throws(() => createHorspool('a', { maxPattern: Infinity }), RangeError);
});
test('start offsets and exact result/input boundaries', () => {
  const search = createHorspool('a');
  assert.deepEqual(search.findAll('aaa', { start: 1, maxMatches: 2, maxInput: 3 }), [1, 2]);
  assert.deepEqual(search.findAll('aaa', { start: 3 }), []);
  for (const start of [-1, 4, 0.5])
    assert.throws(() => search.findAll('aaa', { start }), RangeError);
  assert.throws(() => search.findAll('aaa', { maxMatches: 2 }), RangeError);
  assert.throws(() => search.findAll('aaa', { maxInput: 2 }), TypeError);
  assert.throws(() => search.findAll('', { maxMatches: 0 }), RangeError);
});
test('returned arrays and options are not retained', () => {
  const search = createHorspool('a', Object.freeze({ maxPattern: 1 }));
  const found = search.findAll('aa');
  found.length = 0;
  assert.deepEqual(search.findAll('aa'), [0, 1]);
});
test('seeded independent naive UTF16 oracle, 700 cases', () => {
  let seed = 365;
  const random = (n) => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return seed % n;
  };
  const word = (n) =>
    Array.from({ length: n }, () => ['a', 'b', 'c', '\ud83d', '\ude00', '\0'][random(6)]).join('');
  for (let trial = 0; trial < 700; trial++) {
    const text = word(random(80)),
      pattern = word(1 + random(9)),
      start = random(text.length + 1),
      expected = [];
    for (let i = start; i + pattern.length <= text.length; i++)
      if (text.slice(i, i + pattern.length) === pattern) expected.push(i);
    assert.deepEqual(createHorspool(pattern).findAll(text, { start }), expected);
  }
});
test('CJS surface', () => {
  assert.deepEqual(
    createRequire(import.meta.url)('../dist/cjs/index.js')
      .createHorspool('a')
      .findAll('ba'),
    [1],
  );
});
