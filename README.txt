NWEN304 group project - Team 4.

https://clothes-shop-nwen304.herokuapp.com/

This NodeJs based RESTful web application provides users access to a wide range of clothing items for sale.
Users may onl browse without a login.
To add items to your cart you will need to register and be logged in.
User registration is handled via (email/password) or facebook OAuth meaning you can opt to use a facebook account register and sign in.
-------------

--Database--
If run locally the connection to the databse is handled through a seperate js file called ./Config/dbConfig.js.
This js file can be used to define the database connection strings required to connect to your database. If the application is run from an environment where the following variable is available (such as Heroku) process.env.DATABASE_URL then it will opt to use this instead of the credentials stored in js file.
This file must contain contain your appropriate local db credentails in the following format
module.exports = {
    "username":"dbUserName",
    "password":"Password",
    "location":"localhost:5432/dbName"
}

You do not need to setup any tables in the database as the application will create the tables if they do not exist and populate the items table with dummy data upon startup of the application.


--Facebook OAUTH--
If run locally you will need to setup an OAUTH accoutn with facebook and store your credentials in ./Config/fbConfig.js in the following format:
module.exports = {
    clientID: 1122345678,
    clientSecret: "examplesecret123123",
    callbackURL: "Whatever your callback url is
  };
Otherwise these values are pulled from our heroku application environment variables to ensure thier security (not storing them in plain text).

--- HOW TO RUN--- 
1. setup and configure postgres databse
2. add apporpirate connection info to ./Config/dbConfig.js
3. optionally register for fb oauth and add appropriate info to ./Config/fbConfig.js
4. npm install                                                                               <-- Install all dependenceies 
5. npm start                                                                                 <-- start local server



--REST interface design--
GET /items          Gets all items in array of item objects
POST /items         [DISABLED] With details in JSON body, can create a new item in the items schema. This is disabled as we dont want just anybody adding items to our shop.
GET /items/:id      Gets item details json / renders html page if request header accepts html.
DELETE /items/:id   [DISABLED] removes item. disabled as we dont want just anybody deleting items 
GET /allbasketitems [ADMIN] Gets Array of all items in every basket
GET /basketitems    Gets all items in a users basket
POST /basketitem    Add item to my users basket
PUT /basketitem     used to update quantity of a basket item
DELETE /basket/:id  Deletes an item in users basket 
DELETE /basket      [ADMIN] deletes all basket item from any user
POST /user          add new user account (email & password)
GET /users/:id      Get user ...
DELETE /users/:id   Delete user ...
GET /users get list of all users

--OTHER?--
GET /auth/facebook  Redirect the user to Facebook for authentication
POST /login         login via email password
GET /logout         logout user redirect to home
GET /               render homepage html
GET /cart           [LOGGEDIN]  render users cart page
GET /men            render men catagory of items
GET /women          render women catagory of items
POST /itemsearch    search for item
GET /user           get current user details

--Error handling--
Client side error handling is limited, as most actions are a result of the requests/response to the server and server side failures should be represented as a 4xx/5xx http code response.

Server side error checking consists of:
-db conenction error checking and error throwing
-intial schema setup query error checking and error throwing
-validation against some missing required JSON parameters and throwing of 400 status code http responses
-validation against failed query execution and throwing 500 status code http response.