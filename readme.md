
#### Live URL

http://p4.matthewbullen.me

#### Description

A Laravel 5, Google Polymer 1.0, and D3.js one page web app for fitness tracking. Details:
* Laravel handles all of the server-side functionality.
* Polymer handles the browser-side layout, templating, data-binding, and general user flow. I chose Polymer since I haven't used it before, and I wanted to try making a true one page app that uses data-binding to update the layout, instead of using multiple templates or pages.
* I used D3 for the main graph that tracks work out sessions. Similar to the page template, the graph is dynamic and autoupdates when the underlying data changes. It interfaces with the Laravel back end using AJAX calls. I hadn't tried blending D3 with Laravel or Polymer before, either, and aside from needing to pay a little more attention to function scopes, all three work together really nicely.
* The app uses three MySQL tables: registered user e-mail addresses, a list of exercise names, and a table to hold invidual workout session records.
* The app uses two sets of CRUD operations: the first set manages the list of exercise names/categories, and the second manages the records of individual work out sessions.
* Users are authenticated using the Google OAuth2 API. After passing Google authentication, the app only needs the user's e-mail address to link exercises/sessions to that user.

#### Demo

TBD

#### Details for teaching team

* For testing, I made two test accounts: jillcscie15@gmail.com and jamalcscie15@gmail.com (the passwords are listed in the Canvas submission page). These accounts are pre-seeded with randomly-generated values for a short list of exercises.
* The app was written for Chrome (latest version). It struggles with Internet Explorer, even using Edge or IE10, and with Firefox for Windows. These browsers don't seem to recognize some of the SVG components or imports used by Polymer, but without always throwing specific errors. For example, the initial welcome/sign in modal sometimes only displays properly in IE after you open the F12 developer tools panel. I've fixed what I could and added some crossbrowser compatibility, but the front end components only work the way I intended in Chrome.
* The W3 HTML validator doesn't recognize the custom DOM tags or link hrefs that Polymer needs to work. I'm not sure that it's validating all of the generated DOM or Shadow DOM elements that Polymer uses inside the app, either. The W3 CSS validator doesn't seem to recognize the D3/SVG style rules in app.css, or some of the vendor prefixes used by normalize.css or the app. Polymer is still pretty new, so I think this might be unavoidable. Otherwise, the rest of the HTML and CSS seems to validate.

#### Outside code

* Laravel 5: http://laravel.com
* Polymer 1.0: https://www.polymer-project.org/1.0/ and this [tutorial](https://scotch.io/tutorials/build-a-real-time-polymer-to-do-app)
* Google Web Components OAuth2 sign in button: https://elements.polymer-project.org/elements/google-signin
* D3.js: http://d3js.org/ and http://bl.ocks.org/mbostock
* jQuery 2.1.4: https://jquery.com/download/
* jQuery dateFormat polyfill (for IE): https://github.com/phstc/jquery-dateFormat
