$(function(){
  $('#template').change(function(){
     
      var opt = $( "#template option:selected" ).val();
      var contentDivClass = opt.replace(" ", "-").toLowerCase();

      $.get( '/page/getTemplateFields/'+opt, function(data) {
      
          var obj = jQuery.parseJSON( data.field_list );
          var contenthtml = '<div class="'+contentDivClass+'"> \n';
    
			$.each(obj.fields, function(idx, obj) {
			  
         $('#contenthtml').val("");
 
          switch(obj.type){

             case "text":
               contenthtml += '\t<div class="'+obj.class+'"> \n\t\t'+obj.name+': ['+obj.class+']\n\t</div> \n'; 
               break;

             case "textarea":
               contenthtml += '\t<div class="'+obj.class+'"> \n\t\t'+obj.name+': ['+obj.class+']\n\t</div> \n'; 
               break;

             case "upload":
              contenthtml += '\t<div class="'+obj.class+'"> \n\t\t<img src="/images/['+obj.class+']">\n\t</div> \n'; 
             break;  


          }
      });

			contenthtml += '</div>'

            $('#contenthtml').val(contenthtml);
       });
   });

 $('.del-image').click(function(){

    //alert($("#content-id").attr('value'));

    
   // alert($(this).attr('class'));

     var this_class = $(this).attr('class');
     var class_ary = this_class.split(" ");
     var selector = "." + class_ary[1];

     

     $.post( "/content/deleteimage", { 
         file_name: $(this).attr('id'),
         content_id: $("#content-id").attr('value'),
         page_id: $("#page-id").attr('value')})
     .done(function() {
         
 
       var replace_str = //'<div class="form-group '+this_class+'">' + 
         '<label for="'+this_class+'">'+class_ary[1]+'</label>' + 
         '<input type="file" class="form-control" name="'+class_ary[1]+'" />';
        // </div>';
    
     
    $(selector).html(replace_str);

     });;


 });


 $(".create-thumb").submit(function(e)
{

  alert('createing thumb');
    var postData = $(this).serializeArray();
    var formURL = $(this).attr("action");
    $.ajax(
    {
        url : formURL,
        type: "POST",
        data : postData,
        success:function(data, textStatus, jqXHR) 
        {
            alert("thumbnail created");
        },
        error: function(jqXHR, textStatus, errorThrown) 
        {
           alert("unable to create thumbnail");     
        }
    });
    e.preventDefault(); //STOP default action
    e.unbind(); //unbind. to stop multiple form submit.
});


});