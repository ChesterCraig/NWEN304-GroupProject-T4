//Module responsible for all queries to our psql database.
//Allows for some abstraction in the main index.js server file.

/*
getItems
getItem
createItem
deleteItem

getUsers
getUser
createUser
deleteUser

createBasket
deleteBasket

createBasketItem
deleteBasketItem

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

q.deleteItem = function(client, id, callback) {
    client.query(`DELETE FROM item WHERE id = ${id}`, function(error, result) {
        callback(error);
    });
}


//========== USERS_ACCOUNTS ========================

// Get Users 
q.getUsers = function (client, callback) {
    var query = client.query(`select * from user_account`);
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



// User
q.deleteUser = function (client,id,callback) {
    // Cascading delete defined in schema will result in all basketes and basket items relating to this user being removed too
    client.query(`DELETE FROM item WHERE id = ${id}`, function(error, result) {
        callback(error);
    });
};


//========== BASKET ========================

q.createBasket = function (client, id, callback) {
    var queryString = `INSERT INTO BASKET (user_account) VALUES (${id}) RETURNING id, user_account`;
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

q.deleteBasket = function (client,id,callback) {
    //Cascading delte will delete all items in this basket too
    client.query(`DELETE FROM BASKET WHERE id = ${id}`, function(error, result) {
        callback(error);
    });
};


//========== BASKET ITEM ========================

q.createBasketItem = function (client,details,callback) {
    var queryString = `INSERT INTO basket_item (basket, item, quantity) VALUES (${details.basket},${details.item},${details.quantity})`;
    queryString = queryString + ``;
    
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
}

q.deleteBasketItem = function (client,id,callback) {
    client.query(`DELETE FROM BASKET_ITEM WHERE id = ${id}`, function(error, result) {
        callback(error);
    });
};


module.exports = q;