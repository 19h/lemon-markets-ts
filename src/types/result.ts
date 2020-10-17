/*
homegrown reimplementation of rust Result, a monadic
structure to simplify error handling in a sane way.
*/

import { Either } from 'fp-ts/Either';

export type Result<T, E> = ResultOk<T, E> | ResultErr<T, E>;

export class ResultOk<T, E> {
    readonly _tag: 'Ok' = 'Ok';
    readonly _T!: T;
    readonly _E!: E;

    constructor(readonly value: T) {
    }

    is_ok(): this is ResultOk<T, E> {
        return true;
    }

    is_err(): this is never {
        return false;
    }

    map<U>(fn: (arg: T) => U): Result<U, E> {
        return new ResultOk<U, E>(fn(this.value));
    }

    map_or_else<U>(fn_ok: (arg: T) => U, fn_err: (arg: E) => U): U {
        return fn_ok(this.value);
    }

    map_err<U>(fn: (arg: E) => U): Result<T, U> {
        return this as any;
    }

    and<U>(res: Result<U, E>): Result<U, E> {
        return res;
    }

    and_then<U>(fn: (arg: T) => Result<U, E>): Result<U, E> {
        return fn(this.value);
    }

    or<U>(res: Result<U, E>): Result<U, E> {
        return this as any;
    }

    or_else<U>(fn: (arg: E) => Result<T, U>): Result<T, U> {
        return this as any;
    }

    unwrap_or(optb: T): T {
        return this.value;
    }

    unwrap_or_else(fn: (arg: E) => T): T {
        return this.value;
    }

    unwrap(): T {
        return this.value;
    }
}

export class ResultErr<T, E> {
    readonly _tag: 'Err' = 'Err';
    readonly _T!: T;
    readonly _E!: E;

    constructor(readonly value: E) {
    }

    is_ok(): this is never {
        return false;
    }

    is_err(): this is ResultErr<T, E> {
        return true;
    }

    map<U>(fn: (arg: T) => U): Result<U, E> {
        return this as any;
    }

    map_or_else<U>(fn_ok: (arg: T) => U, fn_err: (arg: E) => U): U {
        return fn_err(this.value);
    }

    map_err<U>(fn: (arg: E) => U): Result<T, U> {
        return new ResultErr<T, U>(fn(this.value));
    }

    and<U>(res: Result<U, E>): Result<U, E> {
        return this as any;
    }

    and_then<U>(fn: (arg: T) => Result<U, E>): Result<U, E> {
        return this as any;
    }

    or<U>(res: Result<U, E>): Result<U, E> {
        return res;
    }

    or_else<U>(fn: (arg: E) => Result<T, U>): Result<T, U> {
        return fn(this.value);
    }

    unwrap_or(optb: T): T {
        return optb;
    }

    unwrap_or_else(fn: (arg: E) => T): T {
        return fn(this.value);
    }

    unwrap(): never {
        throw new Error('Called Result.unwrap() on an Err value: ' + this.value);
    }
}

export const Ok = <T, >(val: T) => {
    return new ResultOk<T, never>(val);
};

export const Err = <E, >(val: E) => {
    return new ResultErr<never, E>(val);
};

export const result_from_either = <T, E>(val: Either<E, T>): Result<T, E> => {
    if (val._tag === 'Right') {
        return new ResultOk<T, never>(val.right);
    }

    if (val._tag === 'Left') {
        return new ResultErr<never, E>(val.left);
    }

    return null as never;
};

export const result_from_promise = async <T, E=any>(val: Promise<T>): Promise<Result<T, E>> => {
    try {
        return new ResultOk<T, never>(await val);
    } catch (err) {
        return new ResultErr<never, E>(err);
    }
};
