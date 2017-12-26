const Page = require('../models/page');
const Site = require('../models/site-config');

module.exports = {

	//Creates object bases on custom fields defined in page templates
	parseCustomFields: function (reqBody) {
		let formFieldData = {
			fields: []
		};

		let paramName = "";
		let paramType = "";
		let paramData = "";
		let paramReq = "";
		let paramSearch = "";

		for (let i = 1; i < 9; i+=1) {
			paramName = "fname" + i.toString();
			paramType = "ftype" + i.toString();
			paramData = "fdata" + i.toString();
			paramReq = "freq" + i.toString();
			paramSearch = "fsearch" + i.toString();

			if (reqBody[paramName] !== "") {
				let jsonData = {};
				jsonData["name"] = reqBody[paramName];
				jsonData["type"] = reqBody[paramType];
				jsonData["class"] = reqBody[paramName].replace(" ", "-").toLowerCase();
				jsonData["data"] = reqBody[paramData];
				jsonData["req"] = reqBody[paramReq];
				jsonData["search"] = reqBody[paramSearch];
				formFieldData.fields.push(jsonData);
			}
		}

		return formFieldData;

	},

	getSiteNav: function (req, res, next) {
		if (req.session.nav === undefined && req.session.role !== undefined) {
			Page.find({
				'add_to_nav': true
			}, function (err, pages) {
				let navStr = "";
				let thisPageRole = "";
				let addToNav = false;
				
				for (let i = 0; i < pages.length; i+=1) {
					addToNav = false;
					thisPageRole = pages[i].role;
				
					if(req.session.role === 'admin'){
						addToNav = true;
					} else if (req.session.role === 'user' && thisPageRole === 'user'){
						addToNav = true;
					} else if (req.session.role === 'superUser' && (thisPageRole === 'user' || thisPageRole === 'superUser' )){
						addToNav = true;
					}
					
					if(addToNav){
						navStr += '<li><a href="/site/' + pages[i].id + '">' + pages[i].name + '</a></li>'
					}
				}

				req.session.nav = navStr;
				next();
			});

		} else {
			next();
		}
	},

	getSiteConfig: function (req, res, next) {
		Site.findOne(function (err, siteConfig) {
			if (siteConfig === null) {
				siteConfig = new Site({
					_id: undefined,
					site_name: "",
					home_page: "",
					disable_new_users: ""
				});
			}

			req.session.siteConfig = siteConfig;
			next();
		});
	}
}