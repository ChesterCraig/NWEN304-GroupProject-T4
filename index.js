//Import Modules
const express = require('express');
const bodyParser = require("body-parser");
const {client} = require("./db/pg");

//create express app
var app = express();

//Define port as either env variable or 8080 
var port = process.env.PORT || 8080;

//body parser middleware (gives us req.body elements parsed from clients http request)
app.use(bodyParser.json());

//Setup middleware to serve up anything in public folder. Root will point to our index.html
app.use(express.static(__dirname + "/Public"));

//OAUTH and OPEN ID prep here


//========RESTful====API=======   this is just a skeleton 
//GET ALL THINGS
app.get('/things', (request,response) => {
    console.log("Get all todos");
    var query = client.query("SELECT * FROM ??"); 
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

//GET SPECIFIC THING
app.get('/things/:id', (request,response) => {
    console.log("Get specific todo: " + request.params.id);
    if ((request.params.id) && (request.params.id > 0)) {
        var query = client.query(`SELECT * FROM things WHERE id = ${request.params.id}`);
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
        return response.status(400).send("ID is invalid");
    }
});

//CREATE A NEW THING
app.post('/todos', function(request, response){
    //body parser used 
    console.log("Create thing with data from http json body", request.body);
      if (request.body.item) {
        var query = client.query(`INSERT INTO things (???,???) VALUES ('${request.body.item}',False) RETURNING id, ??, ??`);
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


//UPDATED A THING
app.put('/todo/:id', function(request, response){
	console.log("Update todo with data: ", request.body);
    if ((request.params.id) && ((request.body.completed === true || request.body.completed === false) || (request.body.item))) {
        var qryString = `UPDATE thing SET col = ????`;
        qryString = qryString + ` WHERE id = ${request.params.id}`;
        
        //var query = client.query(qryString, function(error, result){
        client.query(qryString, function(error, result){
            if (error){
                return response.status(500).send(`Failed to update thing: ${request.params.id} ${error}`);
            } else {
                
                //SEND UPDATED JSON thing BACK
                var query = client.query(`SELECT id, ???, ??? FROM things WHERE id = ${request.params.id}`);
                var results = [];
    
                // Stream results back one row at a time 
                query.on('row', function(row) {
                    results.push(row); 
                });
    
                // After all data is returned, close connection and return results 
                query.on('end', function() {
                    response.json(results); 
                });
            }
        });
    } else {
        return response.status(400).send("THING ID is invalid");
    }
});


//DELETE A SINGLE THING
app.delete('/todo/:id', function(request, response){
    console.log("Delete: " + request.params.id);
	if ((request.params.id) && (request.params.id > 0)) {
        var query = client.query(`DELETE FROM thing WHERE id = ${request.params.id}`, function(error, result) {
            if (error){
                return response.status(500).send("Failed to delete todo: " + error);
            }
        });       
    } else {
        return response.status(400).send("THING ID is invalid");
    }
});

//Initalise schema if required and start server
client.initSchema(() => {        
    //Start web server
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
});
