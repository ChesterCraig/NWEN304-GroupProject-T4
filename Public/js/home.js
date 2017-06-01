const baseUrl = window.location.origin; //"http://localhost:8080";

$(document).ready(function(e) {
    getUser();
    //userExsists();

});
function getUser(){
	$.ajax({
    method: 'GET',
    url: baseUrl + "/user",
	 contentType: "application/json",
	 dataType: "json"
 }).then(userExsists, ajaxFail);
};

function userExsists(data){
    $('.login').find("a").text("Logout").attr("href","/logout");
};

//AJAX callbacks
function ajaxSuccess(data) {
    console.log("Recieved data back from server for our ajax call",data);
};

function ajaxFail(data) {
	console.log('AJAX request failed: ', data);
};