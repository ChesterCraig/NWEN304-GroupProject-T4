$(document).ready(function(e) {
    getCartItems();

    $(document).on('click',".remove",function(){
        var id = parseInt($(this).parents("tr").attr('id'));
        deleteCartItem(id);
    });   
    $(document).on('click',".up",function(){
        $c = $(this).parents("tr").find('.count');
        $c.text(parseInt($c.text())+1);
        
    });
    $(document).on('click',".down",function(){
        $c = $(this).parents("tr").find('.count');
        var count = parseInt($c.text());
        count-=1;
        if(count < 0){
            count = 0;
        }
        $c.text(count);
    });
    $(document).on('click',".update",function(){
        var id = $(this).parents("tr").attr('id');
        var count =$(this).parents("tr").find('.count').text();
        count = parseInt(count);
        var data = {item: id,
                quantity: count};
        updateCartItem(data);
    });  
});


function deleteCartItem(id){
    var data = {id:id};
    $.ajax({
    method: 'DELETE',
    url: baseUrl + "/basket/"+id,
	//contentType: "application/json",
	//dataType: "json"
    //data: JSON.stringify(data)
 }).then(updateCart, ajaxFail);
};

function updateCartItem(data){
   
    $.ajax({
    method: 'PUT',
    url: baseUrl + "/basketitem",
	contentType: "application/json",
	dataType: "json",
    data: JSON.stringify(data)
 }).then(updateCart, ajaxFail);
};

function getCartItems(){
	$.ajax({
    method: 'GET',
    url: baseUrl + "/basketitems",
	 contentType: "application/json",
	 dataType: "json"
 }).then(fillCart, ajaxFail);
};


function fillCart(data) {
    console.log(data);
    data.forEach(function(element) {
        getItemDetails(element.item,function(item){
            console.log(item);
            item = item[item.length-1];
            
            var itemName = "<td>"+item.name+"</td>";
            var itemQuantity = "<td>"+element.quantity+"</td>";
            var totalPrice = "<td>$"+(element.quantity*item.price)+"</td>";
            //var buttons = $("#buttons");
            $("#cartItems").append("<tr id="+element.id+">"+itemName+itemQuantity+totalPrice+"</tr>");
            //$("#"+item.id).append("<td>");
            $("#"+element.id).append("<td>"+($(".buttons").clone()).html()+"</td>");

            $("#"+element.id).find(".count").text(element.quantity);
        });
    });
};
function updateCart(){
    location.reload();
};
