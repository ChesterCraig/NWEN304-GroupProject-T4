//Module responsible for all queries to our psql database.
//Allows for some abstraction in the main index.js server file.

/*
getItems
getItem
getMaleItems
getFemaleItems
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

var q = {};
module.exports = q;

//========== ITEMS ========================

q.getItems = function(client,callback) {
    var query = client.query('select id, name, gender, description, price, image_path from ITEM;');
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.getItem = function(client,id,callback) {
    var query = client.query(`select id, name, gender, description, price, image_path from ITEM where id = ${id};`);
    results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.createItem = function(client, details, callback) {
    var queryString = `INSERT INTO item (name, gender, description, price, image_path) VALUES ('${details.name}', '${details.gender}','${details.description}',${details.price},'${details.image_path}') `;
    queryString = queryString + `RETURNING id, name, gender, description, price, image_path;`;
    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.getMaleItems = function (client, callback) {
    var queryString = `select * from ITEM where gender = 'Male';`;
    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.getFemaleItems = function (client, callback) {
    var queryString = `select * from ITEM where gender = 'Female';`;
    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.itemSearch = function (client, name, callback) {
    console.log(name);
    var name = name;
    var queryString = `select * from item where lower(name) like lower('%`+name+`%');`;
    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
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
    var query = client.query(`select id, email, facebook_id, display_name, is_admin from user_account;`);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
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
        var query = client.query(`SELECT id, email, facebook_id, display_name, is_admin FROM USER_ACCOUNT WHERE id = ${details.id};`);
    } else if (details.facebook_id) {
        var query = client.query(`SELECT id, email, facebook_id, display_name, is_admin FROM USER_ACCOUNT WHERE facebook_id = '${details.facebook_id}';`);
    } else if (details.email) {
        var query = client.query(`SELECT id, email, facebook_id, display_name, is_admin FROM USER_ACCOUNT WHERE email = '${details.email}';`);
    } else {
        return callback("Invalid, no ID provided");
    }

    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
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
        var query = client.query(`SELECT id, password_hash FROM USER_ACCOUNT WHERE id = ${details.id};`);
    } else if (details.facebook_id) {
        var query = client.query(`SELECT id, password_hash FROM USER_ACCOUNT WHERE facebook_id = '${details.facebook_id}';`);
    } else if (details.email) {
        var query = client.query(`SELECT id, password_hash FROM USER_ACCOUNT WHERE email = '${details.email}';`);
    } else {
        return callback("Invalid, no ID provided");
    }

    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
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
    var query = client.query(`INSERT INTO USER_ACCOUNT (facebook_id, display_name) VALUES ('${details.facebook_id}','${details.displayName}') RETURNING id, facebook_id, display_name;`);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.createLocalUser = function (client,details,callback) {
    if (details.isAdmin == true) {
        var queryString = `INSERT INTO USER_ACCOUNT (email,password_hash,display_name,is_admin) `;
        queryString = queryString + `VALUES ('${details.email}','${details.password_hash}','${details.displayName}','TRUE') `;
        queryString = queryString + `RETURNING id, email, display_name;`;
    } else {
        var queryString = `INSERT INTO USER_ACCOUNT (email,password_hash,display_name) VALUES ('${details.email}','${details.password_hash}','${details.displayName}') `;
        queryString = queryString + `RETURNING id, email, display_name;`;
    }

    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
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


//=========v= BASKET ITEM ========================

q.createBasketItem = function (client,details,callback) {
    var queryString = `INSERT INTO basket_item (user_account, item, quantity) VALUES (${details.user_account_id},${details.item},${details.quantity}) `;
    queryString = queryString + `RETURNING id, item, quantity, user_account;`;
    
    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
}

q.deleteBasketItem = function (client,details,callback) {
    if (details.user_account_id) {
        client.query(`DELETE FROM BASKET_ITEM WHERE id = ${details.id} and user_account = ${details.user_account_id};`, function(error) {
            callback(error);
        });
    } else {
        client.query(`DELETE FROM BASKET_ITEM WHERE id = ${details.item};`, function(error) {
            callback(error);
        });
    }
};

q.deleteBasketItems = function (client,id,callback) {
    client.query(`DELETE FROM BASKET_ITEM WHERE user_account = ${id};`, function(error) {
        callback(error);
    });
};

q.getAllBasketItems = function (client, id, callback) {
    var queryString = `select id, item, quantity from BASKET_ITEM;`;
    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.getBasketItems = function (client, id, callback) {
    var queryString = `select id, item, quantity from BASKET_ITEM where user_account = ${id};`;
    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
};

q.updateBasketItem = function (client,details,callback) {
    var queryString = `UPDATE basket_item set quantity = ${details.quantity} where id = ${details.item} and user_account = ${details.user_account_id} `;
    queryString = queryString + `RETURNING id, item, quantity, user_account;`;
    
    var query = client.query(queryString);
    var results = [];

    // Handle error
    query.on('error', (error) => {
        return callback(error,null);
    });

    // Stream results back a row at a time
    query.on('row', (row) => {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
        callback(null,results);
    });
}