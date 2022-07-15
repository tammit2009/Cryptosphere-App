
const proxyUrl = 'http://localhost:5000';

// Args
const symbol = 'BTCBUSD';
const interval = '15m';
const lookback = (240 * 15).toString();

// Fetch the data at intervals
// setInterval(fetchData, 2000);
fetchData();

// Fetch the data
function fetchData() {
    getBinanceKlinesSR(symbol, interval, lookback);
};

// getBinanceKlinesSR(20);
function getBinanceKlinesSR(symbol, interval, lookback) {
    // testPlot6();

    var request = new XMLHttpRequest();
    request.open('GET', `${proxyUrl}/proxy/mlearnpy/binance_klines_sar?symbol=${symbol}&interval=${interval}&lookback=${lookback}`, true); // true = asynchronously
    request.onload = function() {
        responseData = JSON.parse(request.responseText);
        plotSupportResistance(responseData);
    }
    request.send();
}


