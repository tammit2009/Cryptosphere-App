
const axios = require('axios');

const mlearnpyBaseUrl = 'https://deimos.kustomlynx.net';  // Our Python MLearn Proxy

const primitives = {};


/************************************/
/***** PYTHON BINANCE ENDPOINTS *****/
/************************************/

// Proxy provided to handle python requests in a native datascience environment.

// Basic Binance KLines 
// url: GET /api/v1/mlearn/binancedata?symbol=BTCBUSD&interval=1m&lookback=30
// parameters: symbol, interval, lookback
primitives.getBinanceKlines = async function({ symbol, interval, lookback }) {
    
    if (!symbol)   return { errorCode: -2, data: `Symbol required.` };
    if (!interval) return { errorCode: -2, data: `Interval required.` };
    if (!lookback) return { errorCode: -2, data: `Lookback required.` };

    // https://deimos.kustomlynx.net/api/v1/mlearn/binancedata?symbol=BTCBUSD&interval=1m&lookback=30

    let endpoint = `/api/v1/mlearn/binancedata?symbol=${symbol}&interval=${interval}&lookback=${lookback}`;

    // console.log(`${mlearnpyBaseUrl}${endpoint}`);

    try {
        const result = await axios.get(`${mlearnpyBaseUrl}${endpoint}`, {});
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


// Processed Binance KLines - Support & Resistance
// url: GET /api/v1/mlearn/binance_klines_sar?symbol=BTCBUSD&interval=1m&lookback=30
// parameters: symbol, interval, lookback
primitives.getBinanceKlinesSR = async function({ symbol, interval, lookback }) {
    
    if (!symbol)   return { errorCode: -2, data: `Symbol required.` };
    if (!interval) return { errorCode: -2, data: `Interval required.` };
    if (!lookback) return { errorCode: -2, data: `Lookback required.` };

    // Endpoint: 'https://deimos.kustomlynx.net/api/v1/mlearn/binance_klines_sar?symbol=BTCBUSD&interval=1m&lookback=30'
    let endpoint = `/api/v1/mlearn/binance_klines_sar?symbol=${symbol}&interval=${interval}&lookback=${lookback}`;

    try {
        const result = await axios.get(`${mlearnpyBaseUrl}${endpoint}`, {});
        return result.data;
    }
    catch (err) {
        return { errorCode: -1001, data: err.message };
    }   
};


module.exports = primitives;