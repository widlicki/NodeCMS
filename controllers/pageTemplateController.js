const PageTemplate = require('../models/page-template');
const global = require('../common/common.js');
const logger = require('../logger');

module.exports = {
	getPageTemplates: function (req, res) {
		PageTemplate.find(function (err, pageTemplates, count) {
			res.render('page-template', {
				title: 'Manage Page Templates',
				pageTemplates: pageTemplates,
				nav: req.session.nav,
				loggedIn: true,
				message: req.flash('info'),
				siteConfig: req.session.siteConfig
			});
		});
	},

	createPageTemplate: function (req, res) {
		res.render('page-template/create', {
			title: 'Create Page Template',
			nav: req.session.nav,
			loggedIn: true,
			siteConfig: req.session.siteConfig
		});
	},

	doCreatePageTemplate: function (req, res) {
		function createHtmlClass (field_name) {
			field_name = field_name.replace(/ /g, "-").toLowerCase();
			return field_name;
		}

		var field_name = "",
			field_value = "",
			formFieldData = global.parseCustomFields(req.body),
			fieldsJson = JSON.stringify(formFieldData);

		new PageTemplate({
			name: req.body.name,
			description: req.body.description,
			field_list: fieldsJson
		}).save(function (err, PageTemplate, count) {
			req.flash('info', 'Template Has been created!');
			res.redirect('/page-template');
		});
	},

	updatePageTemplate: function (req, res) {
		PageTemplate.findById(req.params.id, function (err, pageTemplate) {
			res.render('page-template/update', {
				title: 'Update Template',
				pageTemplate: pageTemplate,
				nav: req.session.nav,
				loggedIn: true,
				siteConfig: req.session.siteConfig
			});
		});
	},

	doUpdatePageTemplate: function (req, res) {
		function createHtmlClass(field_name) {
			field_name = field_name.replace(/ /g, "-").toLowerCase();
			return field_name;
		}

		var field_name = "",
			field_value = "",
			formFieldData = global.parseCustomFields(req.body),
			fieldsJson = JSON.stringify(formFieldData);

		PageTemplate.findById(req.params.id, function (err, pageTemplate) {
			pageTemplate.name = req.body.name;
			pageTemplate.description = req.body.description;
			pageTemplate.field_list = fieldsJson;

			pageTemplate.save(function (err, pageTemplate, count) {
				res.redirect('/page-template');
			});
		});
	},

	deletePageTemplate: function (req, res) {
		PageTemplate.findById(req.params.id, function (err, pageTemplate) {
			res.render('page-template/delete', {
				title: 'Delete Page Template',
				pageTemplate: pageTemplate,
				nav: req.session.nav,
				loggedIn: true,
				siteConfig: req.session.siteConfig
			});
		});
	},

	doDeletePageTemplate: function (req, res) {
		PageTemplate.findById(req.params.id, function (err, pageTemplate) {
			pageTemplate.remove(function (err, photo) {
				req.flash('info', 'Template Has been deleted!');
				res.redirect('/page-template');
			});
		});
	}
}