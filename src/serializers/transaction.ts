import * as t from 'io-ts';
import {
    buildPaginationCodec,
    buildRetCodec,
    optionalNumberCodec,
} from './sharedSerializers';

export const transactionRelatedOrderSerializer =
    t.type({
        volume: t.number, // float 53
        instrument: t.string,
    });

export const transactionListRequestSerializer =
    buildRetCodec({
        offset: optionalNumberCodec,
        limit: optionalNumberCodec,

        date_until: optionalNumberCodec, // date_until vs created_at_until
        date_from: optionalNumberCodec, // date_from vs created_at_from
    });

export const transactionSerializer =
    buildRetCodec({
        uuid: t.string,
        name: t.string,

        amount: t.number,
        date: t.number,

        related_order: transactionRelatedOrderSerializer,
    });

export type TransactionListRequest = t.TypeOf<typeof transactionListRequestSerializer>;

export type Transaction = t.TypeOf<typeof transactionSerializer>;
export type TransactionResponse = Transaction;

export const paginatedOrderResponseSerializer =
    buildPaginationCodec(
        transactionSerializer,
    );

export type PaginatedTransactionResponse = t.TypeOf<typeof paginatedOrderResponseSerializer>;
