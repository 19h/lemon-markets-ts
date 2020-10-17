import * as t from 'io-ts';
import {
    buildOptionalReqCodec,
    buildPaginationCodec,
    buildRetCodec,
    nullableNumberCodec,
    nullableStringCodec,
    optionalNumberCodec,
} from './sharedSerializers';
import { instrumentSerializer } from './instrument';

const orderSides = [
    t.literal('buy'),
    t.literal('sell'),
] as const;

export const orderSideSerializer = t.union([ ...orderSides ]);

const orderStates = [
    t.literal('executed'),
    t.literal('open'),
    t.literal('deleted'),
    t.literal('in_process'),
    t.literal('expired'),
] as const;

export const orderStateSerializer = t.union([ ...orderStates ]);

const orderExecutionTypes = [
    t.literal('limit'),
    t.literal('market'),
    t.literal('stop_limit'),
    t.literal('stop_market'),
] as const;

export const orderExecutionTypeSerializer = t.union([ ...orderExecutionTypes ]);

export const orderCreateRequestSerializer =
    t.type({
        instrument: t.string,
        side: t.string,
        quantity: t.number,    // same because JS but supposedly an integer aka (v | 0)
        valid_until: t.number, // float 53
        type: nullableStringCodec,
        limit_price: optionalNumberCodec,
        stop_price: optionalNumberCodec,
    });

export const orderListRequestSerializer =
    buildRetCodec({
        side: buildOptionalReqCodec(orderSideSerializer),
        status: buildOptionalReqCodec(orderStateSerializer),
        execution_type: buildOptionalReqCodec(orderExecutionTypeSerializer),

        limit: optionalNumberCodec,
        offset: optionalNumberCodec,

        created_at_until: optionalNumberCodec,
        created_at_from: optionalNumberCodec,
    });

export const orderSerializer =
    buildRetCodec({
        uuid: t.string,

        quantity: t.number,

        type: orderExecutionTypeSerializer,

        side: orderSideSerializer,
        status: orderStateSerializer,

        valid_until: nullableNumberCodec, // why on earth is this not in milliseconds :facepalm:

        limit_price: nullableNumberCodec,
        stop_price: nullableNumberCodec, // no idea if this exists. inferred from request
    });

export const orderExtendedSerializer =
    t.intersection([
        orderSerializer,
        t.type({
            instrument: instrumentSerializer,

            processed_quantity: t.number, // float 53

            created_at: t.number,
            processed_at: t.number,
            valid_until: nullableNumberCodec,

            average_price: t.number,
        }),
    ]);

export const orderCreateResponseSerializer =
    t.intersection([
        orderSerializer,
        t.type({
            instrument: t.string,
        }),
    ]);

export type Order = t.TypeOf<typeof orderSerializer>;
export type ExtendedOrder = t.TypeOf<typeof orderExtendedSerializer>;

export type OrderCreateRequest = t.TypeOf<typeof orderCreateRequestSerializer>;

export type OrderCreateResponse = t.TypeOf<typeof orderCreateResponseSerializer>;

export const paginatedOrderResponseSerializer =
    buildPaginationCodec(
        orderExtendedSerializer,
    );

export type PaginatedOrderResponse = t.TypeOf<typeof paginatedOrderResponseSerializer>;
