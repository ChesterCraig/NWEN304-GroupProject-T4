const baseUrl = window.location.origin; //"http://localhost:8080";
var user;
$(document).ready(function(e) {
    //hide buttons for loggedin users
    $('#cart').hide();
    $('#logout').hide();
    //
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

function handleKey(e){
    if (e.keyCode == 13) {
        search();
    }
}

function search(){
    $('#men').hide();
    $('#women').hide();
    input = document.getElementById('search');
    filter = $('#search').val();

    $.ajax({
        method: 'POST',
        url: baseUrl +"/itemsearch",
        data: {name: filter},
        success: function(data) {
            renderItems(data);
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

function renderItems(data){
    $('#searchItems').empty();
    for(var i = 0; i<data.length; i++){
        $('#searchItems').append('<h3>'+data[i].name+'</h3>');
        $('#searchItems').append('<h6>'+data[i].description+'</h6>');
        $('#searchItems').append('<img src="'+data[i].image_path+'"</img>');

    }

}

function userExsists(data){
    user = data;
    // show logout button and welcome message
    $('.login').find("a").text("Logout").attr("href","/logout");
    $('#loginDropdown').hide();
    $('#welcome').text('Welcome '+data.display_name).show();
    $('#cart').show();
    $('#logout').show();
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

function getItemDetails(id,callback){
    $.ajax({
        method: 'GET',
        url: baseUrl +"/items/"+id,
        contentType: "application/json",
        //dataType: "application/json",
        headers: {Accept: "application/json"}
    }).then(callback,ajaxFail);
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

function ajaxFail(data) {
	console.log('AJAX request failed: ', data);
};