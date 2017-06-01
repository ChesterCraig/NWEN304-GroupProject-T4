//Import Modules
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const {client} = require("./Database/pg");
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
const query = require("./Database/queries");
var initialItems = require("./put_items");

var path = require('path');
var routes = require('./routes/index');

//create express app
var app = express();


// setup pug/jade view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Define all our middleware
app.use(express.static(__dirname + "/Public")); // Serves anything up in public folder
app.use(bodyParser.json()); // Gives us req.body elements parsed from clients http request


//======== PASSPORT AUTHORISATION STUFF ================================

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

//Setup Passport Facebook OAuth
passport.use(new FacebookStrategy(FacebookStrategyConfig, function(accessToken, refreshToken, profile, done) {
   // Here we do something with the new user.. likely add to our database
    var user = {id: profile.id, displayName: profile.displayName};
    console.log("User connected, add to db if new:",user);

    query.getUser(client,user.id,(error,data) => {
        console.log("Did we find the user in the database?",user);

        if (error) {
            console.log("No, error occured",error);
        } else if (data.length == 1) {
            //User exists
            console.log("Yes, user already exists",data[0]);
            done(null,data[0]);
        } else { 
            //User doesn't exist, create
            console.log("No, user does not exists -> Create it.");
            query.createUser(client,user,(error,data) => {
                if (error) {
                    console.log("Failed to create user record");
                    done(error,null);
                } else {
                    console.log("Succesfully created user record:",data[0]);
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

    query.getUser(client,id,(error,data) => {
        if (error) {
            console.log("Failed to deserialized user:",error);
            done(error,user);
        } else {
            console.log("Deserialized user:",data[0]);
            done(null,data[0]);
        }
    });
});

// Redirect the user to Facebook for authentication.  When complete, Facebook will redirect the user to /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  
//Finish the authentication process by attempting to obtain an access token.  
//If access was granted, the user will be logged in.  Otherwise, authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {successRedirect: '/',
                                     failureRedirect: '/login' }));

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
  res.render('index', { title: 'Clothing Shop' });
});

// Example item should be retrieved from db
var item = { title: 'shop',
            item_name:"generic item",
            item_description:"about item" }

// Example cart page
app.get('/cart', function(req, res, next) {
  res.render('cart');
});

// Test page for who is logged in 
app.get('/check', function(req, res) {
    if (req.user) {
        res.send(`<h1>Who are you?</h1><br>${JSON.stringify(req.user)}`);
    } else {
        res.send(`<h1>You're a nobody.</h1>`);
    }
});
// get user id temporary solution?
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
        }
        if (request.accepts('html')){
            response.render('item_page',results[0]);
        }
        else if (request.accepts('application/json')) {
            response.json(results);
        }
        else{
            respone.accepts()
            return response.status(400);
        }
    });
});

// Create a new item
app.post('/items', function(request, response){
    query.createItem(client,request.body.item,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results); 
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

//-------- BASKET -----------

// Create a basket
app.post('/basket', function(request, response){
    query.createBasket(client,request.body.basket,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results); 
    });
});

// Delete a basket and the contents
app.delete('/basket/:id', function(request, response){
    query.deleteBasket(client,request.params.id,(error) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.status(200).send(); 
    });
});

//-------- BASKET ITEMS -----------

// Add item to baset
app.post('/basketitem', function(request, response){
    query.createBasketItem(client,request.body.basketItem,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results); 
    });
});

// Remove item from basket
app.delete('/basket/:id', function(request, response){
    query.deleteBasketItem(client,request.params.id,(error) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.status(200).send(); 
    });
});

//-------- USER ACCOUNTS -----------
app.get('/users', (request,response) => {
    query.getUsers(client,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results);
    });
});

app.get('/users/:id', (request,response) => {
    query.getUser(client,id,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results);
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
