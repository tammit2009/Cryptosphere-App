
// variables
const countEl = document.getElementById('display-count');
const curAvgPriceEl = document.getElementById('ticker-curavgprice');
const curTickerPriceEl = document.getElementById('ticker-currenttickerprice');
const bestBidPriceEl = document.getElementById('ticker-bestbidprice');
const bestAskPriceEl = document.getElementById('ticker-bestaskprice');

// socket io client
const socket = io();

socket.on('connection', console.log('Socket connection established successfully!'));

socket.on('SENTINEL_EVENT', (payload) => {
    // console.log(payload)
    countEl.innerHTML = `<h2>${payload.data.count}</h2>`;
    
    const curAvgPrice = Intl.NumberFormat().format(payload.data.curAvgPrice.toFixed(2));
    curAvgPriceEl.innerHTML = `$${curAvgPrice}`;

    const curTickerPrice = Intl.NumberFormat().format(payload.data.curTickerPrice.toFixed(2));
    curTickerPriceEl.innerHTML = `$${curTickerPrice}`;

    const bestBidPrice = Intl.NumberFormat().format(payload.data.bestObBidPrice.toFixed(2));
    bestBidPriceEl.innerHTML = `$${bestBidPrice}`;

    const bestAskPrice = Intl.NumberFormat().format(payload.data.bestObAskPrice.toFixed(2));
    bestAskPriceEl.innerHTML = `$${bestAskPrice}`;
});

// OrderBook Visualization
var symbol = document.getElementById('symbol').value;

// Number of front queues to monitor
const numBins = 20;
const numTrades = 300;

// Fetch the data at intervals
setInterval(fetchData, 2000);

// Fetch the data
function fetchData() {
    orderBookFrontQueues(numBins);
    trades(numTrades)
};

// orderBookFrontQueues(20);
function orderBookFrontQueues(numBins) {
    
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${numBins}`, true); // true = asynchronously
    ourRequest.onload = function() {
        ourData = JSON.parse(ourRequest.responseText);

        let xAsks = 0.0, xBids = 0.0;
        
        let asks = ourData.asks.map((ask) => parseFloat(ask[1]));
        let bids = ourData.bids.map((bid) => parseFloat(bid[1]));

        xAsks = asks.reduce((acc, ask) => (acc += ask), 0.0);
        xBids = bids.reduce((acc, bid) => (acc += bid), 0.0);
        // console.log('xAsks:', xAsks, 'xBids:', xBids);

        // Display Chart
        var data = [{
            type: 'bar',
            x:['bids', 'asks'],
            y: [xBids, xAsks],
            marker: {
                color: ['rgba(3, 119, 73,0.8)', 'rgba(160, 9, 9,1)']
            },
        }];

        var layout = {
            title: "OrderBook Bids/Asks",
            height: 400
        };

        Plotly.newPlot('chartContainer', data, layout);
    }
    ourRequest.send();

    /*
    {
        "lastUpdateId": 1027024,
        "bids": [
            [
            "4.00000000",     // PRICE
            "431.00000000"    // QTY
            ]
        ],
        "asks": [
            [
            "4.00000200",
            "12.00000000"
            ]
        ]
    }
    */
}


// Recent Trades List
// trades(100);
function trades(numTrades) {
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=${numTrades}`, true); 
    ourRequest.onload = function() {
        var ourData = JSON.parse(ourRequest.responseText);
        // console.log(ourData);

        let pOurData = ourData.map((d) => {
            return {
                id: d.id,
                buyer: d.isBuyerMaker,
                price: parseFloat(d.price),
                qty: parseFloat(d.qty),
                quoteValue: parseFloat(d.quoteQty),
                time: d.time
            };
        });

        const buys = pOurData.filter((d) => d.buyer === true);
        const sells = pOurData.filter((d) => d.buyer === false);
        // console.log('buys:', buys, 'sells:', sells);

        let xBuys = 0.0, xSells = 0.0;

        const xbuys = buys.reduce((acc, buy) => (acc += parseFloat(buy.qty)), 0.0);
        const xsells = sells.reduce((acc, sell) => (acc += parseFloat(sell.qty)), 0.0);

        if (xbuys) xBuys = xbuys;
        if (xsells) xSells = xsells;
        // console.log('xBuys:', xBuys, 'xSells:', xSells);

        // Display Chart
        var data = [{
            type: 'bar',
            x:['buys', 'sells'],
            y: [xBuys, xSells],
            marker: {
                color: ['rgba(3, 119, 73,0.8)', 'rgba(160, 9, 9,1)']
            },
        }];

        var layout = {
            title: "Trades Buys/Sells",
            height: 400
        };

        Plotly.newPlot('chartContainer2', data, layout);
    }
    ourRequest.send();

    /*
    [
        {
            "id": 28457,
            "price": "4.00000100",
            "qty": "12.00000000",
            "quoteQty": "48.000012",
            "time": 1499865549590,
            "isBuyerMaker": true,
            "isBestMatch": true
        }
    ]
    */
}

// aggregateTrades();

// Compressed/Aggregate trades list
function aggregateTrades() {
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', `https://api.binance.com/api/v3/aggTrades?symbol=${symbol}&limit=500`, true); 
    ourRequest.onload = function() {
        ourData = JSON.parse(ourRequest.responseText);
        // console.log(ourData);

    }
    ourRequest.send();

    /*
    // If both startTime and endTime are sent, time between startTime and endTime must be less than 1 hour.
    // If fromId, startTime, and endTime are not sent, the most recent aggregate trades will be returned.
    [
        {
            "a": 26129,         // Aggregate tradeId
            "p": "0.01633102",  // Price
            "q": "4.70443515",  // Quantity
            "f": 27781,         // First tradeId
            "l": 27781,         // Last tradeId
            "T": 1498793709153, // Timestamp
            "m": true,          // Was the buyer the maker?
            "M": true           // Was the trade the best price match?
        }
    ]
    */
}

// ticker();

// Symbol(s) Price Ticker - Latest price for a symbol or symbols.
function ticker() { 
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, true); 
    ourRequest.onload = function() {
        ourData = JSON.parse(ourRequest.responseText);
        // console.log(ourData);

    }
    ourRequest.send();

    /*
    {
        "symbol": "LTCBTC",
        "price": "4.00000200"
    }
    // OR
    [
        {
            "symbol": "LTCBTC",
            "price": "4.00000200"
        },
        {
            "symbol": "ETHBTC",
            "price": "0.07946600"
        }
    ]
    */
}

// bookTicker();

// Symbol order book ticker - Best price/qty on the order book for a symbol or symbols.
function bookTicker() { 
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`, true); 
    ourRequest.onload = function() {
        ourData = JSON.parse(ourRequest.responseText);
        console.log(ourData);

    }
    ourRequest.send();

    /*
    {
        "symbol": "LTCBTC",
        "price": "4.00000200"
    }
    // OR
    [
        {
            "symbol": "LTCBTC",
            "price": "4.00000200"
        },
        {
            "symbol": "ETHBTC",
            "price": "0.07946600"
        }
    ]
    */
}