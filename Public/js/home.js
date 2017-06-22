const baseUrl = window.location.origin; //"http://localhost:8080";
var userID;
$(document).ready(function(e) {
    $('#cart').hide();
    getUser();

    $('#registerForm').submit(function(event){
        event.preventDefault();
       var raw = $(this).serializeArray();
        var data = {};
            $.each(raw,function(){
                data[this.name] = this.value;
            });
        register(data);
        location.reload();
    });
    // $('#loginForm').submit(function(event){
    //     //event.preventDefault();
    //     var raw = $(this).serializeArray();
    //     var data = {};
    //     $.each(raw,function(){
    //             data[this.name] = this.value;
    //         });
    //     login(data);
    // });

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
    $('#loginDropdown').hide();
    $('#cart').show();
};

function register(data){
    $.ajax({
        method: 'POST',
        url: baseUrl +"/user",
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json"
    }).then(ajaxSuccess,ajaxFail);
};
// function login(data){
//     $.ajax({
//         method: 'POST',
//         url: baseUrl +"/login",
//         data: JSON.stringify(data),
//         contentType: "application/json",
//         dataType: "json"
//     }).then(ajaxSuccess,ajaxFail);
// };

//AJAX callbacks
function ajaxSuccess(data) {
    console.log("Recieved data back from server for our ajax call",data);
};
;
function ajaxFail(data) {
	console.log('AJAX request failed: ', data);
};