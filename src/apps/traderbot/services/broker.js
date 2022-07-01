const Feed = require('./feed');
const { v4: uuid } = require('uuid');
const binance = require('./exchanges/binance');
const { AsyncLock } = require('../utils');

class Broker {

    constructor({ isLive, asset, base }) {
        this.isLive = isLive;
        this.asset = asset;
        this.base = base;
        this.orderType = 'MARKET';  // hardcode this to market for now
        this.state = 'idle';
        this.tokens = {};
        this.callbacks = {}; // TODO: maybe create a queue of jobs
        this.orders = {};

        this.feed = new Feed({ 
            asset, base,
            onUpdate: async (data) => { await this.onUpdate(data) }, 
            onError: (error) => { this.onError(error) } 
        });

        // console.log('Broker Created');
    }

    start() {
        this.state = 'running';

        // binance.getExchangeInfo();
        // binance.getAccountInfo();
        // binance.getAccountTradeList('ETHUSDT');
        // binance.getServerTime();
        // binance.getOrderBook('ETHUSDT', 10); // symbol, limit
        // binance.getCurrentAvgPrice('ETHUSDT');
        // binance.get24HrTickerPriceChangeStats('ETHUSDT');
        // binance.getSymbolPriceTicker('ETHUSDT');
        // binance.getSymbolOrderBookTicker('ETHUSDT');
        // binance.getAllAccountOrders('ETHUSDT');
        // binance.getRecentTradesList('ETHUSDT', 10); // symbol, limit
        // binance.getCurrentOpenOrders();
        
        // console.log('Start Secure Feed');
        // // start the user feed
        // try { 
        //     this.feed.start(); 
        //     //this.feed.timedStop(15000);
        // }
        // catch(err) { 
        //     // this.feed.reconnect(); 
        //     // //this.feed.timedStop(15000);
        // }
    }

    async buy({ price, funds, oid, trade }) {

        const side = 'BUY';

        if (!this.isLive) {
            return { size: funds / price, price: price }  // not a live scenario, bypass broker
        }

        // check that the broker is started
        if (this.state !== 'running') { 
            return null 
        }

        console.log(`Broker attempting to buy with price: ${price}, funds: ${funds} `)

        let order_data;

        switch (trade) {

            // is this a new LONG trade being created?
            case 'open_long':       

                // check if the funds are available in account
                const accountInfo = await binance.getAccountInfo();
                const availBaseAsset = accountInfo.balances.filter(balance => balance.asset === this.base);
                console.log('Available Base Asset: ', availBaseAsset);
                // if (!availBaseAsset) { return null }

                const freeFunds = parseFloat(availBaseAsset[0].free);
                console.log('Free funds: ', freeFunds, this.base);
                if (freeFunds < funds) {    // cannot proceed if the specific asset e.g. USDT is < funds
                    console.log('Insufficient Funds');
                    // return null;  // ignore for now
                }

                // access control pattern - TODO: implement queue
                this.state = 'buying';
                const token = uuid();
                this.tokens[token] = 'buy';

                switch(this.orderType) {
                    case 'MARKET':
                        order_data = this.generateMarketData({ token, funds, side });  // binance can calculate required size
                        // console.log('generating market buy data')
                        break;
                    case 'LIMIT':
                        const size = funds / price;
                        order_data = this.generateLimitData({ token, size, price, side });    
                        // console.log('generating limit buy data')
                        break;
                    default:
                        order_data = this.generateMarketOrder({ token, funds, side });    
                        break;
                }
        
                try {       
                    const lock = new AsyncLock()
                    await lock.promise
                    lock.enable()
        
                    const orderResponse = await binance.createOrder(order_data); 
                    if (!orderResponse) {
                        this.state = 'running';
                        throw new Error('Unable to create order');
                    }
        
                    // collect the order details (Id, BuyPrice, Qty, etc from the order object)
                    const executed_size = parseFloat(orderResponse.executedQty);
                    const executed_price = parseFloat(orderResponse.price);
                    const clientOrderId = orderResponse.clientOrderId;
        
                    // ensure the order is filled??
                    const filled = orderResponse.status == 'FILLED' ? true : false;
                    // console.log('Order filled: ', filled)
        
                    // If NOT filled: 
                    // can execute a timed loop (elsewhere) to check status, else wait on the auth feed webservice
                    const qOrderResponse = await binance.getOrder({ symbol: `${this.asset}${this.base}`, orderId: orderResponse.orderId }); 
                    // console.log('Query Order Status: ', qOrderResponse.status); 
        
                    lock.disable()  // setTimeout(() => lock.disable(), 3000)  
                    this.state = "running";
                    
                    return { size: executed_size, price: executed_price, oid: clientOrderId } // return filled;
                }
                catch(error) {
                    this.state = 'running';
                    throw new Error(error.message)
                }

            // is this an existing SHORT trade being exited?
            case 'close_short':    

                switch(this.orderType) {
                    case 'MARKET':  
                        order_data = this.generateMarketData({ token: oid, size, side });  // binance can calculate required size
                        // console.log('generating market sell data')
                        break;
                    case 'LIMIT':
                        order_data = this.generateLimitData({ token: oid, size, price, side });    
                        // console.log('generating limit sell data')
                        break;
                    default:
                        order_data = this.generateMarketData({ token: oid, size, side });    // returns { order, funds }
                        break;
                }

                try { 
                    const lock = new AsyncLock()
                    await lock.promise
                    lock.enable()

                    const orderResponse = await binance.createOrder(order_data); 
                    if (!orderResponse) {
                        this.state = 'running';
                        throw new Error('Unable to create order');
                    }

                    // collect the order details (Id, BuyPrice, Qty, etc from the order object)
                    const executed_size = parseFloat(orderResponse.executedQty);
                    const executed_price = parseFloat(orderResponse.price);
                    const clientOrderId = orderResponse.clientOrderId;

                    // ensure the order is filled??
                    const filled = orderResponse.status == 'FILLED' ? true : false;
                    // console.log('Order filled: ', filled)

                    // If NOT filled: 
                    //  can execute a timed loop (elsewhere) to check status, else wait on the auth feed webservice
                    const qOrderResponse = await binance.getOrder({ symbol: `${this.asset}${this.base}`, orderId: orderResponse.orderId }); 
                    // console.log('Query Order Status: ', qOrderResponse.status); 

                    lock.disable()  // setTimeout(() => lock.disable(), 3000)  
                    this.state = "running";
                    
                    return { size: executed_size, price: executed_price, oid: clientOrderId } // return filled;
                }
                catch(error) {
                    this.state = 'running';
                    throw new Error(error.message)
                }
        }
    }

    async sell({ price, funds, size, oid, trade }) {

        const side = 'SELL';

        if (!this.isLive) {
            return { size: size, price: price, oid: oid }  // not a live scenario, bypass broker
        }

        // check that the broker is started
        if (this.state !== 'running') { 
            return null 
        }

        console.log(`Broker attempting to sell position ${oid} at price: ${price}, size: ${size} `)
        
        let order_data;

        switch (trade) {

            // is this an existing LONG trade being exited?
            case 'close_long':       

                // access control pattern - TODO: implement queue
                this.state = 'selling';
                const token = uuid();
                this.tokens[token] = 'sell';

                switch(this.orderType) {
                    case 'MARKET':  
                        order_data = this.generateMarketData({ token: oid, size, side });  // binance can calculate required size
                        // console.log('generating market sell data')
                        break;
                    case 'LIMIT':
                        order_data = this.generateLimitData({ token: oid, size, price, side });    
                        // console.log('generating limit sell data')
                        break;
                    default:
                        order_data = this.generateMarketData({ token: oid, size, side });    // returns { order, funds }
                        break;
                }

                try { 
                    const lock = new AsyncLock()
                    await lock.promise
                    lock.enable()

                    const orderResponse = await binance.createOrder(order_data); 
                    if (!orderResponse) {
                        this.state = 'running';
                        throw new Error('Unable to create order');
                    }

                    // collect the order details (Id, BuyPrice, Qty, etc from the order object)
                    const executed_size = parseFloat(orderResponse.executedQty);
                    const executed_price = parseFloat(orderResponse.price);
                    const clientOrderId = orderResponse.clientOrderId;

                    // ensure the order is filled??
                    const filled = orderResponse.status == 'FILLED' ? true : false;
                    // console.log('Order filled: ', filled)

                    // If NOT filled: 
                    //  can execute a timed loop (elsewhere) to check status, else wait on the auth feed webservice
                    const qOrderResponse = await binance.getOrder({ symbol: `${this.asset}${this.base}`, orderId: orderResponse.orderId }); 
                    // console.log('Query Order Status: ', qOrderResponse.status); 

                    lock.disable()  // setTimeout(() => lock.disable(), 3000)  
                    this.state = "running";
                    
                    return { size: executed_size, price: executed_price, oid: clientOrderId } // return filled;
                }
                catch(error) {
                    this.state = 'running';
                    throw new Error(error.message)
                }

            // is this a new SHORT trade being created?
            case 'open_short':       

                // check if the funds are available in account
                const accountInfo = await binance.getAccountInfo();
                const availAsset = accountInfo.balances.filter(balance => balance.asset === this.asset);
                console.log('Available Asset: ', availAsset);
                // if (!availAsset) { return null }

                const freeFunds = parseFloat(availAsset[0].free);
                console.log('Free funds: ', freeFunds, this.base);
                if (freeFunds < funds) {    // cannot proceed if the specific asset e.g. ETH is < funds
                    console.log('Insufficient Funds');
                    // return null;  // ignore for now
                }

                switch(this.orderType) {
                    case 'MARKET':
                        order_data = this.generateMarketData({ token, funds, side });  // binance can calculate required size
                        // console.log('generating market sell data')
                        break;
                    case 'LIMIT':
                        const size = funds / price;
                        order_data = this.generateLimitData({ token, size, price, side });    
                        // console.log('generating limit sell data')
                        break;
                    default:
                        order_data = this.generateMarketOrder({ token, funds, side });    
                        break;
                }
        
                try {       
                    const lock = new AsyncLock()
                    await lock.promise
                    lock.enable()
        
                    const orderResponse = await binance.createOrder(order_data); 
                    if (!orderResponse) {
                        this.state = 'running';
                        throw new Error('Unable to create order');
                    }
        
                    // collect the order details (Id, BuyPrice, Qty, etc from the order object)
                    const executed_size = parseFloat(orderResponse.executedQty);
                    const executed_price = parseFloat(orderResponse.price);
                    const clientOrderId = orderResponse.clientOrderId;
        
                    // ensure the order is filled??
                    const filled = orderResponse.status == 'FILLED' ? true : false;
                    // console.log('Order filled: ', filled)
        
                    // If NOT filled: 
                    // can execute a timed loop (elsewhere) to check status, else wait on the auth feed webservice
                    const qOrderResponse = await binance.getOrder({ symbol: `${this.asset}${this.base}`, orderId: orderResponse.orderId }); 
                    // console.log('Query Order Status: ', qOrderResponse.status); 
        
                    lock.disable()  // setTimeout(() => lock.disable(), 3000)  
                    this.state = "running";
                    
                    return { size: executed_size, price: executed_price, oid: clientOrderId } // return filled;
                }
                catch(error) {
                    this.state = 'running';
                    throw new Error(error.message)
                }
        }

    }

    generateMarketData({ token, funds, size, side }) { // either provide 'funds' or 'size'; price not required but for info
        const order = {
            symbol: `${this.asset}${this.base}`,    // 'ETHUSDT', 'BTCUSDT'
            side,                                   // BUY, SELL
            type: this.orderType,                   // MARKET, LIMIT
            client_oid: token,                      // Not used eventually / Binance provides
        };

        const amount = funds ? { funds } : { size }  // amount = funds or size
        return Object.assign(order, amount);
    }

    generateLimitData({ token, size, price, side }) {
        const order = {
            symbol: `${this.asset}${this.base}`,
            side,                           // BUY, SELL
            type: this.orderType,           // LIMIT
            client_oid: token,              // use oid instead of the provided token
            size: size,
            price: price
        };

        return Object.assign(order);
    }

    ////////////////////////////////////////////////////////////////////////////////////

    // const market = `${asset}/${base}`;

    // // All the balance for our bitcurrencies on binance
    // const balances = await binanceClient.fetchBalance();
    // // console.log(JSON.stringify(balances));

    // const assetBalance = balances.free[asset];
    // const baseBalance = balances.free[base];
    // const sellVolume = assetBalance * allocation;
    // const buyVolume = (baseBalance * allocation) / marketPrice;

    // await binanceClient.createLimitSellOrder(market, sellVolume, sellPrice);
    // await binanceClient.createLimitBuyOrder(market, buyVolume, buyPrice);

    ////////////////////////////////////////////////////////////////////////////////////

    // Updates from auth user feed
    async onUpdate(data) {

        console.log(data);  // just log the data for now

        try {
            switch(data.e) {  // Binance api specific
                case 'outboundAccountPosition':
                    await this.handle_X(data);
                    break;
                case 'balanceUpdate':
                    await this.handle_X(data);
                    break;
                case 'executionReport':
                    switch (data.x) {
                        case 'NEW':     // The order has been accepted into the engine.
                            await this.handle_X(data);
                            break;
                        case 'CANCELED': // The order has been canceled by the user
                            await this.handle_X(data);
                            break;
                        case 'REPLACED ': // currently unused
                            await this.handle_X(data);
                            break;
                        case 'REJECTED': // The order has been rejected and was not processed. (This is never pushed into the User Data Stream)
                            await this.handle_X(data);
                            break;
                        case 'TRADE':    // Part of the order or all of the order's quantity has filled
                            await this.handle_X(data);
                            break;
                        case 'EXPIRED':  //  The order was canceled according to the order type's rules (e.g. LIMIT FOK orders with no fill, LIMIT IOC or MARKET orders that partially fill) or by the exchange, (e.g. orders canceled during liquidation, orders canceled during maintenance)
                            await this.handle_X(data);
                            break;
                        default:
                            break;
                    }
                case 'listStatus':
                    await this.handle_X(data);
                    break;
                default:
                    break;
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    onError(error) {

    }

    async handle_X(data) {
        
        console.log('Handle X');
    }

    // async onUpdate(data) {

    //     console.log(data);  // just log the data for now

    //     try {
    //         switch(data.type) {  // GDAX api specific
    //             case 'received':
    //                 await this.handleReceived(data);
    //                 break;
    //             case 'done':
    //                 await this.handleDone(data);
    //                 break;
    //             case 'match':
    //                 await this.handleMatch(data);
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }
    //     catch (err) {
    //         console.log(err);
    //     }
    // }

    // async handleReceived(data) { // rx from GDAX
    //     const clientId = data['client_oid'];
    //     const orderId = data['order_id'];
    //     const side = data['side'];
    //     if (this.tokens[clientId] === side) {
    //         data.filledPrice = 0;
    //         data.filledAmount = 0;
    //         this.orders[orderId] = data;
    //     }
    // }

    // async handleDone(data) {
    //     const orderId = data['order_id'];
    //     const side = data['side'];
    //     const time = new Date(data['time']);
    //     const order = this.orders[orderId];

    //     if (order) {
    //         const orderData = {
    //             time, 
    //             order: order.id,
    //             size: order.filledSize,
    //             price: order.filledPrice / order.filledSize,
    //             funds: order.filledSize * order.filledPrice
    //         }

    //         const token = order['client_old'];
    //         const lock = this.callbacks[token];
    //         lock(orderData)
    //     }
    // }

    // async handleMatch(data) {
    //     const orderId = data['taker_order_id'];
    //     const price = parseFloat(data['price']);
    //     const time = new Date(data['time']);
    //     const amount = parseFloat(data['size']);

    //     if (this.orders[orderId]) {
    //         this.orders[orderId].filledPrice += (price * amount);
    //         this.orders[orderId].filledSize += amount;
    //     }
    // }

}

module.exports = Broker;


