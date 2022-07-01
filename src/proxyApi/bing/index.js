/* Bing News Routes (on Rapid API)*/

// Dependencies
const express   = require('express');
const router    = express.Router();
const axios     = require("axios");

const bingRapidApiKey = process.env.BING_RAPID_API_KEY;

const cryptoNewsApiHeaders = {
    'X-BingApis-SDK': 'true',
    'X-RapidAPI-Key': bingRapidApiKey,
    'X-RapidAPI-Host': 'bing-news-search1.p.rapidapi.com'
};

const bingnewsBaseUrl = 'https://bing-news-search1.p.rapidapi.com';

// routes
router.get('/', async (req, res) => {
    res.send('Bing News Routes')
});


// Get list of coins 
// Method: 'GET', url = '/proxy/bingnews/cryptonews?q={newsCategory}&safeSearch=Off&textFormat=Raw&freshness=Day&count=${count}', Access: 'Public'
router.get('/cryptonews', async (req, res) => {
    let newsCategory = req.query.q;
    if (!newsCategory) 
        newsCategory = 'crypto';

    let count = req.query.count;
    if (!count) 
        count = 10;

    const endpoint = `/news/search?q=${newsCategory}&safeSearch=Off&textFormat=Raw&setLang=EN&freshness=Day&count=${count}`;

    try {
        const result = await axios.get(`${bingnewsBaseUrl}${endpoint}`, {
            headers: cryptoNewsApiHeaders,
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

