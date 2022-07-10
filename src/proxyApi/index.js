
// Dependencies
const express = require('express');
const routes  = express(); 

// Proxy API Route Distributor
routes.use('/broker',       require('./broker'));
routes.use('/binance',      require('./binance'));
routes.use('/coinranking',  require('./coinranking'));
routes.use('/bingnews',     require('./bing'));
routes.use('/weatherstack', require('./mapbox_weatherstack'));

// Exports
module.exports = routes;

