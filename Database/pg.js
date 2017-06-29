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
    // Setup ITEM
    var qry = "CREATE TABLE IF NOT EXISTS ITEM (";
    qry = qry + "id serial primary key,";
    qry = qry + "name VARCHAR(255),";
    qry = qry + "gender VARCHAR(8),";
    qry = qry + "description VARCHAR(255),";
    qry = qry + "price REAL,";
    qry = qry + "image_path VARCHAR(255)";
    qry = qry + ");";

    // Setup USER_ACCOUNTS
    qry = qry + "CREATE TABLE IF NOT EXISTS USER_ACCOUNT (";
    qry = qry + "id serial primary key,";
    qry = qry + "email VARCHAR(255) UNIQUE,";
    qry = qry + "password_hash VARCHAR(255),";
    qry = qry + "facebook_id VARCHAR(255) UNIQUE,";     //Ideally should be big int but id of 1384043198297657 is out of range
    qry = qry + "display_name VARCHAR(255),";
    qry = qry + "is_admin boolean DEFAULT 'F'";
    qry = qry + ");";

    // Setup USER_ACTIVITY - Pending, this table will track user activity.


    // Setup BASKET_ITEM
    qry = qry + "CREATE TABLE IF NOT EXISTS BASKET_ITEM (";
    qry = qry + "id serial primary key,";
    qry = qry + "user_account int REFERENCES user_account ON DELETE CASCADE,";       //FK to user
    qry = qry + "item int REFERENCES item ON DELETE CASCADE,";                      //FK to item
    qry = qry + "quantity int";
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

// populate Item table if it is empty
client.populateItems = function(items){
    client.query("SELECT * FROM item LIMIT 1", function(error, result){
        if (error) {
            console.log('Failed to run init schema query. Server not started.');
            throw error;
        } else {
            if (result.rowCount < 1){
                var queryString = "INSERT INTO item (name, gender, description, price, image_path) VALUES";
                for(i = 0; i < items.length; i++){
                    var item = items[i].item;
                    if (i > 0){
                        queryString += `,`
                    }
                    queryString = queryString + `('${item.name}','${item.gender}','${item.description}', ${item.price} ,'${item.image_path}')`;
                }
                queryString = queryString;
                client.query(queryString, function(error, result){
                    if (error) {
                        console.log('Failed to populate Database. Server not started.');
                        throw error;
                    }
                });
            }
        }
    });

}

module.exports = {client};
