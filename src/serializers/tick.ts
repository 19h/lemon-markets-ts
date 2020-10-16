import * as t from 'io-ts';
import { buildOptionalCodec, buildPaginationCodec, buildRetCodec, optionalNumberCodec } from './sharedSerializers';
import { instrumentSerializer } from './instrument';

const tickOrdering = [
    t.literal('date'),
    t.literal('-date'),
] as const;

export const tickOrderingSerializer = t.union([ ...tickOrdering ]);

export const tickListRequestSerializer =
    buildRetCodec({
        offset: optionalNumberCodec,
        limit: optionalNumberCodec,

        ordering: buildOptionalCodec(tickOrderingSerializer),

        date_until: optionalNumberCodec,
        date_from: optionalNumberCodec,
    });

export const tickSerializer =
    buildRetCodec({
        price: t.number,
        date: t.number,
    });

export type Tick = t.TypeOf<typeof tickSerializer>;
export type TickResponse = Tick;

export const paginatedTickResponseSerializer =
    buildPaginationCodec(
        tickSerializer,
    );

export type PaginatedTickResponse = t.TypeOf<typeof paginatedTickResponseSerializer>;
