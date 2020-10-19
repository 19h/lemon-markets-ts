import * as t from 'io-ts';
import {
    buildRetCodec,
} from './sharedSerializers';

const streamMessageAction = [
    t.literal('subscribe'),
    t.literal('unsubscribe'),
] as const;

export const streamMessageActionSerializer = t.union([ ...streamMessageAction ]);

const streamMessageType = t.literal('trades');

const streamMessageSpecifier = [
    t.literal('with-quantity'),
    t.literal('with-uncovered'),
    t.literal('with-quantity-with-uncovered'),
] as const;

export const streamMessageSpecifierSerializer = t.union([ ...streamMessageSpecifier ]);

export const streamMessageSerializer =
    buildRetCodec({
        type: streamMessageType,

        action: streamMessageActionSerializer,
        specifier: streamMessageSpecifierSerializer,

        value: t.string,
    });

export const streamTickSerializer =
    buildRetCodec({
        isin: t.string,

        date: t.number,

        price: t.number,
        quantity: t.number,
    });

export type StreamMessage = t.TypeOf<typeof streamMessageSerializer>;
export type StreamTick = t.TypeOf<typeof streamTickSerializer>;
