// Import Modules (npm)
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const bcrypt = require('bcryptjs');

// Import Modules (local)
const routes = require('./routes/index');
const initialItems = require("./put_items");
const query = require("./Database/queries");
const {client} = require("./Database/pg");

// Create express app
var app = express();

// Setup pug/jade view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Define all our middleware
app.use(express.static(__dirname + "/Public")); // Serves anything up in public folder
app.use(bodyParser.json()); // Gives us req.body elements parsed from clients http request
app.use(bodyParser.urlencoded({ extended: false })); // Parses form data into body (required for local login)

//======== PASSPORT AUTHORISATION STUFF (local + Facebook)================================

// Get OAuth config from heroku Config variables if present else config file.
if (process.env.FB_CLIENT_ID && process.env.FB_CLIENT_SECRET) {
    var FacebookStrategyConfig = {
        clientID: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: "https://clothes-shop-nwen304.herokuapp.com/auth/facebook/callback"
    };
} else { 
    var FacebookStrategyConfig = require('./Config/fbConfig.js'); 
}

// Authentication stuff
app.use(session({secret: 'keyboard cat',
                 resave: true,
                 saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

// Setup local (email/password) authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
    function(email, password, done) {
        console.log(`local login attempt - email${email}, password:${password}`);

        query.getUser(client,{email: email},(error,data) => {
            console.log(`local - Did we find the user in the database under email ${email}?`,data);
            
            // Check for errors
            if (error) {
                console.log("local - No, error occured",error);
                return done(error);
            } else if (data.length != 1) {
                //User doesn't exist, create
                console.log("local - No, user does not exists");
                done(null,false,{message: `User '${email}' doesn't exits.`});
            }

            // Define our user to return if password is validated as correct
            var user = data[0];

            //User exists - Validate password
            // Get password hash for user
            query.getUserPasswordHash(client,{email: email},(error,data) => {
                // Check for error
                if (error) {
                    console.log(`local - Faled to get password hash for user email ${email}`,error);
                    return done(error);
                } 

                var hash = data[0].password_hash;
                bcrypt.compare(password, hash, function(err, res) {
                    if (res === true) {
                        //Password correct
                        console.log(`local - user ${email} and password ${password} provided - CORRECT (LOGIN SUCCESSFULL).`);
                        return done(null, user);
                    } else {
                        //Password incorrect
                        console.log(`local - user ${email} exists but password ${password} is incorrect.`);
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                });
            });
        });
    }
));

//Setup Passport Facebook OAuth
passport.use(new FacebookStrategy(FacebookStrategyConfig, function(accessToken, refreshToken, profile, done) {
   // Here we do something with the new user.. likely add to our database
    var user = {facebook_id: profile.id, displayName: profile.displayName};
    console.log('fb - profile',profile); //print profile object to see what data we get on the user now we have extended scope to include public profile

    console.log("fb - User connected, add to db if new:",user);
    query.getUser(client,user,(error,data) => {
        console.log("fb - Did we find the user in the database?");
        if (error) {
            console.log("fb - No, error occured",error);
            return done(error);
        } else if (data.length == 1) {
            //User exists
            console.log("fb - Yes, user already exists",data[0]);
            done(null,data[0]);
        } else { 
            //User doesn't exist, create
            console.log("fb - No, user does not exists -> Create it.");
            query.createFaceBookUser(client,user,(error,data) => {
                if (error) {
                    console.log("fb - Failed to create user record");
                    done(error,null);
                } else {
                    console.log("fb - Succesfully created user record:",data[0]);
                    done(null,data[0]);
                }
            });
        }
    });
}));

//Support for sessions
passport.serializeUser(function(user, done) {
    //all we need is our ID as this is key in our users table
    console.log("Serialize user:",user);
    done(null, user.id);
});

// From id in cookie, pull all user info to put on req.user
passport.deserializeUser(function(id, done) {
    // Get our user info from database to on req.user
    console.log("Deserialize user based on id:",id);

    query.getUser(client,{id: id},(error,data) => {
        if (error) {
            console.log("Failed to deserialized user:",error);
            done(error);
        } else {
            console.log("Deserialized user:",data[0]);
            done(null,data[0]);
        }
    });
});

// Redirect the user to Facebook for authentication.  When complete, Facebook will redirect the user to /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'public_profile'}));

// Facebook will redirect the user to this URL after approval.  
//Finish the authentication process by attempting to obtain an access token.  
//If access was granted, the user will be logged in.  Otherwise, authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {successRedirect: '/',
                                     failureRedirect: '/login' }));

//Post to login via email/password
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login'})
);


// Failed login page
app.get('/login',(request,response) => {
    response.send('You failed to login<br><a href="/">--Go Home--</a>');
});

// Logout url
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
//======== PASSPORT AUTHORISATION STUFF END ================================


//======== RENDERED HTML PAGES ================================
// Home page.
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Clothing Shop', data: {
      id: 12,
      name: 'Yellow Shorts',
      gender: 'Female',
      description: 'Yellow T-Shirt - Writing',
      price: 15,
      image_path: '/images/tshirt2.jpg' }  });
});

// Example item should be retrieved from db
var item = { title: 'shop',
            item_name:"generic item",
            item_description:"about item" }

// Example cart page
app.get('/cart', function(req, res, next) {
  res.render('cart');
});

// Mens page
app.get('/men', function(req, res, next) {
    query.getMaleItems(client,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        res.render('men', {
            data: results
        });
        //response.json(results);
    });

});

// Womens page
app.get('/women', function(req, res, next) {
    query.getFemaleItems(client,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        res.render('women', {
            data: results
        });
        //response.json(results);
    });
});

app.post('/itemsearch', function(req, res) {
    //return;
    var inputString = req.body.name;
    query.itemSearch(client, inputString, (error,results) =>  {
        if (error) {
            return response.status(400).send(error);
        }
        console.log(results);
        //res.render('index', {
        //    data: results
        //});
        return res.status(200).send(results);
    });
});

// Example womens page
app.get('/accessories', function(req, res, next) {
    res.render('accessories');
});

// Test page for who is logged in 
app.get('/check', function(req, res) {
    if (req.user) {
        res.send(`<h1>Who are you?</h1><br>${JSON.stringify(req.user)}`);
    } else {
        res.send(`<h1>You're a nobody.</h1>`);
    }
});

// Enable user to get thier details inc. id
app.get('/user', function(req, res) {
    if (req.user) {
        res.send(req.user);
    } else {
        res.status(400).send('not loggedin');
    }
});


//======== RENDERED HTML PAGES END ================================


//======== RESTFUL ENDPOINTS ================================

//-------- ITEMS -----------
// Get all items
app.get('/items', (request,response) => {
    query.getItems(client,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results);
    });
});

// Create Item
app.post('/items', (request,response) => {
    query.createItem(client, request.body.item,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results);
    });
});

// Get specific item 
// returns html or json depending on request accept header 
app.get('/items/:id', (request,response) => {
    query.getItem(client,request.params.id,(error,result) => {
        if (error) {
            return response.status(400).send(error);
        } else if (request.accepts('html')) {
            response.render('item_page',results[0]);
        } else if (request.accepts('application/json')) {
            response.json(results);
        } else {
            respone.accepts();
            return response.status(400);
        }
    });
});

// Delete item
app.delete('/items/:id', function(request, response){
    query.deleteItem(client,request.params.id,(error) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.status(200).send(); 
    });
});


//-------- BASKET ITEMS -----------
// JSON data must include user_account_id if actioning something on thier cart. If admin, can action any item from any cart.
// - Get all items in every basket (admin only)
// - Get all items in my (current users) basket
// - Add item to my (current users) basket
// - Update qty of an item in my (current users) basket
// - Remove item from basket
// - Remove all items from my (current users) basket

// Get all items in every basket (admin only)
app.get('/allbasketitems', function(request, response){
    if (request.user.is_admin === true) {
        query.getAllBasketItems(client,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
            response.json(results); 
        });
    } else {
        response.status(401).send('This action is restricted to admins');
    }
});


// Get all items in my (current users) basket
app.get('/basketitems', (request, response) => {
    if (request.user.is_admin === true) {
        // Admin may specify any user id
        query.getBasketItems(client,request.body.user_account_id,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
            response.json(results); 
        });
    } else if (request.user)  {
        // Get items from basket of requestor
        query.getBasketItems(client,request.user.id,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
            response.json(results); 
        });
    } else {
        response.status(401).send('You must be logged in to perform this action.');
    }
});

// Add item to my (current users) basket
app.post('/basketitem', (request, response) => {
   if (request.user.is_admin === true) {
        // Admin may specify any user id
        query.createBasketItem(client,request.body,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
            response.json(results); 
        });
    } else if (request.user)  {
        // Add item to basket of requestor
        request.body.user_account_id = request.user.id;

        query.createBasketItem(client,request.body,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
            response.json(results); 
        });
    } else {
        response.status(401).send('You must be logged in to perform this action.');
    }
});


// Update qty of an item in my (current users) basket
app.post('/basketitem', (request,response) => {
   if (request.user.is_admin === true) {
        // Admin may specify any user id
        query.updateBasketItem(client,request.body,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
            response.json(results); 
        });
    } else if (request.user)  {
        // Update item in basket of requestor only
        requst.body.user_account_id = request.user.id;

        query.updateBasketItem(client,request.body,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
            response.json(results); 
        });
    } else {
        response.status(401).send('You must be logged in to perform this action.');
    }
});


// Remove item from my (current users) basket
app.delete('/basket', (request, response) => {
    if (request.user.is_admin === true) {
        // Admin may delete an item (just dont specify user_account_id param)
        query.deleteBasketItem(client,request.body,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
                response.status(200).send(); 
        });
    } else if (request.user)  {
        // Delete item in users account
        requst.body.user_account_id = request.user.id;

        query.deleteBasketItem(client,request.body,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
                response.status(200).send(); 
        });
    } else {
        response.status(401).send('You must be logged in to perform this action.');
    }
});

// Remove all items from my (current users) basket
app.delete('/basket', (request, response) => {
    if (request.user.is_admin === true) {
        // Admin may delete items from any users basket (just specify user_account_id param)
        query.deleteBasketItems(client,request.body.user_account_id,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
                response.status(200).send(); 
        });
    } else if (request.user)  {
        // Delete item in users account
        query.deleteBasketItems(client,request.user.id,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
                response.status(200).send(); 
        });
    } else {
        response.status(401).send('You must be logged in to perform this action.');
    }
});


//-------- USER ACCOUNTS -----------

// Add new local user account based on email and password
app.post('/user', function(request, response){
    // Need to validate inputs first.  <--- TODO
    console.log(request.body);

    // If user provided optional correct admin secret value then the accounts created is set as is_admin = true. Secret set via Heroku
    var isAdmin = false;
    if (request.body.adminSecret) {
        if (request.body.adminSecret == "SuperSecret") {
        //if (request.body.adminSecret == process.env.ADMIN_SECRET) {
            isAdmin = true;
        } else {
            return response.status(401).send('Incorrect admin secret. Cannot create admin account.');
        }
    }

    // Hash password then create new account
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(request.body.password, salt, function(err, hash) {
            // Store hash in your password DB.
            var details = {
                email: request.body.email,
                displayName: request.body.displayName,
                password_hash: hash,
                isAdmin
            };

            query.createLocalUser(client,details,(error,results) => {
            if (error) {
                return response.status(400).send(error);
            }
            response.json(results); 
            }); 
        });
    });
});

// Get all users
app.get('/users', (request,response) => {
    query.getUsers(client,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results);
    });
});

// Get a user based on id. ID must be user_accounts.id
app.get('/users/:id', (request,response) => {
    query.getUser(client,{id: request.params.id},(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results);
    });
});

// Remove user
app.delete('/users/:id', function(request, response){
    query.deleteUser(client,request.params.id,(error) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.status(200).send(); 
    });
});


//======== RESTFUL ENDPOINTS END ================================


//Initalise schema if required and start server
client.initSchema(() => {        
    //Start web server
    client.populateItems(initialItems);
    var port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
});
