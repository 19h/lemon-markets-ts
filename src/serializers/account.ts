import * as t from 'io-ts';
import { buildPaginationCodec, buildRetCodec } from './sharedSerializers';

export const accountResponseSerializer =
    buildRetCodec({
        name: t.string,
        type: t.string,
        currency: t.string,
        uuid: t.string,
    });

export const accountStateResponseSerializer =
    buildRetCodec({
        cash_to_invest: t.number,
        total_balance: t.number,
    });

export type Account = t.TypeOf<typeof accountResponseSerializer>;

export type AccountResponse = Account;
export type AccountStateResponse = t.TypeOf<typeof accountStateResponseSerializer>;

export const paginatedAccountResponseSerializer =
    buildPaginationCodec(
        accountResponseSerializer,
    );

export type PaginatedAccountResponse = t.TypeOf<typeof paginatedAccountResponseSerializer>;
