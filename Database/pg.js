var pg = require('pg');


//Get connection information for database
if (process.env.DATABASE_URL) {
    //Heroku hosted database
    var connectionString = process.env.DATABASE_URL; // Heroku based db credentials
} else {
    var config = require('./../Config/dbConfig');
    var connectionString = `postgres://${config.username}:${config.password}@${config.location}`;  // db/dbConfig.js based credentials
}

console.log(`Database connection: ${connectionString}`);

//Parse configuration file containing info needed to connect to database
var client = new pg.Client(connectionString); 
client.connect((error) => {
    if (error) {
        console.log(`Failed to connect to database: ${connectionString}`,error);
        throw error;
    }
});

client.initSchema = function (callback) {
    
    // Create Item and user table
    var qry = "CREATE TABLE IF NOT EXISTS ITEM (";
    qry = qry + "id serial primary key,";
    qry = qry + "name CHAR(255),";
    qry = qry + "description CHAR(255),";
    qry = qry + "price REAL";
    qry = qry + ");";

    qry = qry + "CREATE TABLE IF NOT EXISTS USER_ACCOUNT (";
    qry = qry + "id int primary key,";
    qry = qry + "display_name CHAR(255)";
    qry = qry + ");";

    client.query(qry, function(error, result){
        if (error) {
            console.log('Failed to run init schema query. Server not started.');
            throw error;
        } else {
            callback();  
        }
    });
}

module.exports = {client};
