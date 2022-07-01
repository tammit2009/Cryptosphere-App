// require('dotenv').config();

// const Strategy = require('./strategy');

// class XsimpleStrategy extends Strategy {

//     constructor(data) {
//         super(data);

//         this.canBeBacktested = false;
//         this.requireHistory = false;
        
//     }

//     async run({ sticks, time }) {
//         const len = sticks.length;
//         if (len < 2) { return }

//         // console.log(sticks);

//         const penu = sticks[len-2].close;
//         const last = sticks[len-1].close;
//         const price = last;
//         const spread = 0.002    // 0.2%

//         console.log(sticks.length)
//         console.log(penu)
//         console.log(last)

//         const open = this.getOpenPositions();

//         if (open.length == 0) {   // limit to only 1 trade
//             // Buy strategy: buyPrice = marketPrice * (1 - config.spread)
//             if (last < penu * (1 - spread)) {
//                 this.onBuySignal({ price, time });  
//             }
//         }
//         else {
//             // Sell strategy: sellPrice = marketPrice * (1 + config.spread)
//             if (last > penu * (1 + spread)) { 
//                 open.forEach(p => {
//                     this.onSellSignal({ price, size: p.enter.size, time, position: p }); 
//                 });
//             }
//         }
//     }
// }

// module.exports = XsimpleStrategy;

// // Original Code:
// // ==============

// // const tick = async(config, binanceClient) => {
// //     const { asset, base, spread, allocation } = config;

// //     const market = `${asset}/${base}`;

// //     // const orders = await binanceClient.fetchOpenOrders(market);
// //     // orders.forEach(async order => {
// //     //     await binanceClient.cancelOrder(order.id);
// //     // });

// //     const results = await Promise.all([
// //         axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
// //         axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd')
// //     ]);

// //     const marketPrice = results[0].data.bitcoin.usd / results[1].data.tether.usd;
    
// //     const sellPrice = marketPrice * (1 + spread);
// //     const buyPrice = marketPrice * (1 - spread);

// //     console.log(`
// //         New tick for ${market}...
// //         Current sell price from coinGecko: ${sellPrice}
// //         Current buy price from coinGecko: ${buyPrice}
// //     `)

// //     // All the balance for our bitcurrencies on binance
// //     const balances = await binanceClient.fetchBalance();
// //     // console.log(JSON.stringify(balances));

// //     const assetBalance = balances.free[asset];
// //     const baseBalance = balances.free[base];
// //     const sellVolume = assetBalance * allocation;
// //     const buyVolume = (baseBalance * allocation) / marketPrice;

// //     // await binanceClient.createLimitSellOrder(market, sellVolume, sellPrice);
// //     // await binanceClient.createLimitBuyOrder(market, buyVolume, buyPrice);

// //     console.log(`
// //         Asset balance from Binance account: ${assetBalance}
// //         Base balance from Binance account: ${baseBalance}
// //     `)
// // }

// // const run = () => {
    
// //     const config = {
// //         asset: 'ETH',
// //         base: 'USDT',
// //         allocation: 0.1,    // % of our portfolio that can be allocated for each trade
// //         spread: 0.2,        // % applied to the mid range to create buy or sell limit order
// //         tickInterval: 30000
// //     };

// //     // console.log('apiKey:', process.env.API_KEY)
// //     // console.log('secret:', process.env.API_SECRET)

// //     const binanceClient = new ccxt.binance({
// //         apiKey: process.env.API_KEY,
// //         secret: process.env.API_SECRET
// //     });

// //     tick(config, binanceClient);
// //     setInterval(tick, config.tickInterval, config, binanceClient);
// // };

// // run();