///////////////////////////////////////////
require('colors');

// environment config
require('dotenv').config(); 

///////////////////////////////////////////
// module imports
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');               // logging library
const cors = require('cors');
const hbs = require('hbs');
const session = require('express-session');
const cookieParser = require('cookie-parser');  // A cookie stores sessionId; cookieParser puts this on request object
const flash = require('express-flash');         // retains data on redirect
const MongoStore = require('connect-mongo');    // MongoDB session store for Connect and Express    
const passport = require('passport'); 
const socketio = require('socket.io');

const connectMongoDb           = require('./db/mongoose');
const registerHbsHelpers       = require('./utils/hbs_helpers');
const corsOptions              = require('../config/corsOptions');
const { logger, loggerStream } = require("./utils/loggers");
const { credentials }          = require('./middleware/auth'); 
 
const { ignoreFavicon, notFound, errorHandler, } = require('./middleware/utils');

const worker          = require('./worker');
const binancews       = require('./services/binance/binancews');

const webRoutes       = require('./routes/webRoutes');
const apiRoutes       = require('./routes/apiRoutes');
const proxyAPI        = require('./proxyApi');
const traderbotRoutes = require('./routes/traderbotRoutes');

///////////////////////////////////////////////////
// initializations

connectMongoDb();   // connect mongodb

const app = express();
const server = http.createServer(app);  
const io = socketio(server);
const port = process.env.PORT || 3000;

// Start the workers
worker.init();

//////////////////////////////////////////////////////////////////////////////

// Web socket connections and listeners

io.on('connection', (socket) => {
    console.log(`New socket connection established with id ${socket.id}`);

    // Detect change of symbol from the UI
    socket.on('SYMBOL', (payload) => {
        binancews.switchSymbol(payload);
    });
});
  
// Event Emitters
binancews.EE.on('OBUPDATES', (payload) => {
    io.emit('OBUPDATES', payload);
});

worker.sentinel.ee.on('SENTINEL_EVENT', (payload) => {
    // console.log('received sentinel event');
    io.emit('SENTINEL_EVENT', payload);
});

//////////////////////////////////////////////////////////////////////////////

// console.log(Math.floor(Math.random() * 1000000));

// test environment variables
console.log(process.env.NODE_ENV);

// define paths for express config
const publicDirPath = path.join(__dirname, '../public');
const viewsPath     = path.join(__dirname, '../templates/views');
const partialsPath  = path.join(__dirname, '../templates/partials');

// setup static directory to serve
app.use(express.static(publicDirPath));

// setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
app.set('view options', { layout: 'layouts/main' }); // default layout
hbs.registerPartials(partialsPath);

registerHbsHelpers(hbs);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// middleware

if (process.env.NODE_ENV === 'development') {
    // app.use(morgan('dev'));
    // to better understand which logging package we are referencing
    // at any given time after we integrate our Winston 
    app.use(morgan('common', { stream: loggerStream }));  // 'tiny', 'short', 'dev', 'common', 'combined'
}

// Handle options credentials check - insert before CORS.
// => If the option is not seen by CORS in production, an error will be thrown
app.use(credentials);
app.use(cors(corsOptions));                              // Cross Origin Resource Sharing - allows requests from one domain to another (e.g. react -> express)

app.use(express.json());                                // enable parsing JSON (replaces body-parser)
app.use(express.urlencoded({ extended: true }));        // enable parsing 'x-www-form-urlencoded' (replaces body-parser)
app.use(cookieParser());                                // add cookie to the request object
app.use(session({
    resave: true,										// forces the session to be saved back to the session store, even if not modified by request
    saveUninitialized: true,							// forces a session that is uninitialized to be saved to the store
    secret: 'superman123$',								// used to sign the session id cookie
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL })
}));

app.use(flash());
app.use(passport.initialize());                 		// initialize the passport middleware
app.use(passport.session());                    		// for serialize and deserialize

///////////////////////////////////////////////////////////////
// custom middleware

// Disable all request at maintenance mode if required
// const { maintenanceRedirect } = require('./middleware/utils');
// app.use(maintenanceRedirect);

// Debug/printout the session cookie if needed
// const { printCookies } = require('./middleware/utils');
// app.get("/*", (req, res, next) => printCookies(req, res, next));

// Add session variables to locals; 'req.user' will be available  
// on all pages based on authentication e.g. passport serialize/deserialize
app.use(async function(req, res, next) {
    
    // console.log(req.user);
    // console.log('request authenticated?', req.isAuthenticated());
    // console.log('roles:', res.locals.roles);
    next();
});

// Redirect favicon
app.use('/favicon.ico', express.static(`${publicDirPath}/images/favicon.ico`)); 

///////////////////////////////////////////////////////////////////////////////
// routes:

// session counter test
app.get('/session', (req, res) => {
	if (req.session.page_views) {
		// incrementing the page views counter by 1
		req.session.page_views++;
		res.status(200).json({ info: `Welcome, Visit Counter: ${req.session.page_views}` });
	}
	else {
		// introductory request: setting the page views counter to 1
		req.session.page_views = 1;
		res.status(200).json({ info: 'Welcome for the first time' });
	}
});

app.use('/',            webRoutes);
app.use('/api/v1', 	    apiRoutes);
app.use('/proxy',       proxyAPI);
app.use('/traderbot',   traderbotRoutes);

///////////////////////////////////////////////////////////////
// error handlers

// Handle 404
app.use(notFound);

// Error middleware
app.use(errorHandler);

///////////////////////////////////////////////////////////////

// startup the server
server.listen(port, () => {
    // console.log(`Server is up on port ${port}!`)
    logger.info(`Server is up on port ${port}!`)
});

///////////////////////////////////////////////////////////////
