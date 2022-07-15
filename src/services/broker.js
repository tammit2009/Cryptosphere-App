
const BufferQueue            = require('../utils/buffer_queue');
const { createRandomString } = require('../utils/helpers');

const Trade         = require('../models/trade');
const Position      = require('../models/position');
const PendingOrder  = require('../models/pendingorder');

const binance   = require('../services/binance/binance_primitives');

class Broker {

    constructor() {
        this.bq = new BufferQueue();

        // // Add 3 dummy transactions (temporary for testing)
        // this.addTransaction(this.generateId(), { name: 'task1' }, 'open');
        // this.addTransaction(this.generateId(), { name: 'task2' }, 'open');
        // this.addTransaction(this.generateId(), { name: 'task3' }, 'open');
    }

    async runTransactions() {
        
        // Check for pendingOrders
        // console.log('Checking for pendingOrders...');
        // const pendingOrders = await PendingOrder.find({});
        // if (pendingOrders) 
        //     pendingOrders.forEach((porder, i) => console.log(`pendingOrder ${i}:`, porder.orderId, porder.symbol, porder.status, porder.fillCheck));

    }

    /**********************/
    /*** Broker Methods ***/ 
    /**********************/

    // Get Account Balance information
    async getAccountBalance() {
        const orderData = {
            recvWindow: 5000,
            timestamp: new Date().getTime(),
        }
        try {
            const accountInfo = await binance.getAccountInfo(orderData);
            if (accountInfo) {
                const balances = accountInfo.balances.map((balance) => ({
                        asset: balance.asset,
                        free: parseFloat(balance.free),
                        locked: parseFloat(balance.locked)
                    })).filter((balance) => balance.free !== 0);
                return balances;
            }
            else 
                return false;
        }
        catch(err) {
            return false;
        }
    }


    // Get All Orders
    async getAllOrders(symbol, limit) {
        const orderData = { recvWindow: 5000, timestamp: new Date().getTime(), symbol, limit };
        try {
            const orders = await binance.getAllOrders(orderData);
            if (orders) 
                return orders;
            else 
                return false;
        }
        catch(err) {
            return false;
        }
    }
    

    // Get Open Orders
    async getOpenOrders(symbol, limit) {
        const orderData = { recvWindow: 5000, timestamp: new Date().getTime(), symbol, limit };
        try {
            const openOrders = await binance.getOpenOrders(orderData);
            if (openOrders) 
                return openOrders;
            else 
                return false;
        }
        catch(err) {
            return false;
        }
    }


    // Get Order by Id
    async getOrderById(orderId, symbol) {
        const orderData = { recvWindow: 5000, timestamp: new Date().getTime(), orderId, symbol, limit: 500 };
        try {
            const orders = await binance.getAllOrders(orderData);
            if (orders) {
                const specificOrder = orders.filter((order) => order.orderId == orderId);
                if (specificOrder.length > 0) {
                    return specificOrder[0];
                }
                else return false;
            }
            else return false;
        }
        catch(err) { return false; }
    }


    // Get Order Status (use this preferable to 'getOrderById' as more efficient)
    async getOrderStatus(orderId, origClientOrderId, symbol) {
        const orderData = { recvWindow: 5000, timestamp: new Date().getTime(), orderId, origClientOrderId, symbol };
        try {
            const order = await binance.getOrderStatus(orderData);
            if (order) 
                return order;
            else 
                return false;
        }
        catch(err) { return false; }
    }


    // Cancel Order
    async cancelOrder(orderId, origClientOrderId, symbol) {
        const orderData = { recvWindow: 5000, timestamp: new Date().getTime(), orderId, origClientOrderId, symbol };
        try {
            const order = await binance.cancelOrder(orderData);
            if (order) {

                // Check for the associated pendingOrder for the limit order and delete if it exists
                console.log('Checking for the pendingOrder...');
                const porder = await PendingOrder.findOne({ orderId });
                if (porder) {
                    console.log('pendingOrder:', porder.orderId, porder.symbol, porder.status, porder.fillCheck)
                    // await PendingOrder.findOneAndDelete({ orderId });
                }

                return order;
            }
            else 
                return false;
        }
        catch(err) { return false; }
    }


    // Get Latest Price of a set of symbols
    // Symbols parameter has to be a string in format: ["BTCUSDT","BNBUSDT"] or [%22BTCUSDT%22,%22BNBUSDT%22]
    async getTickerPrice(symbols) { 
        try {
            const price = await binance.getTickerPrice({ symbols });
            if (price) 
                return price;
            else 
                return false;
        }
        catch(err) { return false; }
    }


    // Get Symbol order book ticker - Best price/qty on the order book for a symbol or symbols.
    // Symbols parameter has to be a string in format: ["BTCUSDT","BNBUSDT"] or [%22BTCUSDT%22,%22BNBUSDT%22]
    async getOrderBookTickerPrice(symbols) { 
        try {
            const price = await binance.getOrderBookTickerPrice({ symbols });
            if (price) 
                return price;
            else 
                return false;
        }
        catch(err) { return false; }
    }


    // Create Market Order
    async createMarketOrder(symbol, side, size) {   // the price is the current market price

        const orderData = { 
            recvWindow: 5000, 
            timestamp: new Date().getTime(), 
            symbol,
            side,                   // 'BUY', 'SELL'
            type: 'MARKET',         // 'MARKET' order
            size,
            // funds: orderFunds    // another option is 'funds' from which size can be auto calculated          
        };

        try {
            const order = await binance.createOrder(orderData);
            if (order)
                return order;
            else 
                return false;
        }
        catch(err) { 
            // console.log(err);
            return false; 
        }
    }


    // Create Limit Order
    async createLimitOrder(symbol, side, price, size) {   

        const orderData = { 
            recvWindow: 5000, 
            timestamp: new Date().getTime(), 
            symbol,
            side,                   // 'BUY', 'SELL'
            type: 'LIMIT',          // 'LIMIT' order
            price,
            size,
        };

        try {
            const order = await binance.createOrder(orderData);
            if (order) {
                // Add order to pending orders with params: { orderId, symbol, status, fillCheck=0 }
                // - a loop can be made to check for pending orders and organize a check from binance.
                const pendingOrder = await PendingOrder.create({ 
                    orderId: order.data.orderId,
                    symbol: order.data.symbol,
                    status: order.data.status
                });
                await pendingOrder.save()
                return order;
            }
            else return false;
        }
        catch(err) { 
            // console.log(err);
            return false; 
        }
    }


    /***********************/
    /*** Utility Methods ***/ 
    /***********************/

    generateId() {
        return createRandomString(10);
    }

    addTransaction(txnId, data, status) {
        this.bq.enqueue({ txnId, data, status });
    }

    updateTransactionStatus(txnId, status) {
        // this.bq.items = this.queue.items                                     // method 1
        //     .map(item => {
        //         if (item.txnId === txnId) return { txnId: item.txnId, data: item.data, status: status }
        //         return item;
        //     })
        const index = this.bq.items.findIndex((item) => item.txnId === txnId);  // method 2
        if (index !== -1) {
            this.bq.items[index].status = status;
        }
    }

    findTransaction(txnId) {
        const transaction = this.bq.items.filter((item) => item.txnId === txnId);
        return transaction[0];
    }

    removeTransaction(txnId) {
        // this.bq.items = this.queue.items.filter((item) => item.txnId !== txnId); // method 1
        const index = this.bq.items.findIndex((item) => item.txnId === txnId);      // method 2
        if (index !== -1) {
            this.bq.items.splice(index, 1);
        }
    }

    getTransactions() {
        return this.bq.getItems();
    }

    filterByStatus(status) {
        return this.bq.items.filter((item) => item.status === status);
    }

    removeByStatus(status) {
        return this.bq.items = this.bq.items.filter((item) => item.status !== status);
    }

}

module.exports = Broker;




