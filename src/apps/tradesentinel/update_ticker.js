
const primitives = require('../../services/binance/binance_primitives');

let count = 0;

exports.tickerUpdateUI = async function(ee) {
    
    // console.log(`sentinel ${count++} fired!`);

    // Process application logic here
    const avgPrice      = await primitives.getAvgPrice({ symbol: 'BTCBUSD' });
    const tickerPrice   = await primitives.getTickerPrice({ symbols: '["BTCBUSD"]' });
    const obtickerPrice = await primitives.getOrderBookTickerPrice({ symbols: '["BTCBUSD"]' });

    const data = {
        count: count++,
        curAvgPrice: avgPrice ? parseFloat(avgPrice.price) : 0.00,
        curTickerPrice: tickerPrice[0] ? parseFloat(tickerPrice[0].price) : 0.00,
        bestObBidPrice: obtickerPrice[0] ? parseFloat(obtickerPrice[0].bidPrice) : 0.00,
        bestObAskPrice: obtickerPrice[0] ? parseFloat(obtickerPrice[0].askPrice) : 0.00,
    };

    // console.log(data);

    // and send event data as result payload to the server
    ee.emit('SENTINEL_EVENT', { data });
};