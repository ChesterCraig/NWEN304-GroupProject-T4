const baseUrl = window.location.origin; //"http://localhost:8080";

$(document).ready(function(e) {
    //Website code here


    //probably want to invoke some ajax functions to fetch data to populate our site


    //user actions will likely invoke some AJAX functions to fetch or manipulate resources


}); // end ready


//AJAX Function skeletons... just need to fill in what we need
//POST (create)
function addThing(item){
	$.ajax({
    method: 'POST',
    url: baseUrl + "/??????",
    data: JSON.stringify(item),
	 contentType: "application/json",
	 dataType: "json"
 }).then(ajaxSuccess, ajaxFail);
}

//PUT (update)
function updateThing(id, changes){
	$.ajax({
    method: 'PUT',
    url: baseUrl + "/?????/" + id,
    data: JSON.stringify(changes),
	contentType: "application/json",
	dataType: "json"
 }).then(ajaxSuccess, ajaxFail);
}

//GET ALL
function loadAllThings() {
	$.ajax({
    method: 'GET',
    url: baseUrl + "/todos",
    }).then(ajaxSuccess, ajaxFail);
}

//DELETE (remove)
function removeThing(id) {
	$.ajax({
    method: 'DELETE',
    url: baseUrl + "/????/" + id,
 }).then(ajaxSuccess, ajaxFail);
}


//AJAX callbacks
function ajaxSuccess(data) {
    console.log("Recieved data back from server for our ajax call",data);
};

function ajaxFail(data) {
	console.log('AJAX request failed: ', data);
};
