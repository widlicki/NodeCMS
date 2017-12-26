const Page = require('../models/page');
const PageTemplate = require('../models/page-template');
const Content = require('../models/content');
const fs = require('fs');
const async = require('async');
const logger = require('../logger');
	
module.exports = {
	getContent: function (req, res) {
		Page.find(function (err, pages) {
			res.render('content', {
				title: 'Manage Content',
				pages: pages,
				nav: req.session.nav,
				loggedIn: true,
				siteConfig: req.session.siteConfig
			});
		});
	},
	manageContentById: function (req, res) {

		async.series([
			//GET ALL PAGE INFO 
			function (callback) {
				Page.findById(req.params.id, function (err, page) {
					callback(null, page);
				});
			},
			//GET ALL PAGE CONTENT
			function (callback) {
				Content.find({
					'page': req.params.id
				}, function (err, pageContents) {
					callback(null, pageContents);
				});
			}
		],

		//FINALLY RENDER CONTENT VIEW
		function (err, results) {
			let page = results[0];
			let content = results[1];
			let allContent = "";
			let fieldContent = "";
			let thisKey = "";
			let templateDispField = "";
			let contentDisp = page.contenthtml;
			let thisContentKeys = "";

			for (let i = 0; i < content.length; i += 1) {
				contentDisp = page.contenthtml;
				thisContentKeys = content[i].customKeys;

				for (let j = 0; j < thisContentKeys.length; j+=1) {
					thisKey = thisContentKeys[j];
					templateDispField = "[" + thisKey + "]";
					fieldContent = content[i].customField(thisKey);
					contentDisp = contentDisp.replace(templateDispField, fieldContent);
				}

				allContent += '<div class="content-mng">' + contentDisp +
						'<a href="/content/delete/' + content[i].id + '">Delete</a>&nbsp;&nbsp;&nbsp;' +
						'<a href="/content/update/' + content[i].id + '">Update</a></div>';
			}

			res.render('content/manage', {
				title: 'Content',
				content: allContent,
				message: req.flash('info'),
				page_id: req.params.id,
				nav: req.session.nav,
				loggedIn: true,
				siteConfig: req.session.siteConfig
			});
		});
	},

	createContent: function (req, res) {

		Page.findById(req.params.id)
			.then(function (page) {
				let result = [];
				result.push(page);
				return result;
			})

			.then(function (result) {
				return PageTemplate.findOne({
					'name': result[0].template
				})
					.then(function (pageTemplate) {
						result.push(pageTemplate);
						return result;
					});
			})
			.then(function (result) {
				res.render('content/create', {
					title: 'Create Content',
					page: result[0],
					pageTemplate: result[1],
					nav: req.session.nav,
					loggedIn: true,
					message: req.flash('info'),
					siteConfig: req.session.siteConfig
				});

			})
			.then(undefined, function (err) {
				logger.error(err);
			});
	},

	doCreateContent: function (req, res) {
		PageTemplate.findById(req.body.page_template_id, function (err, pageTemplate) {
			let PostParams = Object.keys(req.body);
			let content = new Content();
			let imgObj = null;
			let key_ary = [];
			let img_name_ary = [];
			let img_field_ary = [];
			let save_record = true;
			let thisField = "";

			content.page = req.body.page_id;
			content.create_dt = new Date();
			content.update_dt = new Date();
			content.position = 1;

			//Get Form field names for file upload fields
			imgObj = JSON.stringify(req.files);
			imgObj = JSON.parse(imgObj);

			for (let key in imgObj) {
				key_ary.push(key);
			}

			if (req.body.has_file === 'true') {
				for (let i = 0; i < key_ary.length; i += 1) {
					if (req.files[key_ary[i]] !== undefined) {
						if (done === true) {
							imgObj = JSON.stringify(req.files[key_ary[i]]);
							imgObj = JSON.parse(imgObj);
							img_name_ary.push(imgObj.name);
							img_field_ary.push(imgObj.fieldname);
						}
					}
				}
			}

			let fieldObj = JSON.parse(pageTemplate.field_list);

			PostParams.forEach(function (param) {
				if (param !== 'page_id' && param !== 'page_template_id') {
					let passedValidation = true;

					//Check if required fields have values
					fieldObj.fields.forEach(function (field) {
						if (param === field.class && field.req === "yes" && req.body[param] === "") {
							passedValidation = false;
							save_record = false;
							thisField = field.name;
						}
					});

					if (passedValidation) {
						content.customField(param, req.body[param]);
					}
				}
			});

			if (save_record) {
				//add files that were uploaded to db custom fields
				for (let i = 0; i < img_name_ary.length; i += 1) {
					if (img_name_ary[i] !== undefined) {
						content.customField(img_field_ary[i], img_name_ary[i]);
						content.customField('thumbnail|' + img_field_ary[i], "");
					}
				}

				content.save(function (err) {
					if (err) {
						throw err;
					} else {
						req.flash('info', 'Content Has been added!')
						res.redirect('/content/manage/' + req.body.page_id);
					}
				});
			} else {
				req.flash('info', thisField + " is a required field!");
				res.redirect('/content/create/' + req.body.page_id);
			}
		});

	},

	updateContent: function (req, res) {
		Content.findById(req.params.id)
			.then(function (content) {
				let result = [];
				result.push(content);
				return result;
			})
			.then(function (result) {
				return Page.findById(
					result[0].page
				)
					.then(function (page) {
						result.push(page);
						return result;
					});
			})
			.then(function (result) {
				return PageTemplate.findOne({
					'name': result[1].template
				})
					.then(function (pageTemplate) {
						result.push(pageTemplate);
						return result;
					});
			})
			.then(function (result) {
				res.render('content/update', {
					title: 'Update Content',
					content: result[0],
					page: result[1],
					pageTemplate: result[2],
					nav: req.session.nav,
					loggedIn: true,
					siteConfig: req.session.siteConfig
				});
			})
			.then(undefined, function (err) {
				logger.error(err);
			})
	},

	doUpdateContent: function (req, res) {
		let imgObj = null;
		let PostParams = Object.keys(req.body);
		let key_ary = [];
		let img_name_ary = [];
		let img_field_ary = [];

		//Get Form field names for file upload fields
		imgObj = JSON.stringify(req.files);
		imgObj = JSON.parse(imgObj);

		for (let key in imgObj) {
			key_ary.push(key);
		}

		Content.findById(req.body.content_id, function (err, pageContent) {
			pageContent.id = req.body.content_id;
			pageContent.page = req.body.page_id;
			pageContent.update_dt = new Date();
			pageContent.position = 1;

			if (req.body.has_file === 'true') {

				for (let i = 0; i < key_ary.length; i+=1) {
					if (req.files[key_ary[i]] !== undefined) {
						if (done === true) {
							imgObj = JSON.stringify(req.files[key_ary[i]]);
							imgObj = JSON.parse(imgObj);
							img_name_ary.push(imgObj.name);
							img_field_ary.push(imgObj.fieldname);
						}
					}
				}
			}

			PostParams.forEach(function (param) {
				if (param !== 'page_id' && param !== 'content_id') {
					pageContent.customField(param, req.body[param]);
				}

				//add files that were uploaded to db custom fields
				for (let i = 0; i < img_name_ary.length; i+=1) {
					if (img_name_ary[i] !== undefined) {
						pageContent.customField(img_field_ary[i], img_name_ary[i]);
					}
				}
			});

			pageContent.save(function (err, pageContent, count) {
				req.flash('info', 'Content Has been updated!')
				res.redirect('/content/manage/' + req.body.page_id);
			});
		});
	},

	deleteImage: function (req, res) {
		fs.unlinkSync('uploads/' + req.body.file_name);
		Content.findById(req.body.content_id, function (err, pageContent) {
			let PostParams = Object.keys(req.body);
			let properties = pageContent.customKeys;
			let field_value = "";

			for (let i = 0; i < properties.length; i+=1) {

				field_value = pageContent.customField(properties[i]);

				if (pageContent.customField(properties[i]) === req.body.file_name) {
					logger.info("Found Image to delete");
					pageContent.customField(properties[i], null);
					//pageContent.customField("has_file", false);
				}
			}

			pageContent.save(function (err, pageContent, count) {
				req.flash('info', 'Content Has been updated!')
				res.redirect('/content/manage/' + req.body.page_id);
			});
		});
	},

	deleteContent: function (req, res) {
		Content.findById(req.params.id, function (err, pageContent) {
			res.render('content/delete', {
				title: 'Delete Page Content',
				pageContent: pageContent,
				nav: req.session.nav,
				loggedIn: true,
				siteConfig: req.session.siteConfig
			});
		});
	},

	doDeleteContent: function (req, res) {
		Content.findById(req.params.id, function (err, pageContent) {
			pageContent.remove(function (err, pageContent) {
				req.flash('info', 'Content Has been deleted!');
				res.redirect('/content/manage/' + pageContent.page);
			});
		});
	},

	doUpdateContentPosition: function (req, res) {
		let idsArray = JSON.parse(req.body.ids);
		let position = -1;

		idsArray.forEach(function (obj) {
			position += 1;
			Content.update({
				_id: obj
			}, {
				$set: {
					position: position
				}
			}, function (err, doc) {
				if (err) {
					logger.error(err);
					return;
				}
				return;
			});
		});
	}
}