import * as t from 'io-ts';
import { buildOptionalReqCodec, buildPaginationCodec, buildRetCodec, optionalNumberCodec } from './sharedSerializers';

const tickOrdering = [
    t.literal('date'),
    t.literal('-date'),
] as const;

export const tickOrderingSerializer = t.union([ ...tickOrdering ]);

export const tickListRequestSerializer =
    buildRetCodec({
        offset: optionalNumberCodec,
        limit: optionalNumberCodec,

        ordering: buildOptionalReqCodec(tickOrderingSerializer),

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

export type TickListRequest = t.TypeOf<typeof tickListRequestSerializer>;

export const paginatedTickResponseSerializer =
    buildPaginationCodec(
        tickSerializer,
    );

export type PaginatedTickResponse = t.TypeOf<typeof paginatedTickResponseSerializer>;
