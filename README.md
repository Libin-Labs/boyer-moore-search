# @lp-labs/boyer-moore-search

Boyer-Moore-Horspool literal UTF-16 search with real bad-character shifts and bounded overlapping results.

Standalone original implementation; zero runtime, peer, or sibling-package dependencies. Node.js 18+, ESM and CommonJS with separate declaration trees. No browser globals are accessed at import time; compiled runtime uses only standard JavaScript APIs.

## Install

```sh
npm install @lp-labs/boyer-moore-search
```

## Quick start

```js
import { createHorspool } from '@lp-labs/boyer-moore-search';
const search = createHorspool('ana');
console.log(search.findAll('bananana')); // [1, 3, 5]
```

CommonJS exposes the same named exports:

```cjs
const api = require('@lp-labs/boyer-moore-search');
```

## Customization

```js
import { createHorspool } from '@lp-labs/boyer-moore-search';
const search = createHorspool('😀', { maxPattern: 20 });
console.log(search.findAll('x😀😀', { start: 2, maxInput: 100, maxMatches: 10 })); // [3]
```

## Semantics, limits and errors

`createHorspool(pattern, {maxPattern})` constructs the Boyer-Moore-Horspool bad-character shift table from all pattern units except the last. Search compares right-to-left and advances by the table entry for the aligned final text unit, even after a match. This preserves overlaps. This is the Horspool variant, **not** the full good-suffix Boyer-Moore algorithm and not a wrapper around indexOf.

The pattern must be a nonempty string, at most `maxPattern=100000` UTF-16 units by default. Empty patterns throw TypeError. The compiled object exposes readonly `pattern` and `findAll(text, options)`. Defaults: `start=0`, `maxInput=1000000`, `maxMatches=100000`. Start is a safe integer in [0,text.length]; start at the end returns []. Results are all matching start offsets in ascending order, no earlier than start, including overlaps.

All comparisons and offsets are **literal UTF-16 code units**. Astral characters consume two units; lone-surrogate patterns and controls/NUL are valid. There is no normalization, locale, grapheme, or case-folding claim. An offset may be inside a surrogate pair.

Invalid/empty/oversized pattern or source throws TypeError. Invalid budgets/start or excess results throw RangeError; no silent truncation occurs. Arrays are independently owned and no mutable caller state is retained. Preprocessing/storage O(pattern units/distinct units); typical shifts skip text, but worst-case search is O(nm), not guaranteed linear. Output storage O(matches).

## Complete public declaration API

The following is the complete public ESM declaration surface; CommonJS has matching declarations and runtime exports. Optional properties are omitted rather than supplied as undefined under exactOptionalPropertyTypes.

```ts
export interface HorspoolOptions {
  maxPattern?: number;
}
export interface FindOptions {
  start?: number;
  maxInput?: number;
  maxMatches?: number;
}
export interface HorspoolSearch {
  readonly pattern: string;
  findAll(text: string, options?: FindOptions): number[];
}
/** Boyer-Moore-Horspool bad-character shifts, comparing UTF-16 code units. */
export declare function createHorspool(pattern: string, options?: HorspoolOptions): HorspoolSearch;
```

## Development and verification

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test
npm run format:check
```

The offline command requires the dev tools already present in npm's cache. TypeScript ^5.9.3 and Prettier ^3.6.2 are dev-only. Build targets ES2022 with strict NodeNext declarations, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noUnused checks, ES2022/DOM libs and no ambient type packages. Runtime tests import the ESM distribution directly and check CommonJS parity. Bare-package .mts/.cts consumer tests include negative type assertions. Published files are only dist, this README, LICENSE and package.json. No publication is performed by tests.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
