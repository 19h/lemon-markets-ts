import fetch from 'node-fetch';

const PROD_ENDPOINT = 'api.lemon.markets';

const get = <T>(
    url: string,
    query?: { [k: string]: string | number; },
): Promise<T> => {
    await fetch(
        'https://api.lemon.markets/rest/v1/data/instruments/',
        {
            headers: {
                Authorization: 'Token 0b04f6bfe0edb77af8941d05b34179404cc3ad55',
            },
        },
    );
};

class LemonMarkets {
    constructor(
        private _token: string,
    ) {

    }

    public get_instruments()
}

(
    async () => {
        const response = await fetch(
            'https://api.lemon.markets/rest/v1/data/instruments/',
            {
                headers: {
                    Authorization: 'Token 0b04f6bfe0edb77af8941d05b34179404cc3ad55',
                },
            },
        );

        const json = await response.json();

        console.log(json);
    }
)();