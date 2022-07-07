
/* Trading API Controller */

// Dependencies
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');

const _triggers = require('../services/triggers');

// ====================================================================
// Create a new trigger 
// --------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/trading/triggers', Access: 'Private'
// ====================================================================
const createTrigger = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const { actions } = req.body;
    
    // Create and save the new trigger
    const trigger = await _triggers.createTrigger(owner._id, { actions }); 
    await trigger.save();

    res.status(201).json(trigger);  
}); 


// ===================================================================
// List all triggers 
// -------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/triggers', Access: 'Private'
// Parameterized:
// - Pagination: GET /trading/triggers?limit=10&skip=10
// - Sort:       GET /trading/triggers?sortBy=createdAt:desc
// ===================================================================
const listTriggers = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const triggers = await _triggers.listTriggers(owner._id, {
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        sort
    });

    res.json(triggers);      
}); 


// =======================================================================
// View a Specific trigger 
// -----------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/triggers/:id', Access: 'Private'
// =======================================================================
const getTrigger = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const trigger = await _triggers.getTrigger(owner._id, { triggerId: _id });
    if (!trigger) {
        return res.status(404).json({ error: `Trigger not found` });
    }

    res.json(trigger);    
}); 


// =========================================================================
// Update a specific trigger 
// -------------------------------------------------------------------------
// Method: 'PATCH', url = '/api/v1/trading/triggers/:id', Access: 'Private'
// =========================================================================
const updateTrigger = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const updates = Object.keys(req.body);
    const allowedUpdates = ['timestamp', 'actions'];

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    const trigger = await _triggers.updateTrigger(owner._id, { triggerId: _id, updateKeys: updates, params: req.body });
    if (!trigger) {
        return res.status(400).json({ error: `Unable to update trigger` });
    }

    res.json(trigger);
}); 


// ==========================================================================
// Delete a specific trigger
// --------------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/trading/triggers/:id', Access: 'Private'
// ==========================================================================
const deleteTrigger = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const trigger = await _triggers.deleteTrigger(owner._id, { triggerId: _id });
    if (!trigger) {
        return res.status(404).json({ error: `Trigger not found` });                     
    }
    res.json(trigger);
}); 


// ---------------------------------------------------------------------------

const _positions = require('../services/positions');

// ====================================================================
// Create a new position 
// --------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/trading/positions', Access: 'Private'
// ====================================================================
const createPosition = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const { entryId, exitId, fee, type, state, direction } = req.body;
    
    // Create and save the new position
    const position = await _positions.createPosition(owner._id, { 
        entryId, 
        exitId,
        fee,
        type,           // "MARKET", "LIMIT", ...
        state,          // "OPEN", "CLOSED"
        direction,      // "LONG", "SHORT"
        transactor:     owner._id 
    }); 

    await position.save();

    res.status(201).json(position);  
}); 


// ===================================================================
// List all positions 
// -------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/positions', Access: 'Private'
// Parameterized:
// - Pagination: GET /trading/positions?limit=10&skip=10
// - Sort:       GET /trading/positions?sortBy=createdAt:desc
// ===================================================================
const listPositions = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const positions = await _positions.listPositions(owner._id, {
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        sort
    });

    res.json(positions);    
}); 


// ========================================================================
// View a Specific Position 
// ------------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/positions/:id', Access: 'Private'
// ========================================================================
const getPosition = asyncHandler(async (req, res) => {  

    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const position = await _positions.getPosition(owner._id, { positionId: _id });
    if (!position) {
        return res.status(404).json({ error: `Position not found` });
    }

    res.json(position); 
}); 


// ==========================================================================
// Update a specific position 
// --------------------------------------------------------------------------
// Method: 'PATCH', url = '/api/v1/trading/positions/:id', Access: 'Private'
// ==========================================================================
const updatePosition = asyncHandler(async (req, res) => {

    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const updates = Object.keys(req.body);
    const allowedUpdates = ['entryId', 'exitId', 'fee', 'type', 'state', 'direction'];

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    const position = await _positions.updatePosition(owner._id, { 
        positionId: _id, 
        updateKeys: updates, 
        params: req.body 
    });

    if (!position) {
        return res.status(400).json({ error: `Unable to update trigger` });
    }

    res.json(position);
}); 


// ===========================================================================
// Delete a specific position
// ---------------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/trading/positions/:id', Access: 'Private'
// ===========================================================================
const deletePosition = asyncHandler(async (req, res) => {

    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const position = await _positions.deletePosition(owner._id, { positionId: _id });
    if (!position) {
        return res.status(404).json({ error: `Position not found` });                    
    }
    res.json(position);
}); 


// ---------------------------------------------------------------------------


const _trades = require('../services/trades');

// ====================================================================
// Create a new trade 
// --------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/trading/trades', Access: 'Private'
// ====================================================================
const createTrade = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const { price, size } = req.body;
    
    // Create and save the new trigger
    const trade = await _trades.createTrade({ 
        price, 
        size 
    }); 

    await trade.save();

    res.status(201).json(trade);  
}); 


// =================================================================
// List all trades 
// -----------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/trades', Access: 'Private'
// Parameterized:
// - Pagination: GET /trading/trades?limit=10&skip=10
// - Sort:       GET /trading/trades?sortBy=createdAt:desc
// =================================================================
const listTrades = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    // const posId = req.params.posId;
    // if (!posId) return res.status(401).json({ error: `Invalid inputs.` });

    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const trades = await _trades.listTrades({
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        sort
    });

    res.json(trades); 
}); 


// ====================================================================
// View a Specific Trade 
// --------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/trades/:id', Access: 'Private'
// ====================================================================
const getTrade = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    // const posId = req.params.posId;
    // if (!posId) return res.status(401).json({ error: `Invalid inputs.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const trade = await _trades.getTrade({ tradeId: _id });
    if (!trade) {
        return res.status(404).json({ error: `Trade not found` });
    }

    res.json(trade); 
}); 


// =======================================================================
// Delete a specific trade
// -----------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/trading/trades/:id', Access: 'Private'
// =======================================================================
const deleteTrade = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    // TODO: find position with this trade and delete the trade from the position
    // const posId = req.params.posId;
    // if (!posId) return res.status(401).json({ error: `Invalid inputs.` });
    
    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const trade = await _trades.deleteTrade({ tradeId: _id });
    if (!trade) {
        return res.status(404).json({ error: `Trade not found` });                     
    }
    res.json(trade);
}); 


// ---------------------------------------------------------------------------

const _watchitems = require('../services/watchitems');

// ====================================================================
// Create a new watch item 
// --------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/trading/watchitems', Access: 'Private'
// ====================================================================
const createWatchItem = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const { asset, base, symbolId, type, state, txn_fee, long_funds, short_funds, allocation, description } = req.body;
    
    // Create and save the new position
    const watchItem = await _watchitems.createWatchItem(owner._id, { 
        asset,          // e.g. "BTC"
        base,           // e.g. "BUSD"
        symbolId,       // e.g. "62c4afd0fd9282d077689dee"
        type,           // e.g. "CRYPTO"
        state,          // e.g. "ACTIVE"
        txn_fee,        // e.g. 0.0075
        long_funds,     // e.g. 100
        short_funds,    // e.g. 0.005
        allocation,     // e.g. 0.25
        description     // e.g. "BTCUSDT Binance Currency Pair"
    }); 

    await watchItem.save();

    res.status(201).json(watchItem);  
}); 


// ===================================================================
// List all watch items 
// -------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/watchitems', Access: 'Private'
// Parameterized:
// - Pagination: GET /trading/watchitems?limit=10&skip=10
// - Sort:       GET /trading/watchitems?sortBy=createdAt:desc
// ===================================================================
const listWatchItems = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const watchItems = await _watchitems.listWatchItems(owner._id, {
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        sort
    });

    res.json(watchItems);   
    }); 


// ========================================================================
// View a Specific WatchItem 
// ------------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/watchitems/:id', Access: 'Private'
// ========================================================================
const getWatchItem = asyncHandler(async (req, res) => {  

    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const watchItem = await _watchitems.getWatchItem(owner._id, { watchItemId: _id });
    if (!watchItem) {
        return res.status(404).json({ error: `WatchItem not found` });
    }

    res.json(watchItem); 
}); 


// ==========================================================================
// Update a specific watchitem 
// --------------------------------------------------------------------------
// Method: 'PATCH', url = '/api/v1/trading/positions/:id', Access: 'Private'
// ==========================================================================
const updateWatchItem = asyncHandler(async (req, res) => {
    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const updates = Object.keys(req.body);
    const allowedUpdates = ['asset', 'base', 'symbolId', 'type', 'state', 'txn_fee', 'long_funds', 'short_funds', 'allocation', 'description'];

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    const watchItem = await _watchitems.updateWatchItem(owner._id, { 
        watchitemId: _id, 
        updateKeys: updates, 
        params: req.body 
    });

    if (!watchItem) {
        return res.status(400).json({ error: `Unable to update watchItem` });
    }

    res.json(watchItem);
}); 


// ===========================================================================
// Delete a specific watchitem
// ---------------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/trading/watchitem/:id', Access: 'Private'
// ===========================================================================
const deleteWatchItem = asyncHandler(async (req, res) => {

    const owner = req.user;
    if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const watchItem = await _watchitems.deleteWatchItem(owner._id, { watchItemId: _id });
    if (!watchItem) {
        return res.status(404).json({ error: `WatchItem not found` });                    
    }
    res.json(watchItem);
}); 


// ---------------------------------------------------------------------------

const _markets = require('../services/markets');

// ====================================================================
// Create a new market 
// --------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/trading/markets', Access: 'Private'
// ====================================================================
const createMarket = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const { symbol, asset, base, type, description } = req.body;
    
    // Create and save the new market
    const market = await _markets.createMarket({ 
        symbol, // e.g. "BTCBUSD"
        asset,  // e.g. "BTC"
        base,   // e.g. "BUSD"
        type,   // e.g. "CRYPTO"    
        description, // e.g. "BTCUSDT Binance Currency Pair"      
    }); 

    await market.save();

    res.status(201).json(market);  
}); 


// ===================================================================
// List all markets 
// -------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/markets', Access: 'Private'
// Parameterized:
// - Pagination: GET /trading/markets?limit=10&skip=10
// - Sort:       GET /trading/markets?sortBy=createdAt:desc
// ===================================================================
const listMarkets = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const markets = await _markets.listMarkets({
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        sort
    });

    res.json(markets);    
}); 


// ========================================================================
// View a Specific Market 
// ------------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/markets/:id', Access: 'Private'
// ========================================================================
const getMarket = asyncHandler(async (req, res) => {  

    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const market = await _markets.getMarket({ marketId: _id });
    if (!market) {
        return res.status(404).json({ error: `Market not found` });
    }

    res.json(market); 
}); 


// ==========================================================================
// Update a specific market 
// --------------------------------------------------------------------------
// Method: 'PUT', url = '/api/v1/trading/markets/:id', Access: 'Private/Admin'
// ==========================================================================
const updateMarket = asyncHandler(async (req, res) => {

    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const updates = Object.keys(req.body);
    const allowedUpdates = ['symbol', 'asset', 'base', 'type', 'description'];

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    const market = await _markets.updateMarket({ 
        marketId: _id, 
        updateKeys: updates, 
        params: req.body 
    });

    if (!market) {
        return res.status(400).json({ error: `Unable to update market` });
    }

    res.json(market);
}); 


// ===========================================================================
// Delete a specific market
// ---------------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/trading/markets/:id', Access: 'Private'
// ===========================================================================
const deleteMarket = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const market = await _markets.deleteMarket({ marketId: _id });
    if (!market) {
        return res.status(404).json({ error: `Market not found` });                    
    }
    res.json(market);
}); 


// ---------------------------------------------------------------------------

const _systasks = require('../services/systasks');

// ====================================================================
// Create a new systask 
// --------------------------------------------------------------------
// Method: 'POST', url = '/api/v1/trading/systasks', Access: 'Private'
// ====================================================================
const createSysTask = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const { action, description } = req.body;
    
    // Create and save the new systask
    const systask = await _systasks.createSysTask({ 
        action, 
        description,      
    }); 

    await systask.save();

    res.status(201).json(systask);  
}); 


// ===================================================================
// List all systasks 
// -------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/systasks', Access: 'Private'
// Parameterized:
// - Pagination: GET /trading/systasks?limit=10&skip=10
// - Sort:       GET /trading/systasks?sortBy=createdAt:desc
// ===================================================================
const listSysTasks = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const systasks = await _systasks.listSysTasks({
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        skip: req.query.skip ? parseInt(req.query.skip) : 0,
        sort
    });

    res.json(systasks);    
}); 


// ========================================================================
// View a Specific systask 
// ------------------------------------------------------------------------
// Method: 'GET', url = '/api/v1/trading/systasks/:id', Access: 'Private'
// ========================================================================
const getSysTask = asyncHandler(async (req, res) => {  

    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const systask = await _systasks.getSysTask({ systaskId: _id });
    if (!systask) {
        return res.status(404).json({ error: `SysTask not found` });
    }

    res.json(systask); 
}); 


// ============================================================================
// Update a specific systask 
// ----------------------------------------------------------------------------
// Method: 'PUT', url = '/api/v1/trading/systasks/:id', Access: 'Private/Admin'
// ============================================================================
const updateSysTask = asyncHandler(async (req, res) => {
    
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const updates = Object.keys(req.body);
    const allowedUpdates = ['action', 'description'];

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw createError(400, `Bad Request: Invalid Fields for Update`);    
    }

    const systask = await _systasks.updateSysTask({ 
        systaskId: _id, 
        updateKeys: updates, 
        params: req.body 
    });

    if (!systask) {
        return res.status(400).json({ error: `Unable to update systask` });
    }

    res.json(systask);
}); 


// ===========================================================================
// Delete a specific systask
// ---------------------------------------------------------------------------
// Method: 'DELETE', url = '/api/v1/trading/systasks/:id', Access: 'Private'
// ===========================================================================
const deleteSysTask = asyncHandler(async (req, res) => {
    // const owner = req.user;
    // if (!owner) return res.status(403).json({ error: `Forbidden: user not found.` });

    const _id = req.params.id;
    if (!_id) throw createError(400, `Bad Request`);

    const systask = await _systasks.deleteSysTask({ systaskId: _id });
    if (!systask) {
        return res.status(404).json({ error: `SysTask not found` });                    
    }
    res.json(systask);
}); 


module.exports = { 
    createTrigger, listTriggers, getTrigger, updateTrigger, deleteTrigger,
    createPosition, listPositions, getPosition, updatePosition, deletePosition,
    createTrade, listTrades, getTrade, deleteTrade,
    createMarket, listMarkets, getMarket, updateMarket, deleteMarket,
    createWatchItem, listWatchItems, getWatchItem, updateWatchItem, deleteWatchItem,
    createSysTask, listSysTasks, getSysTask, updateSysTask, deleteSysTask,
};

