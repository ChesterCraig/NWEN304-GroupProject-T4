//Module responsible for all queries to our psql database.
//Allows for some abstraction in the main index.js server file.

/*
getUser
getUsers
createUser
updateUser
deleteUser

getItem
getItems
updateItem
deleteItem

getBasket
getBaskets
updateBasket
deleteBasket

Eventually activity..
*/

var q = {};

//========== ITEMS ========================
q.getItems = function(client,callback) {
    var query = client.query('select id, name, description, price, image_path from ITEM');
    var results = [];

    //Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.getItem = function(client,id,callback) {
    var query = client.query(`select id, name, description, price, image_path from ITEM where id = ${id}`);
    results = [];

    //Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.createItem = function(client, details, callback) {
    queryString = `INSERT INTO item (name, description, price, image_path) VALUES ('${details.name}','${details.description}',${details.price},'${details.image_path}') `;
    queryString = queryString + `RETURNING id, name, description, price, image_path`;
    var query = client.query(queryString);
    var results = [];

    //Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};




//========== USERS_ACCOUNTS ========================

// Create User
q.getUser = function (client,details,callback) {
    if (details.id) {
        client.query(`SELECT id, display_name FROM USER_ACCOUNT WHERE id = ${id}`,function (error, results) {
            callback(error,results);
        });
    } else {
        callback("Invalid, no ID provided")
    }
};


q.createUser = function (client,details,callback) {
    client.query(`INSERT INTO USER_ACCOUNT (id, display_name) VALUES (${user.id},'${user.displayName}') RETURNING id, display_name`, function (error,result) {
        console.log("Inserted new user, results:",result);
        callback(error,result);
    });
};



// Delete User
q.getUser = function (client,details) {
    console.log("Not implemented");
    return null
};


// Get Users 
q.getUsers = function (client, callback) {

    // // Stream results back a row at a time
    // query.on('row', (row) => {
    //   results.push(row);
    // });
    // // After all data is returned, close connection and return results
    // query.on('end', () => {
    //   done();
    //   return res.json(results);
    // });
        
}

//========== BASKET ========================








module.exports = q;