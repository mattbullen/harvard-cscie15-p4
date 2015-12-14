
#### Live URL

http://p4.matthewbullen.me

#### Description

A Laravel 5, Google Polymer 1.0, and D3.js one page web app for fitness tracking. Details:
* Laravel handles all of the server-side functionality.
* Polymer handles the browser-side layout, templating, data-binding, and general user flow.
* I used D3 for the main graph that tracks work out sessions.
* The app uses two sets of CRUD operations: the first set manages the list of exercise names/categories, and the second manages the records of individual work out sessions.
* Users are authenticated using the Google OAuth2 API. After passing Google authentication, the app only needs the user's e-mail address to link exercises/sessions to that user.
* For testing, I made two test accounts: jillcscie15@gmail.com and jamalcscie15@gmail.com (the passwords are listed in the Canvas submission page). These accounts are pre-seeded with randomly-generated values for a short list of exercises.

#### Demo

TBD

#### Details for teaching team

* The W3 HTML validator doesn't recognize the custom DOM tags or link hrefs that Polymer needs to work. I'm not sure that it's validating all of the generated DOM or Shadow DOM elements that Polymer uses inside the app, either. The W3 CSS validator doesn't seem to recognize the D3/SVG style rules in app.css, or some of the vendor prefixes used by normalize.css or the app. Polymer is still pretty new, so I think this might be unavoidable. Otherwise, the HTML and CSS seems to validate.

#### Outside code

* Laravel 5: http://laravel.com
* Polymer 1.0: https://www.polymer-project.org/1.0/ and this [tutorial](https://scotch.io/tutorials/build-a-real-time-polymer-to-do-app)
* Google Web Components OAuth2 sign in button: https://elements.polymer-project.org/elements/google-signin
* D3.js: http://d3js.org/ and http://bl.ocks.org/mbostock
* jQuery 2.1.4: https://jquery.com/download/
