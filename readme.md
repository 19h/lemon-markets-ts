<h1 align="center">lemon-markets</h1>

<h5 align="center">API client for Lemon Markets, providing market data and order execution in a single API.</h5>

<div align="center">
  <a href="https://www.npmjs.com/package/lemon-markets">
    npm
  </a>
  —
  <a href="https://github.com/19h/lemon-markets-ts">
    Github
  </a>
</div>

<br />

```shell script
$ yarn add lemon-markets
```

#### Example usage

```typescript
const lm = new LemonMarkets(
    '654c8cf10500f7814f7ce5ef6cdcd8ee8c79006e',
    '48bd9fc4-7bad-45e5-e492-7d2074cd0001',
);

await lm.list_accounts();
await lm.get_account();
await lm.get_account_state();

await lm.list_transactions();
await lm.get_transaction('22eac2b1-def1-cd5a-b445-cf3a9dae6e1b');

await lm.list_positions_separate();
await lm.list_positions_aggregated();
await lm.get_position_by_isin('DE0007100000');

await lm.list_ticks('DE0007100000');
await lm.list_ticks('DE0007100000', {
    offset: 10,
    limit: 1,
});

await lm.list_ohlc_m1('DE0007100000');
await lm.get_last_ohlc_m1('DE0007100000');
```

#### License

~~ MIT License ~~

Copyright (c) 2020 Kenan Sulayman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
