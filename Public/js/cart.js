$(document).ready(function(e) {
    getCartItems();     
});

function getCartItems(){
	$.ajax({
    method: 'GET',
    url: baseUrl + "/basketitems",
	 contentType: "application/json",
	 dataType: "json"
 }).then(fillCart, ajaxFail);
};


function fillCart(data) {
    data.forEach(function(element) {
        getItemDetails(element.item,function(item){
            item = item[0];
            var itemName = "<td>"+item.name+"</td>";
            var itemQuantity = "<td>"+element.quantity+"</td>";
            var totalPrice = "<td>$"+(element.quantity*item.price)+"</td>";
            $("#cartItems").append("<tr>"+itemName+itemQuantity+totalPrice+"</tr>");

        });
    });
};
