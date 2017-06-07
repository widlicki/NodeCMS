$(function(){
    
    
 $('.alert-success').css("display", "none"); 

    
    
$('.del-user').click(function(){
    
   $('#conf-delete').attr('value', $(this).attr('id')); 
    
});
    
    
 $('#conf-delete').click(function(){
 
     var thisId = $(this).attr('value');
   
     $.ajax({
       url: '/user/delete',
       type: 'POST',
       data: {
           id: thisId
       },
       error: function() {
         alert("error deleting user");
       },
       
       success: function(data) {
          $('.modal-content').css("display", "none");
          $('.alert-success').html("User Deleted");
          $('.alert-success').css("width", "100%");
          $('.alert-success').css("display", "inline-block"); 
            
       }
       
    });
     


 });
 


});