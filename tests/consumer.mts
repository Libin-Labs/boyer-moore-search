import {
  createHorspool,
  type HorspoolOptions,
  type FindOptions,
  type HorspoolSearch,
} from '@lp-labs/boyer-moore-search';
const options: HorspoolOptions = { maxPattern: 100 };
const search: HorspoolSearch = createHorspool('ana', options);
const query: FindOptions = { start: 1, maxMatches: 5 };
const matches: number[] = search.findAll('banana', query);
// @ts-expect-error pattern must be text
createHorspool(1);
// @ts-expect-error offset must be numeric
search.findAll('abc', { start: '1' });
void matches;
