//Import Modules
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const {client} = require("./Database/pg");
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;

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

// Authentication stuff
app.use(session({secret: 'keyboard cat',
                 resave: true,
                 saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

//Setup Passport Facebook OAuth
passport.use(new FacebookStrategy(FacebookStrategyConfig, function(accessToken, refreshToken, profile, done) {
   // Here we do something with the new user.. likely add to our database
    console.log("We have a new user:",{id: user.id,displayName: user.displayName});


    client.query(`INSERT INTO USER_ACCOUNT (id, display_name) VALUES (${user.id},'${user.displayName}') RETURNING id, display_name`,function () {
        if (error) {
            done(error,{id: user.id,displayName: user.displayName});
        } else {
            done(null,{id: user.id,displayName: user.displayName});
        }
    });
  }
));


//Support for sessions
passport.serializeUser(function(user, done) {
    //all we need is our ID as this is key in our users table
    done(null, user.id);
});

// From id in cookie, pull all user info to put on req.user
passport.deserializeUser(function(id, done) {
    // Get our user info from database to on req.user
    var query = client.query(`SELECT id, display_name FROM USER_ACCOUNT WHERE id = ${id}`);
    var user;

    // Stream results back one row at a time 
    query.on('row', function(row) {
        user = row;
    });

    // After all data is returned, close connection and return results 
    query.on('end', function() {
        console.log("Deserialize = ",user);
        done(err,user); //response.json(results); 
    });
});

//home page.
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Clothing Shop' });
});

// example item should be retrieved from db
var item = { title: 'shop',
            item_name:"generic item",
            item_description:"about item" }
//example item page
app.get('/test', function(req, res, next) {
  res.render('item_page',item);
});


// Redirect the user to Facebook for authentication.  When complete, Facebook will redirect the user to /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  
//Finish the authentication process by attempting to obtain an access token.  
//If access was granted, the user will be logged in.  Otherwise, authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

// Failed login page
app.get('/get',(request,response) => {
    response.send('You failed to login<br><a href="/">--Go Home--</a>');
});

// Logout url
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//========RESTful====APIS=======
// Get all items
app.get('/items', (request,response) => {
    console.log("Get all items");
    var query = client.query("SELECT * FROM ITEM"); 
    var results = [];

    // Stream resultscl back one row at a time into array
    query.on('row', function(row) {
        results.push(row); 
    });
    
    // After all data is returned, close connection and return results 
    query.on('end', function() {
        response.json(results); 
    });
});

// Get specific item
app.get('/items/:id', (request,response) => {
    console.log("Get specific item: " + request.params.id);
    if ((request.params.id) && (request.params.id > 0)) {
        var query = client.query(`SELECT * FROM item WHERE id = ${request.params.id}`);
        var results = [];
    
        // Stream results back one row at a time 
        query.on('row', function(row) {
            results.push(row); 
        });
    
        // After all data is returned, close connection and return results 
        query.on('end', function() {
            response.json(results); 
        });
    } else {
        return response.status(400).send("Item ID is invalid");
    }
});

// Create a new item
app.post('/items', function(request, response){
    //body parser used 
    console.log("Create item with data from http json body", request.body);
      if (request.body.item) {
        var query = client.query(`INSERT INTO item (name, description, price) VALUES ('${request.body.item}') RETURNING id, name, description, price`);
        var results = [];
    
        // Stream results back one row at a time 
        query.on('row', function(row) {
            results.push(row); 
        });
    
        // After all data is returned, close connection and return results 
        query.on('end', function() {
            response.json(results); 
        });
    } else {
        return response.status(400).send("item value invalid");
    }
});


//NOT YET IMPLEMENTED
// // Update an item
// app.put('/item/:id', function(request, response){
// 	console.log("Update todo with data: ", request.body);
//     if ((request.params.id) && ((request.body.completed === true || request.body.completed === false) || (request.body.item))) {
//         var qryString = `UPDATE item SET col = ????`;
//         qryString = qryString + ` WHERE id = ${request.params.id}`;
        
//         //var query = client.query(qryString, function(error, result){
//         client.query(qryString, function(error, result){
//             if (error){
//                 return response.status(500).send(`Failed to update thing: ${request.params.id} ${error}`);
//             } else {
                
//                 //SEND UPDATED JSON thing BACK
//                 var query = client.query(`SELECT id, ???, ??? FROM things WHERE id = ${request.params.id}`);
//                 var results = [];
    
//                 // Stream results back one row at a time 
//                 query.on('row', function(row) {
//                     results.push(row); 
//                 });
    
//                 // After all data is returned, close connection and return results 
//                 query.on('end', function() {
//                     response.json(results); 
//                 });
//             }
//         });
//     } else {
//         return response.status(400).send("THING ID is invalid");
//     }
// });


// Delete a single item
app.delete('/item/:id', function(request, response){
    console.log("Delete: " + request.params.id);
	if ((request.params.id) && (request.params.id > 0)) {
        var query = client.query(`DELETE FROM item WHERE id = ${request.params.id}`, function(error, result) {
            if (error){
                return response.status(500).send("Failed to delete item: " + error);
            }
        });       
    } else {
        return response.status(400).send("Item ID is invalid");
    }
});

// Initalise schema if required and start server
client.initSchema(() => {        
    //Start web server
    var port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
});
