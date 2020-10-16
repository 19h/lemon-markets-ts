import * as t from 'io-ts';
import { buildOptionalCodec, buildPaginationCodec, buildRetCodec, optionalNumberCodec } from './sharedSerializers';
import { orderingSerializer } from './ordering';

export const ohlcListRequestSerializer =
    buildRetCodec({
        offset: optionalNumberCodec,
        limit: optionalNumberCodec,

        ordering: buildOptionalCodec(orderingSerializer),

        date_until: optionalNumberCodec,
        date_from: optionalNumberCodec,
    });

export const ohlcSerializer =
    buildRetCodec({
        date: t.number,

        high: t.number,
        low: t.number,

        open: t.number,
        close: t.number,
    });

export type Ohlc = t.TypeOf<typeof ohlcSerializer>;
export type OhlcResponse = Ohlc;

export const paginatedOhlcResponseSerializer =
    buildPaginationCodec(
        ohlcSerializer,
    );

export type PaginatedOhlcResponse = t.TypeOf<typeof paginatedOhlcResponseSerializer>;
