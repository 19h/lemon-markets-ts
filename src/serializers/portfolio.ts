import * as t from 'io-ts';
import { buildPaginationCodec, buildRetCodec, optionalNumberCodec } from './sharedSerializers';
import { instrumentSerializer } from './instrument';

export const portfolioPositionListRequestSerializer =
    buildRetCodec({
        offset: optionalNumberCodec,
        limit: optionalNumberCodec,
    });

export const portfolioPositionSerializer =
    t.type({
        uuid: t.string,

        quantity: t.number,
        average_price: t.number,

        instrument: instrumentSerializer,
    });

export const portfolioPositionListSerializer =
    t.readonlyArray(portfolioPositionSerializer);

export type PortfolioPositionRequest = t.TypeOf<typeof portfolioPositionListRequestSerializer>;

export type PortfolioPosition = t.TypeOf<typeof portfolioPositionSerializer>;
export type PortfolioPositionResponse = PortfolioPosition;

export type PortfolioListAggregateResponse = t.TypeOf<typeof portfolioPositionListSerializer>;

export const paginatedPortfolioPositionsResponseSerializer =
    buildPaginationCodec(
        portfolioPositionSerializer,
    );

export type PaginatedPortfolioPositionsResponse = t.TypeOf<typeof paginatedPortfolioPositionsResponseSerializer>;
