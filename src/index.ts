import * as querystring from 'querystring';

import fetch from 'node-fetch';
import { Decoder } from 'io-ts';
import { result_from_either, result_from_promise } from './types/result';
import {
    accountResponseSerializer,
    accountStateResponseSerializer,
    paginatedAccountResponseSerializer,
} from './serializers/account';
//import { PathReporter } from 'io-ts/PathReporter';
import {
    paginatedTransactionsSerializer,
    TransactionListRequest,
    transactionListRequestSerializer,
    transactionSerializer,
} from './serializers/transaction';
import {
    paginatedPortfolioPositionsResponseSerializer,
    portfolioPositionListRequestSerializer,
    portfolioPositionListSerializer,
    PortfolioPositionRequest,
} from './serializers/portfolio';
import {
    paginatedTickResponseSerializer,
    TickListRequest,
    tickListRequestSerializer,
    tickSerializer,
} from './serializers/tick';
import {
    OhlcListRequest,
    ohlcListRequestSerializer,
    ohlcSerializer,
    paginatedOhlcResponseSerializer,
} from './serializers/ohlc';
import WebSocket, { Data } from 'ws';
import { EventEmitter } from 'events';
import { StreamMessage, streamMessageSerializer, streamTickSerializer } from './serializers/websocket';

const API_ENDPOINT = 'api.lemon.markets';

type BasePayload = { [k: string]: string | number | undefined; } | null;

const checked_request = async <DRes, DReq extends BasePayload = null>(
    token: string,
    path: string,
    method: 'get' | 'post',
    responseSerializer: Decoder<unknown, DRes>,
    requestSerializer?: Decoder<unknown, DReq>,
    payload?: DReq,
): Promise<DRes> => {
    if (requestSerializer && payload) {
        // validate request payload
        result_from_either(
            requestSerializer.decode(payload),
        )
            // and throw if it failed
            .unwrap();
    }

    const url = [
        'https://',
        API_ENDPOINT,
        path,
        (method === 'get' && payload)
            ? querystring.encode(payload!)
            : '',
    ].join('');

    const response = await result_from_promise(
        fetch(
            url,
            {
                headers: {
                    Authorization: ['Token', token].join(' '),
                },
                // we would not reach this place if the playload was invalid
                body: method === 'post' ? JSON.stringify(payload) : undefined,
            },
        ),
    );

    return response
        .map(res =>
            (res.json() as Promise<DRes>)
                .then(val =>
                    (
                        //console.log(val, PathReporter.report(responseSerializer.decode(val))),
                        result_from_either(
                            responseSerializer.decode(val),
                        ).unwrap()
                    ),
                ),
        )
        .unwrap();
};

export class LemonMarketsStream extends EventEmitter {
    private readonly _opQueue: string[];

    private _socket: WebSocket;
    private _socketReady: boolean;
    private _ingestActive: boolean;

    constructor(
        //private _token: string, // authentication is not yet required
    ) {
        super();

        this._socketReady = false;
        this._ingestActive = false;

        this._opQueue = [];

        this._reconnect();
    }

    private _reconnect() {
        if (this._socket) {
            this._socket.terminate();
        }

        this._socketReady = false;

        this._socket = new WebSocket(
            `https://${API_ENDPOINT}/streams/v1/marketdata`,
        );

        this._socket.on(
            'open',
            () => {
                this._socketReady = true;

                this._tryIngest();
            },
        );

        this._socket.on(
            'close',
            () => this._reconnect(),
        );

        this._socket.on(
            'message',
            (rawTick) =>
                this._handleTick(rawTick),
        );
    }

    private _tryIngest() {
        if (
            !this._socketReady
            || this._ingestActive
        ) {
            return;
        }

        this._ingestActive = true;

        try {
            while (this._opQueue.length !== 0) {
                this._socket
                    .send(
                        this._opQueue.shift(),
                    );
            }
        } finally {
            this._ingestActive = false;
        }
    }

    private _prepareAction(
        params: Omit<StreamMessage, 'action'>,
        action: StreamMessage['action'],
    ) {
        const msg: StreamMessage = {
            action,

            ...params,
        };

        result_from_either(
            streamMessageSerializer
                .decode(msg),
        )
            .map(validMessage => {
                this._opQueue.push(
                    JSON.stringify(
                        validMessage,
                    ),
                );

                this._tryIngest();
            });
    }

    public subscribe(param: Omit<StreamMessage, 'action'>) {
        this._prepareAction(
            param,
            'subscribe' as const,
        );
    }

    public unsubscribe(param: Omit<StreamMessage, 'action'>) {
        this._prepareAction(
            param,
            'unsubscribe' as const,
        );
    }

    private _handleTick(rawTick: Data) {
        try {
            const tickBuf = Buffer.from(rawTick);
            const plainTick = tickBuf.toString();

            const tick = JSON.parse(plainTick);

            result_from_either(
                streamTickSerializer
                    .decode(tick),
            )
                .map(validTick => {
                    this.emit(
                        'tick',
                        validTick,
                    );
                })
                .unwrap();
        } catch (err) {
            this.emit(
                'error',
                {
                    err,
                    msg: 'malformed tick',
                    data: rawTick,
                },
            );
        }
    }
}

export class LemonMarkets {
    constructor(
        private _token: string,
        private _accountId?: string,
    ) {
    }

    public with_account_id(
        accountId: string,
    ) {
        return new LemonMarkets(
            this._token,
            accountId,
        );
    }

    public list_accounts() {
        return checked_request(
            this._token,
            '/rest/v1/accounts/',
            'get',
            paginatedAccountResponseSerializer,
        );
    }

    public get_account(
        account_id?: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/accounts/${account_id || this._accountId}/`,
            'get',
            accountResponseSerializer,
        );
    }

    public get_account_state(
        account_id?: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/accounts/${account_id || this._accountId}/state/`,
            'get',
            accountStateResponseSerializer,
        );
    }

    public list_transactions(
        opts?: TransactionListRequest,
        account_id?: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/accounts/${account_id || this._accountId}/transactions/`,
            'get',
            paginatedTransactionsSerializer,
            transactionListRequestSerializer,
            opts,
        );
    }

    public get_transaction(
        transaction_id: string,
        account_id?: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/accounts/${account_id || this._accountId}/transactions/${transaction_id}/`,
            'get',
            transactionSerializer,
        );
    }

    public list_positions_separate(
        opts?: PortfolioPositionRequest,
        account_id?: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/accounts/${account_id || this._accountId}/portfolio/`,
            'get',
            paginatedPortfolioPositionsResponseSerializer,
            portfolioPositionListRequestSerializer,
            opts,
        );
    }

    public list_positions_aggregated(
        account_id?: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/accounts/${account_id || this._accountId}/portfolio/aggregated`,
            'get',
            portfolioPositionListSerializer,
        );
    }

    public get_position_by_isin(
        instrument_isin: string,
        account_id?: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/accounts/${account_id || this._accountId}/portfolio/${instrument_isin}/aggregated/`,
            'get',
            portfolioPositionListSerializer,
        );
    }

    public list_ticks(
        instrument_isin: string,
        opts?: TickListRequest,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/data/instruments/${instrument_isin}/ticks/`,
            'get',
            paginatedTickResponseSerializer,
            tickListRequestSerializer,
            opts,
        );
    }

    public get_last_tick(
        instrument_isin: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/data/instruments/${instrument_isin}/ticks/`,
            'get',
            tickSerializer,
        );
    }

    public list_ohlc_m1(
        instrument_isin: string,
        opts?: OhlcListRequest,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/data/instruments/${instrument_isin}/candle/m1/`,
            'get',
            paginatedOhlcResponseSerializer,
            ohlcListRequestSerializer,
            opts,
        );
    }

    public get_last_ohlc_m1(
        instrument_isin: string,
    ) {
        return checked_request(
            this._token,
            `/rest/v1/data/instruments/${instrument_isin}/candle/m1/latest/`,
            'get',
            ohlcSerializer,
        );
    }
}
