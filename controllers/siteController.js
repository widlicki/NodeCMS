const mongoose = require('mongoose');
const Content = require('../models/content');
const Page = require('../models/page');
const PageTemplate = require('../models/page-template');
const customFields = require('mongoose-custom-fields');
const global = require('../common/common.js');
const path = require('path');
const logger = require('../logger');
const async = require('async');
const Site = require('../models/site-config');
mongoose.Promise = Promise;

function getGridWidth(columns){
	var width = 12;
	
	switch(columns) {
	case 1:
		width = 12;
		break;
	case 2:
		width = 6;
		break;
	case 3:
		width = 4;
		break;  
	case 4:
		width = 3;
		break; 
	case 6:
		width = 2;
		break; 
	}
	return width;
}

function parseContent (page, pageContents, isAdmin) {
	var contentDisp = "";
	var thisContentKeys = [];
	var thisKey = "";
	var templateDispField = "";
	var fieldContent = "";
	var allContent = "";
	var width = 12;
	
	//add custom css definied in page template
	allContent += "<style>"+ page.contentcss +"</style>";

	//calculate column widths
	if(page.columns !== undefined){
		width = getGridWidth(page.columns);
	}

	//render content to page
	for (let i = 1; i <= pageContents.length; i+=1) {
		if(page.columns !== undefined && page.columns > 0){
			if(i % page.columns === 1 ){
				allContent += '<div class="row sortable"><div id="' + pageContents[i-1]._id +'" class="content col-sm-' + width + '">';
			} else {
				allContent += '<div id="' + pageContents[i-1]._id +'" class="content col-sm-' + width + '">'; 
			}
		}
		
		contentDisp = page.contenthtml;
		thisContentKeys = pageContents[i-1].customKeys;

		for (let j = 0; j < thisContentKeys.length; j+=1) {
			thisKey = thisContentKeys[j];
			templateDispField = "[" + thisKey + "]";
			fieldContent = pageContents[i-1].customField(thisKey);
			contentDisp = contentDisp.replace(templateDispField, fieldContent);
		}

		allContent += contentDisp;

		if(isAdmin){
			allContent += `<a href="/content/delete/${pageContents[i-1]._id}" class="btn btn-danger">Delete</a>
		    <a href="/content/update/${pageContents[i-1]._id}" class="btn btn-primary">Update</a>`;
		} 

		if(page.columns !== undefined && page.columns > 0){
			if(i % page.columns === 0 ){
				allContent += '</div></div>';
			} else {
				allContent += '</div>';
			}
		}
	}
	
	allContent += '</div>';
	return allContent;
}

module.exports = {
	getImages: function (req, res) {
		res.sendFile(path.resolve('./uploads/' + req.params.file_name));
	},

	siteSearch: function (req, res) {
		var search_field = req.body.search_field,
			search_value = req.body.search_value,
			search_page = req.body.page,
			page = null,
			templates = null,
			content = null,
			customFields = null,
			contentKeys = null,
			allContent = "";

		Page.findById(search_page)
			.then(function (page) {
				var result = [];
				result.push(page);
				return result;
			})
			.then(function (result) {
				return Content.find({
					page: search_page,
					_customFields: {
						$elemMatch: {
							name: search_field
						}
					},
					_customFields: {
						$elemMatch: {
							value: search_value
						}
					}
				})
					.then(function (content) {
						allContent = parseContent(result[0], content)
						result.push(allContent);
						return result;
					});
			})
			.then(function (result) {
				res.render('site/content', {
					title: 'Content',
					page: result[0],
					content: result[1],
					nav: req.session.nav,
					searchFields: null,
					loggedIn: true,
					siteConfig: req.session.siteConfig
				});
			})
			.then(undefined, function (err) {
				logger.error(err);
			})

	},

	getSite: function (req, res) {
		var page = null;
		var templates = null;
		var content = null;
		var customFields = null;
		var contentKeys = null;
		var allContent = "";
		var siteNav = req.session.nav;

		Page.findById(req.params.id)
			.then(function (page) {
				var result = [];
				var authorized = false;
				var admin = false;
				var thisPageRole = page.role;

				if (req.session.role === 'admin') {
					authorized = true;
					admin = true;
				} else if (req.session.role === 'user' && thisPageRole === 'user') {
					authorized = true;
				} else if (req.session.role === 'superUser' && (thisPageRole === 'user' || thisPageRole === 'superUser')) {
					authorized = true;
				}

				if (!authorized) {
					throw new Error();
				}

				return [admin, req.session.nav, page];
			})
			.then(function (result) {
				return Content.find({
					'page': req.params.id
				}, null, {sort: {position: 1}})
					.then(function (pageContents) {
						allContent = parseContent(result[2], pageContents, result[0])
						result.push(allContent);
						return result;
					});
			})
			.then(function (result) {
				var page = result[2];
				if (page.searchable) {
					return PageTemplate.findOne({
						'name': page.template
					})
						.then(function (pageTemplate) {
							var field_ary = [];
							var fieldObj = null;
							for (let i = 1; i < 21; i+=1) {
								fieldObj = JSON.parse(pageTemplate.field_list);

								if (fieldObj.fields[i - 1] !== undefined) {
									if (fieldObj.fields[i - 1].search === 'yes') {
										field_ary.push(fieldObj.fields[i - 1].name)
									}
								}
							}
							result.push(field_ary);
							return result;
						})
				} else {
					return result;
				}
			})
			.then(function (result) {
				res.render('site/content', {
					title: 'Content',
					page: result[2],
					content: result[3],
					nav: result[1],
					searchFields: result[4],
					loggedIn: true,
					admin: result[0],	
					siteConfig: req.session.siteConfig
				});
			})
			.then(undefined, function (err) {
				logger.error(err);
				res.render('errors', {
					title: 'An Error has occured',
					message: 'An Error has occured',
					nav: req.session.nav,
					loggedIn: true,
					siteConfig: req.session.siteConfig
				});
			})
	}
}