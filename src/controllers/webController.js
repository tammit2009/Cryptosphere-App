/* Web Controller */

const asyncHandler  = require('express-async-handler');
const axios = require('axios');
const moment = require('moment');

const { formatCount } = require('../utils/helpers');

const baseUrl = process.env.BASE_URL;

// View the Index page
// Method: 'GET', url = '/', Access: 'Public'
const getIndexPage = asyncHandler(async (req, res, next) => {

    const coinList = await axios.get(`${baseUrl}/proxy/coinranking/cryptos?count=12`);

    const cryptoStats = coinList.data.data.stats;
    const coinData = coinList.data.data.coins;

    const stats = {
        totalCoins: Intl.NumberFormat().format(cryptoStats.totalCoins),
        totalMarkets:   formatCount(cryptoStats.totalMarkets, true, 1),
        totalExchanges: formatCount(cryptoStats.totalExchanges, true, 1),
        totalMarketCap: formatCount(cryptoStats.totalMarketCap, true, 1),
        total24hVolume: formatCount(cryptoStats.total24hVolume, true, 1),
    }

    const coins = coinData.map((coin) => {
        return {
            uuid: coin.uuid,
            symbol: coin.symbol,
            name: coin.name,
            iconUrl: coin.iconUrl,
            marketCap: formatCount(parseFloat(coin.marketCap), true, 1),
            price: Intl.NumberFormat().format(parseFloat(coin.price).toFixed(2)),
            listedAt: coin.listedAt,
            tier: coin.tier,
            change: coin.change,
            rank: coin.rank,
            coinrankingUrl: coin.coinrankingUrl,
            volume24Hours: coin['24hVolume'],
            btcPrice: coin.btcPrice
        }
    });

    const cryptoNews = await axios.get(`${baseUrl}/proxy/bingnews/cryptonews?q=crypto&count=6`);
    const news = cryptoNews.data.value.map((neu) => {
        return {
            name: neu.name,
            url: neu.url,
            newsImage: neu.image.thumbnail.contentUrl,
            description: neu.description,
            providerName: neu.provider[0].name,
            providerImage: neu.provider[0].image ? neu.provider[0].image.thumbnail.contentUrl : '',  // revisit safety here
            datePublished: moment(neu.datePublished).fromNow()
        }
    });    

    const data = {
        stats,
        coins,
        news,
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('main/index', data); 
}); 

// View All Cryptocurrencies
// Method: 'GET', url = '/cryptocurrencies', Access: 'Public'
const getCryptocurrencies = asyncHandler(async (req, res, next) => {

    const data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('main/cryptocurrencies', data); 
}); 

// Cryptocurrency Details page
// Method: 'GET', url = '/cryptodetails', Access: 'Public'
const getCryptoDetails = asyncHandler(async (req, res, next) => {

    const data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('main/cryptodetail', data); 
}); 

// View the Cryptocurrency Latest News
// Method: 'GET', url = '/cryptonews', Access: 'Public'
const getCryptoNews = asyncHandler(async (req, res, next) => {

    // const cryptoNews = await axios.get(`${baseUrl}/proxy/bingnews/cryptonews?q=crypto&count=10`);
    // console.log(cryptoNews);

    const data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('main/cryptonews', data); 
}); 

// Trading Index Page
// Method: 'GET', url = '/cryptotrading', Access: 'Private'
const getTradingIndex = asyncHandler(async (req, res, next) => {

    let data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('tradingzone/index', data); 
}); 


// Admin Index Page
// Method: 'GET', url = '/admin', Access: 'Private/Admin'
const getAdmin = asyncHandler(async (req, res, next) => {

    const data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('admin/index', data); 
}); 

// Settings Page
// Method: 'GET', url = '/settings', Access: 'Private/Admin'
const getSettingsPage = asyncHandler(async (req, res, next) => {

    const data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('admin/settings', data); 
}); 


// Unauthorized Page
// Method: 'GET', url = '/exception', Access: 'Public'
const getUnauthorizedPage = asyncHandler(async (req, res, next) => {

    let data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : [],
        errorMessage: 'Attempt to access a restricted page is Denied',
        layout: 'layouts/auth'
    };

    res.render('exceptions/401', data); 
}); 


// Unknown Page
// Method: 'GET', url = '/exception', Access: 'Public'
const getUnknownPage = asyncHandler(async (req, res, next) => {

    let data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : [],
        errorMessage: 'Page not Found',
        layout: 'layouts/auth'
    };

    res.render('exceptions/404', data); 
}); 


// View the About page
// Method: 'GET', url = '/about', Access: 'Public'
const getAboutPage = asyncHandler(async (req, res, next) => {

    const data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('main/about', data); 
}); 


// Method: 'GET', url = '/login', Access: 'Public'
const webLoginPage = asyncHandler(async (req, res) => {
    if (req.user) return res.redirect('/cryptotrading');

    let data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : [],
        message: req.flash('loginMessage'),
        layout: 'layouts/auth'
    };

    res.render('auth/login', data); 
}); 


// Method: 'GET', url = '/register', Access: 'Public'
const webRegisterPage = asyncHandler(async (req, res) => {

    let data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : [],
        errors: req.flash('errors'),
        layout: 'layouts/auth'
    }

    res.render('auth/register', data); 
});


// /*
//  * Register the User
//  * Method: 'POST', url = '/register', Access: 'Public'
//  */
const webPostRegisterPage = (req, res, next) => {

    // async.waterfall([

    //     function(callback) {
    //         Group.findOne({ groupname: 'basic' }, function(err, group) {
    //             if (err) return next(err);
    //             if (!group) {
    //                 console.log("Basic Group not found");
    //                 req.flash('errors', 'Default Group Basic does not exist');  // same as jsf.flash to survive redirect?
    //                 return res.redirect('/register');        
    //             }
    //             else {
    //                 callback(null, group);
    //             }   
    //         });
    //     },

    //     function(group, callback) {
    //         var user = new User();
    
    //         user.username        = req.body.username;           // 'username' field sent from page
    //         // user.profile.firstname = req.body.firstname;     // 'firstname' field sent from page
    //         // user.profile.lastname = req.body.lastname;       // 'lastname' field sent from page
    //         user.email           = req.body.email;              // 'email' field sent from page
    //         user.password        = req.body.password;           // 'password' field sent from page
    //         user.profile.picture = user.gravatar();
    //         user.groups          = [ group._id ];
            
    //         User.findOne({ email: req.body.email }, function(err, existingUser) {
    //             if (err) return next(err);
    //             if (existingUser) {
    //                 //console.log(req.body.email + " already exists");
    //                 req.flash('errors', 'Account with that email already exists');  // same as jsf.flash to survive redirect?
    //                 return res.redirect('/register');
    //             } else {
    //                 user.save(function(err, user) {
    //                     if (err) return next(err);
    //                     //res.json("New user has been created");
    //                     callback(null, user);
    //                 });
    //             }
    //         });
    //     },
  
    //     function(user) {

    //         // only valid for ecommerce apps
    //         // var cart = new Cart();
    //         // cart.owner = user._id;
    //         // cart.save( function(err) {
    //         //     if (err) return next(err);
    //         //     req.logIn(user, function(err) {         // This function adds the session to the server and cookie to the browser
    //         //         if (err) return next(err);
    //         //         res.redirect('/portal1/profile');
    //         //     });
    //         // });

    //         // Passport exposes a login() function on req (also aliased as logIn()) that can be used 
    //         // to establish a login session. 
    //         // - When the login operation completes, user will be assigned to req.user.
    //         // - The function adds the session to the server and cookie to the browser
    //         req.login(user, function(err) {  
    //             if (err) return next(err);
    //             res.redirect('/profile');
    //         });
    //     }
    // ]);
}; 

// View the Profile page
// Method: 'GET', url = '/profile', Access: 'Private'
const webProfilePage = asyncHandler(async (req, res, next) => {

    const data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    // User.findOne({ _id: req.user._id }, function(err, foundUser) {     
    //     if (err) return next(err);

    //     let data = {
    //         page_title: 'Profile',
    //         url: req.url,
    //         menu_data: menuData,
    //         user: foundUser
    //     }
    
    //     res.render('auth/profile', data);
    // });

    res.render('main/profile', data); 
}); 


/*
 * Get the Edit Profile page
 * Method: 'GET', url = '/edit_profile', Access: 'Private'
 */
const webProfileEditPage = asyncHandler(async (req, res, next) => {
    // let data = {
    //     page_title: 'Edit Profile',
    //     url: req.url,
    //     menu_data: menuData,
    //     message: req.flash('success')
    // }

    // res.render('auth/edit_profile', data)

    res.send('ok');
}); 


/*
 * Edit the User's Profile
 * Method: 'POST', url = '/profile/edit', Access: 'Private'
 */
const webPostProfileEditPage = asyncHandler(async (req, res, next) => {
    // User.findOne({ _id: req.user._id }, function(err, user) {
  
    //     if (err) return next(err);
    //     if (req.body.firstname) user.profile.firstname = req.body.firstname;
    //     if (req.body.lastname) user.profile.lastname = req.body.lastname;
    //     if (req.body.address) user.address = req.body.address;
    
    //     user.save(function(err) {
    //         if (err) return next(err);
    //         req.flash('success', 'Successfully Edited your profile');
    //         return res.redirect('/profile');
    //     });
    // });

    res.send('ok');
}); 


/*
 * Logout the current user
 * Method: 'GET', url = '/logout', Access: 'Private'
 */
const webLogoutUser = asyncHandler(async (req, res) => {
    // ** unreliable **
    // req.logout();
    // res.redirect('/');

    req.session.destroy(function (err) {
        // req.user = null;
        res.redirect('/'); 
    });
}); 


/////////////////////////////// DEMOS /////////////////////////////////////

// View the Weather page (not shown by default)
// Method: 'GET', url = '/weather', Access: 'Public'
const getWeatherPage = asyncHandler(async (req, res, next) => {

    res.render('weather/index', {
        title: 'Weather',
        name: 'Kustomlynx',
        layout: false   // dont use any layout
    });
}); 

// OrderBook Vizualization Demo Page
// Method: 'GET', url = '/obvizdemo', Access: 'Public'
const getOBVizDemo = asyncHandler(async (req, res, next) => {

    let data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('tradingzone/obvizdemo', data); 
}); 

// OrderBook Depth Chart Demo Page
// Method: 'GET', url = '/obdepthdemo', Access: 'Public'
const getOBDepthDemo = asyncHandler(async (req, res, next) => {

    let data = {
        user: req.user,
        roles: (req.user) ? await req.user.getRuids() : []
    };

    res.render('tradingzone/obdepthdemo', data); 
}); 

// View tradingview demo page
// Method: 'GET', url = '/tvdemo', Access: 'Public'
const getTradingViewDemo = asyncHandler(async (req, res, next) => {

    let data = {
        layout: false     // layout not required
    }

    res.render('tvdemo/index', data); 
}); 

// --------- CoinView --------------------------------------

const {
    getAccountInfo, buyCrypto, sellCrypto, getCryptoHistory
} = require('../apps/coinview/coinview_libs');


// View CoinView demo page
// Method: 'GET', url = '/coinview', Access: 'Public'
const getCoinViewDemo = asyncHandler(async (req, res, next) => {

    const jsonInfo = await getAccountInfo();
    const info = JSON.parse(jsonInfo)

    const account = Object.keys(info).includes('account') ? info.account : false;
    const exchange_info = Object.keys(info).includes('exchange_info') ? info.exchange_info : false;
    const symbols = Object.keys(info).includes('symbols') ? info.symbols : false;
    let balances = Object.keys(info).includes('balances') ? info.account : false;    
    if (balances) {
        balances = info.balances.filter((balance) => parseFloat(balance.free) !== 0.00);
    }

    // Get an array of flash message by passing the key to req.consumeFlash()
    // const messages = await req.consumeFlash('messages');
    // const errors = await req.consumeFlash('errors');
    // Notes:
    // - the flash message is an array. You can use await req.flash('key', 'value') several times 
    //   and all the value will be stored to the key. 
    // - Then when you call await req.consumeFlash('key'), it will give you an array which 
    //    contains all the value you want to flash.
    // - The Flash message will be set to null after you call await req.consumeFlash('key') 
    //   from session which means it will be removed from your session.

    let data = {
        // page_title: 'CoinView',
        // url: req.url,
        // menu_data: menuData,
        // title: 'CoinView',
        account: account,
        balances: balances,
        exchange_info: exchange_info,
        symbols: symbols,
        messages: req.flash('messages'),
        errors: req.flash('errors'),
        layout: false     // layout not required
    }

    res.render('coinview/index', data); 
}); 


// BuyCrypto CoinView page
// Method: 'POST', url = '/coinview/buy/:symbol/:quantity', Access: 'Private'
const coinviewBuy = asyncHandler(async (req, res, next) => {

    // TODO: validate the inputs
    const symbol = req.body.symbol;
    const quantity = req.body.quantity;

    const jsonInfo = await buyCrypto(symbol, quantity);
    const info = JSON.parse(jsonInfo);

    // send a redirect with a flash message
    if (info.status && info.status === "success") {
        req.flash('messages', 'Successfully bought crypto');
    }
    else {
        req.flash('errors', 'Unable to buy crypto');
    }

    return res.redirect('/coinview');
}); 


// SellCrypto CoinView page
// Method: 'POST', url = '/coinview/buy/:symbol/:quantity', Access: 'Private'
const coinviewSell = asyncHandler(async (req, res, next) => {
    // TODO: validate the inputs
    const symbol = req.body.symbol;
    const quantity = req.body.quantity;

    const jsonInfo = await sellCrypto(symbol, quantity);
    const info = JSON.parse(jsonInfo);

    // send a redirect with a flash message
    if (info.status && info.status === "success") {
        req.flash('messages', 'Successfully sold crypto');
    }
    else {
        req.flash('errors', 'Unable to sell crypto');
    }

    return res.redirect('/coinview');
}); 


// View CoinView demo page
// Method: 'GET', url = '/coinview', Access: 'Public'
const coinviewHistory = asyncHandler(async (req, res, next) => {
    const jsonData = await getCryptoHistory();
    const data = JSON.parse(jsonData)
    res.json(data);
}); 

// --------- End CoinView --------------------------------------


// View TradeSentinel page
// Method: 'GET', url = '/tradesentinel', Access: 'Public'
const getTradeSentinel = asyncHandler(async (req, res, next) => {

    res.render('tradingzone/tradesentinel'); 
}); 


// View tech-analytics page
// Method: 'GET', url = '/tech_analytics', Access: 'Public'
const getTechAnalyticsPage = asyncHandler(async (req, res, next) => {

    res.render('tradingzone/tech_analytics'); 
}); 


// View backtester page
// Method: 'GET', url = '/tech_analytics', Access: 'Public'
const getBackTesterPage = asyncHandler(async (req, res, next) => {

    res.render('tradingzone/backtester'); 
}); 


module.exports = { 
    getIndexPage,
    getAboutPage,
    getCryptocurrencies,
    getCryptoDetails,
    getCryptoNews,
    getTradingIndex,
    getAdmin,
    webProfilePage,
    webProfileEditPage,
    webPostProfileEditPage,
    getSettingsPage,
    getUnauthorizedPage,
    getUnknownPage,
    webLoginPage,
    webRegisterPage,
    webPostRegisterPage,
    webLogoutUser,
    // --- demos ---
    getWeatherPage,
    getOBVizDemo,
    getOBDepthDemo,
    getTradingViewDemo,
    getCoinViewDemo,
    coinviewBuy,
    coinviewSell,
    coinviewHistory,
    getTradeSentinel,
    getTechAnalyticsPage,
    getBackTesterPage,
};
