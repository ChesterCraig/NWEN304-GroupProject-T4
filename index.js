// Import Modules (npm)
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');

// Import Modules (local)
var routes = require('./routes/index');
var initialItems = require("./put_items");
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
            if (error) {
                console.log("local - No, error occured",error);
                return done(error);

            } else if (data.length != 1) {
                            //User doesn't exist, create
                console.log("local - No, user does not exists");
                done(null,false,{message: `User '${email}' doesn't exits.`});
            } else {
                //User exists
                console.log("local - Yes, user already exists (Pretend we've validated thier password",data[0]);
                done(null,data[0]);

            //VALIDATE PASSOWRD 
                //   if (!user) {
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   return done(null, user);
            }
        })
    }
));


//Setup Passport Facebook OAuth
passport.use(new FacebookStrategy(FacebookStrategyConfig, function(accessToken, refreshToken, profile, done) {
   // Here we do something with the new user.. likely add to our database
    var user = {facebook_id: profile.id, displayName: profile.displayName};
    console.log("fb - User connected, add to db if new:",user);
    console.log("fb - Did we find the user in the database?",user);
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
app.get('/auth/facebook', passport.authenticate('facebook'));

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


//-------- BASKET ITEMS -----------

// get all items in a basket
app.get('/basketitems', function(request, response){
    query.getBasketItems(client,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results); 
    });
});

// Add item to baset (user must be logged in to do this)
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

// Add new local user account based on email and password
app.post('/user', function(request, response){

    //Need to hash password and update body.password before passing to insert query
    request.body.password_hash = request.body.password;                                                 //TODO

    query.createLocalUser(client,request.body,(error,results) => {
        if (error) {
            return response.status(400).send(error);
        }
        response.json(results); 
    });
});

// Get all users
app.get('/users', (request,response) => {
    query.getUsers(client,(error,results) => {
        if (error) {
            return response.status(400);//.send(error);
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
