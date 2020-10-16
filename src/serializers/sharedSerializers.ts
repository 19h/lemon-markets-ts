import * as t from 'io-ts';

export const buildRetCodec = <T extends t.Props>(props: T) =>
    t.readonly(t.exact(t.type(props)));

export const buildRepCodec = <T extends t.Props>(props: T) =>
    t.readonly(t.exact(t.partial(props)));

export const nullableStringCodec = t.union([ t.string, t.null ]);
export const nullableNumberCodec = t.union([ t.number, t.null ]);

export const optionalNumberCodec = t.union([ t.number, t.undefined ]);
export const optionalStringCodec = t.union([ t.number, t.undefined ]);

export const buildOptionalCodec = <T extends t.Mixed>(props: T) =>
    t.union([ props, t.undefined ]);

export const buildPaginationCodec = <T extends t.Mixed>(props: T) =>
    buildRetCodec({
        count: t.number,
        prev: nullableStringCodec,
        next: nullableStringCodec,
        results: t.readonlyArray(props),
    });
