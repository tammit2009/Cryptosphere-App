/* CoinRanking and Bing News Routes (on Rapid API)*/

// Dependencies
const express   = require('express');
const router    = express.Router();
const axios     = require("axios");

const coinrankingRapidApiKey = process.env.COINRANKING_RAPID_API_KEY;

const cryptoApiHeaders = {
    'X-RapidAPI-Key': coinrankingRapidApiKey,
    'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
};

const coinrankingBaseUrl = 'https://coinranking1.p.rapidapi.com';

// routes
router.get('/', async (req, res) => {
    res.send('CoinRanking Routes')
});


// Get list of coins 
// Method: 'GET', url = '/proxy/coinranking/cryptos?count={count}', Access: 'Public'
router.get('/cryptos', async (req, res) => {
    let count = req.query.count;
    if (!count) 
        count = 50;

    const endpoint = `/coins?limit=${count}`;

    try {
        const result = await axios.get(`${coinrankingBaseUrl}${endpoint}`, {
            headers: cryptoApiHeaders,
            // params: {}
        });
    
        res.json(result.data);
    }
    catch (err) {
        if (err.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx i.e. The client was given an error response (5xx, 4xx)
            // console.log(err.response.data);
            // console.log(err.response.status);
            // console.log(err.response.headers);
            res.json({ errorCode: -1, data: err.response.data });
        } 
        else if (err.request) {
            // The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
            // console.log(err.request);
            res.json({ errorCode: -2, data: err.request });
        } 
        else {
            // Something happened in setting up the request that triggered an Error
            // console.log('Error', err.message);
            res.json({ errorCode: -3, data: err.message });
        }
    }   
});


// Get a coin's details 
// Method: 'GET', url = '/proxy/coinranking/crypto-details?coin={coin}', Access: 'Public'
router.get('/crypto-details', async (req, res) => {
    let coinId = req.query.coin;
    if (!coinId) return res.status(401).json({ code: -4, message: 'Coin is required as an input parameter' });
    
    const endpoint = `/coin/${coinId}`;

    try {
        const result = await axios.get(`${coinrankingBaseUrl}${endpoint}`, {
            headers: cryptoApiHeaders,
            // params: {}
        });
    
        res.json(result.data);
    }
    catch (err) {
        if (err.response) {
            res.json({ errorCode: -1, data: err.response.data });
        } 
        else if (err.request) {
            res.json({ errorCode: -2, data: err.request });
        } 
        else {
            res.json({ errorCode: -3, data: err.message });
        }
    } 
});


// Get a coin's history 
// Method: 'GET', url = '/proxy/coinranking/crypto-history?coin={coin}&refUuid={refUuid}&timeperiod={timeperiod}', Access: 'Public'
// Note: timeperiod range '3h', '24h', '7d', '30d', '1y', '3m', '3y', '5y'
router.get('/crypto-history', async (req, res) => {
    let coinId = req.query.coin;
    if (!coinId) return res.status(401).json({ code: -1, message: 'Coin is required as an input parameter' });
    
    let timeperiod = req.query.timeperiod;
    if (!timeperiod) 
        timeperiod ='24h';

    // Not really needed
    // let refUuid = req.query.refUuid;
    // if (!refUuid)  return res.status(401).json({ code: -2, message: 'RefUUID is required as an input parameter' });

    const endpoint = `/coin/${coinId}/history?timeperiod=${timeperiod}`;

    try {
        const result = await axios.get(`${coinrankingBaseUrl}${endpoint}`, {
            headers: cryptoApiHeaders,
            // params: {}
        });
    
        res.json(result.data);
    }
    catch (err) {
        if (err.response) {
            res.json({ errorCode: -1, data: err.response.data });
        } 
        else if (err.request) {
            res.json({ errorCode: -2, data: err.request });
        } 
        else {
            res.json({ errorCode: -3, data: err.message });
        }
    }
});


// Exports
module.exports = router;


// Sample
// const axios = require("axios");

// const options = {
//     method: 'GET',
//     url: 'https://coinranking1.p.rapidapi.com/exchanges',
//     params: {
//         referenceCurrencyUuid: 'yhjMzLPhuIDl',
//         limit: '50',
//         offset: '0',
//         orderBy: '24hVolume',
//         orderDirection: 'desc'
//     },
//     headers: {
//         'X-RapidAPI-Key': '0cdba72a57msh5ed74c6d449964dp1d6129jsnb892395f3b48',
//         'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
//     }
// };

// axios.request(options).then(function (response) {
// 	console.log(response.data);
// }).catch(function (error) {
// 	console.error(error);
// });