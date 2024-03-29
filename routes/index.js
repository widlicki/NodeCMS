const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const siteConfigController = require('../controllers/siteConfigController');
const pageTemplateController = require('../controllers/pageTemplateController');
const siteController = require('../controllers/siteController');
const pageController = require('../controllers/pageController');
const contentController = require('../controllers/contentController');
const indexController = require('../controllers/indexController');
const setupController = require('../controllers/setupController');
const isAuthenticated = function authenticated (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

var isAdmin = function authenticated (req, res, next) {
	if (req.isAuthenticated()) {
		if(req.session.role === 'admin'){
			return next();
		} else {
			res.redirect('/notAuthorized'); 
		}
	} else {
		res.redirect('/login');  
	}
}

module.exports = function (passport) {

	/*index route*/
	router.get('/', indexController.getHomepage);
	
	/*Blank Page*/
	router.get('/homePageNotFound', indexController.getHomePageNotFound);

	/*Setup Wizard*/
	router.get('/setup', setupController.getSetupWizard);
	router.post('/setup-user', setupController.doSetupUser);
	router.get('/setup-site', setupController.setupSite);
	router.post('/setup-site', setupController.doSetupSite);
	
	/*Blank Page*/
	router.post('/setup', siteConfigController.doSetup);
	
	/*Admin Console*/
	router.get('/admin', isAdmin, adminController.getAdminConsole);

	/*login*/
	router.get('/login', userController.login);
	router.post('/login', userController.doLogin);

	/*sign up*/
	router.get('/sign-up', userController.signUp);
	router.post('/sign-up', userController.doSignUp);

	/*logout*/
	router.get('/logout', isAuthenticated, userController.logout);

	/*site config routes*/
	router.get('/site-config', isAuthenticated, siteConfigController.siteConfig);
	router.post('/save-site-config', isAuthenticated, siteConfigController.saveSiteConfig);

	/*Page Template Routes*/
	router.get('/page-template', isAuthenticated, pageTemplateController.getPageTemplates);
	router.get('/page-template/create', isAuthenticated, pageTemplateController.createPageTemplate);
	router.post('/page-template/create', isAuthenticated, pageTemplateController.doCreatePageTemplate);
	router.get('/page-template/update/:id', isAuthenticated, pageTemplateController.updatePageTemplate);
	router.post('/page-template/update/:id', isAuthenticated, pageTemplateController.doUpdatePageTemplate);
	router.get('/page-template/delete/:id', isAuthenticated, pageTemplateController.deletePageTemplate);
	router.post('/page-template/delete/:id', isAuthenticated, pageTemplateController.doDeletePageTemplate);
	router.get('/images/:file_name', isAuthenticated, siteController.getImages);
	router.post('/site/search', isAuthenticated, siteController.siteSearch);
	router.get('/site/:id', isAuthenticated, siteController.getSite);

	/*Page Routes*/
	router.get('/pages', isAuthenticated, pageController.getPages);
	router.get('/page/create', isAuthenticated, pageController.createPage);
	router.post('/page/create', isAuthenticated, pageController.doCreatePage);
	router.get('/page/update/:id', isAuthenticated, pageController.updatePage);
	router.post('/page/update/:id', isAuthenticated, pageController.doUpdatePage);
	router.get('/page/delete/:id', isAuthenticated, pageController.deletePage);
	router.post('/page/delete/:id', isAuthenticated, pageController.doDeletePage);
	router.get('/page/getTemplateFields/:name', isAuthenticated, pageController.getTemplateFieldsByName);

	/*Content Routes*/
	router.get('/content', isAuthenticated, contentController.getContent);
	router.get('/content/manage/:id', isAuthenticated, contentController.manageContentById);
	router.get('/content/create/:id', isAuthenticated, contentController.createContent);
	router.post('/content/create', isAuthenticated, contentController.doCreateContent);
	router.get('/content/update/:id', isAuthenticated, contentController.updateContent);
	router.post('/content/update', isAuthenticated, contentController.doUpdateContent);
	router.post('/content/deleteimage', isAuthenticated, contentController.deleteImage);
	router.get('/content/delete/:id', isAuthenticated, contentController.deleteContent);
	router.post('/content/delete/:id', isAuthenticated, contentController.doDeleteContent);
	router.post('/content/updateContentPosition', isAuthenticated, contentController.doUpdateContentPosition);
	
	
	
	/*Users routes*/
	router.get('/user/manageUsers', isAuthenticated, userController.manageUsers);
	router.get('/user/create', isAuthenticated, userController.createUser);
	router.post('/user/create', isAuthenticated, userController.doCreateUser);
	router.get('/user/update/:id', isAuthenticated, userController.updateUser);
	router.post('/user/update/:id', isAuthenticated, userController.doUpdateUser); 
	router.post('/user/delete', isAuthenticated, userController.doDeleteUser);
	
	router.get('/notAuthorized', isAuthenticated, userController.notAuthorized);

	//Generate Robots txt file
	router.get('/robots.txt', function (req, res) {
		res.type('text/plain');
		res.send("User-agent: *\nDisallow: /");
	});

	return router;

}