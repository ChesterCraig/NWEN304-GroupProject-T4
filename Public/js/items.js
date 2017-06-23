$(document).ready(function(e) {
    $("#addtocart").click(function(){
        var data = {item: itemId,
                    quantity:1};
        addToCartItem(data)
    });    
});

function addToCartItem(data){
	$.ajax({
    method: 'POST',
    url: baseUrl + "/basketitem",
    data: JSON.stringify(data),
	contentType: "application/json",
	dataType: "json"
 }).then(fillCart, ajaxFail);
};


function fillCart(data) {
    console.log("Recieved data back from server for our ajax call",data);
};
