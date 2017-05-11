var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');
var userController = require('../controllers/userController');
var siteConfigController = require('../controllers/siteConfigController');
var pageTemplateController = require('../controllers/pageTemplateController');
var siteController = require('../controllers/siteController');
var pageController = require('../controllers/pageController');
var contentController = require('../controllers/contentController');
var indexController = require('../controllers/indexController');

var isAuthenticated = function authenticated(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

module.exports = function (passport) {

    /*index route*/
    router.get('/', indexController.getHomepage);

    /*Admin Console*/
    router.get('/admin', isAuthenticated, adminController.getAdminConsole);

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


    //Generate Robots txt file
    router.get('/robots.txt', function (req, res) {
        res.type('text/plain');
        res.send("User-agent: *\nDisallow: /");
    });

    return router;

}