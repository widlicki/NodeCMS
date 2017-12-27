$(function () {
	$('#template').change(function () {
		var opt = $("#template option:selected").val();
		var contentDivClass = opt.replace(/ /g, "-").toLowerCase();

		$.get('/page/getTemplateFields/' + opt, function (data) {
			var obj = jQuery.parseJSON(data.field_list);
			var contenthtml = '<div class="' + contentDivClass + ' content-div"> \n';
			var contentcss = `.content-div{
				margin-bottom: 10px;
				border: 1px solid lightgray;
				padding: 20px;
				border-radius: 2px;
				-webkit-box-shadow: 1px 1px 5px 0px rgba(0,0,0,0.74);
				-moz-box-shadow: 1px 1px 5px 0px rgba(0,0,0,0.74);
				box-shadow: 1px 1px 5px 0px rgba(0,0,0,0.74);
				background-color: white;
				min-height: 300px;
			  }`;

			var formhtml = '';

			$.each(obj.fields, function (idx, obj) {
				$('#contenthtml').val("");

				switch (obj.type) {
				case "text":
					contenthtml += '\t<div class="' + obj.class + '"> \n\t\t' + obj.name + ': [' + obj.class + ']\n\t</div> \n';

					formhtml += '\t<div class="form-group">' +
						'\n\t\t <label for="' + obj.class + '">' + obj.name + '</label>' +
						'\n\t\t <input type="text" class="form-control" name="' + obj.class + '">' +
						'\n\t</div>\n';

					break;
				case "textarea":
					contenthtml += '\t<div class="' + obj.class + '"> \n\t\t' + obj.name + ': [' + obj.class + ']\n\t</div> \n';

					formhtml += '\t<div class="form-group">' +
						'\n\t\t <label for="' + obj.class + '">' + obj.name + '</label>' +
						'\n\t\t <textarea class="form-control" name="' + obj.class + '"></textarea>' +
						'\n\t</div>\n';
					break;
				case "upload":
					contenthtml += '\t<div class="' + obj.class + '"> \n\t\t<img src="/images/[' + obj.class + ']">\n\t</div> \n';
					formhtml += '\t<div class="form-group ' + obj.class + '">' +
						'\n\t\t <label for="' + obj.class + '">' + obj.name + '</label>' +
						'\n\t\t <input type="file" class="form-control" name="' + obj.class + '"> ' +
						'\n\t</div>\n';
					break;

				case "select":
					contenthtml += '\t<div class="' + obj.class + '"> \n\t\t' + obj.name + ': [' + obj.class + ']\n\t</div> \n';
					formhtml += '\t<div class="form-group ' + obj.class + '">' +
						'\n\t\t <label for="' + obj.class + '">' + obj.name + '</label>' +
						'\n\t\t <select class="form-control form-inline" name="' + obj.class + '"> ';

					var opt_ary = obj.data.split(",");

					for (var i = 0; i < opt_ary.length; i+=1) {
						formhtml += '\n\t\t\t<option value="' + opt_ary[i] + '">' + opt_ary[i] + '</option>';
					}

					formhtml += '\n\t\t</select>\n\t</div>\n';
					break;
				}
			});

			contenthtml += '</div>'

			$('#contenthtml').val(contenthtml);
			$('#contentcss').val(contentcss);
			$('#formhtml').val(formhtml);
			
		});
	});

	$('.del-image').click(function () {
		var this_class = $(this).attr('class');
		var class_ary = this_class.split(" ");
		var selector = "." + class_ary[1];

		$.post("/content/deleteimage", {
			file_name: $(this).attr('id'),
			content_id: $("#content-id").attr('value'),
			page_id: $("#page-id").attr('value')
		})
			.done(function () {
				var replace_str = //'<div class="form-group '+this_class+'">' + 
					'<label for="' + this_class + '">' + class_ary[1] + '</label>' +
					'<input type="file" class="form-control" name="' + class_ary[1] + '" />';
	
				$(selector).html(replace_str);
			});
	});

});