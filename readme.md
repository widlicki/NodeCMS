# Node CMS

Simple CMS written in Node.Js, Express and MongoDB

  - Type some Markdown on the left
  - See HTML in the right
  - Magic

# Installation

Download Repository and extract

```sh
$ cd <installation directory>
$ npm install -d
```

Configure Database Connection:
```sh
<installation directory>/db.js
```
  - Point database connection to a new local or remote mongodb database. Example connection in db.js file provides example to mlab.com remote database using a sandbox account

Start Server
 - from installation directory, start node server
```sh
node app.js
```
# Initial Setup
Verify server startup and launch browser
```sh
localhost:3000
```


Initial deployment will launch cms setup wizard. Enter information to setup administrator account
and initial site config.

# Site Setup
To beging setup, login with newly created administrator account and click on "admin" console on top navbar. Administrator console contains the following functionality used to set up site settings, templates, page content, and users

  - ### Config Page
     - Define Site setting options, including site name, home page setting and enable/disable new        user/signup functionaly

  - ### Templates
    - Define date structures used for site pages

   - ### Pages
     - Add / manage site pages based on data templates created in previous step
       - define number of layout columns
       - add site page to main navigation
       - enable page search box
       - define site role visibility of page
     - Creating a page will automatically create form input fields for content as well as html 
       markup for rendering content. Html markup can be customized using inline editor on form 
       and further customized by creating additional css rules in site css files

    - ### Content
      - Add / Update content for site pages created

License
----

MIT

 