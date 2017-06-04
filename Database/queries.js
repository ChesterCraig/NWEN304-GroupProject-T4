//Module responsible for all queries to our psql database.
//Allows for some abstraction in the main index.js server file.

/*
getItems
getItem
createItem
deleteItem

getUsers
getUser
createFaceBookUser
createLocalUser
deleteUser
getUserPasswordHash

createBasket
deleteBasket

createBasketItem
deleteBasketItem
getBasketItems

*/
``
var q = {};


//========== ITEMS ========================

q.getItems = function(client,callback) {
    var query = client.query('select id, name, description, price, image_path from ITEM');
    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

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

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

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
    var queryString = `INSERT INTO item (name, description, price, image_path) VALUES ('${details.name}','${details.description}',${details.price},'${details.image_path}') `;
    queryString = queryString + `RETURNING id, name, description, price, image_path`;
    var query = client.query(queryString);
    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

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
    client.query(`DELETE FROM item WHERE id = ${id}`, function(error) {
        callback(error);
    });
}


//========== USERS_ACCOUNTS ========================

// Get Users
q.getUsers = function (client, callback) {
    var query = client.query(`select id, email, facebook_id, display_name, is_admin from user_account`);
    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    //Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

// Get User (supports id, facebook_id or email)
q.getUser = function (client,details,callback) {
    if (details.id) {
        var query = client.query(`SELECT id, email, facebook_id, display_name, is_admin FROM USER_ACCOUNT WHERE id = ${details.id}`);
    } else if (details.facebook_id) {
        var query = client.query(`SELECT id, email, facebook_id, display_name, is_admin FROM USER_ACCOUNT WHERE facebook_id = '${details.facebook_id}'`);
    } else if (details.email) {
        var query = client.query(`SELECT id, email, facebook_id, display_name, is_admin FROM USER_ACCOUNT WHERE email = '${details.email}'`);
    } else {
        return callback("Invalid, no ID provided");
    }

    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    //Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.getUserPasswordHash = function (client,details,callback) {
    if (details.id) {
        var query = client.query(`SELECT id, password_hash FROM USER_ACCOUNT WHERE id = ${details.id}`);
    } else if (details.facebook_id) {
        var query = client.query(`SELECT id, password_hash FROM USER_ACCOUNT WHERE facebook_id = '${details.facebook_id}'`);
    } else if (details.email) {
        var query = client.query(`SELECT id, password_hash FROM USER_ACCOUNT WHERE email = '${details.email}'`);
    } else {
        return callback("Invalid, no ID provided");
    }

    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

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
q.createFaceBookUser = function (client,details,callback) {
    var query = client.query(`INSERT INTO USER_ACCOUNT (facebook_id, display_name) VALUES (${details.id},'${details.displayName}') RETURNING id, display_name`);
    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    //Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.createLocalUser = function (client,details,callback) {
    var queryString = `INSERT INTO USER_ACCOUNT (email,password_hash,display_name) VALUES ('${details.email}','${details.password_hash}','${details.displayName}') `;
    queryString = queryString + `RETURNING id, email, display_name`;
    var query = client.query(queryString);
    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    //Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

// Delete User
q.deleteUser = function (client,id,callback) {
    // Cascading delete defined in schema will result in all basketes and basket items relating to this user being removed too
    client.query(`DELETE FROM USER_ACCOUNT WHERE id = '${id}'`, function(error) {
        callback(error);
    });
};


//========== BASKET ITEM ========================

q.createBasketItem = function (client,details,callback) {
    var queryString = `INSERT INTO basket_item (basket, item, quantity) VALUES (${details.basket},${details.item},${details.quantity}) `;
    queryString = queryString + `RETURNING basket, item, quantity`;
    
    var query = client.query(queryString);
    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

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
    client.query(`DELETE FROM BASKET_ITEM WHERE id = ${id}`, function(error) {
        callback(error);
    });
};

q.getBasketItems = function (client, id, callback) {
    var queryString = `select id, item, quantity from BASKET_ITEM where basket = ${id}`;
    var query = client.query(queryString);
    var results = [];

    //Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    //Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

module.exports = q;