//This is just an example, you need to creat a ./Config/fbConfig.js which exports an object like below but with the correct clientID and client secret
//This is only required if running locally and will require you change the fb host url to be localhost..
module.exports = {
    clientID: 123123123123123,
    clientSecret: "xxxxxxxxxxxxxxxxxxxx",
    callbackURL: "https://clothes-shop-nwen304.herokuapp.com/auth/facebook/callback"
  };