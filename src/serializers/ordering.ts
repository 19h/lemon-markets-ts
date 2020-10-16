import * as t from 'io-ts';

const ordering = [
    t.literal('date'),
    t.literal('-date'),
] as const;

export const orderingSerializer = t.union([ ...ordering ]);
