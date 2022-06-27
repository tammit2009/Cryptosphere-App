/* Web Controller */

const asyncHandler  = require('express-async-handler');

// View the Index page
// Method: 'GET', url = '/', Access: 'Public'
const getIndexPage = asyncHandler(async (req, res, next) => {
    
    const data = {
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
};
