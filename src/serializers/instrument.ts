import * as t from 'io-ts';

export const instrumentSerializer =
    t.type({
        title: t.string,
        isin: t.string,
        wkn: t.string,
    });
