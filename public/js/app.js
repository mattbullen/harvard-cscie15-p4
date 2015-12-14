// Polymer app functionality
Polymer({
    // Identifies the template area inside master.blade.php
    is: "base-app",
    // Holds the values that Polymer's data-binding will inject into the DOM template
    properties: {
        currentUser: String,
        currentExercise: String,
        currentUserFirstName: {
            type: String,
            value: "",
            reflect: true
        },
        menuButtons: {
            type: Array,
            value: [],
            reflect: true
        },
        exerciseNames: {
            type: Array,
            value: [],
            reflect: true
        },
        colorMap: {
            type: Object,
            value: {},
            reflect: true
        }
    },
    // Runs when the app loads
    ready: function() {
        
        // Open the welcome message / sign in modal
        this.openWelcomeModal();
        
        // Pre-render the basic graph scaffolding
        this.createEmptyGraph();
        
        // Set event listeners for the main input bar's submit button
        this.addSessionInputEventListeners();
        
        // User flow: initial element presentation and event listeners
        this.clearLayout();
        this.deactivateEnterSessionsBar();

        // Set up the CSRF token for later use in POST requests
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
        
        // With the app ready to use, start the sign in process
        this.addEventListener('google-signin-success', this.signIn);
        this.addEventListener('google-signed-out', this.signOut);
        this.signIn();
    },
    // Authenticate a user with the Google OAuth2 sign in API
    signIn: function() {
        
        // Extract the user details from the Google OAuth2/JWT sign in object
         if (gapi && gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()) {
            
            // Add the user first name and e-mail address to the local template's model
            var user = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
            this.currentUser = user.po;
            this.currentUserFirstName = user.Ph;
            console.log("\nUser signed in: " + user.Ph + ", " + user.po);
            
            // Move on to the "get the app ready for use" process
            this.handleUser(user.po, user.Ph);
        }
        
        // For debugging:
        // this.currentUser = "xyz@sample.com"; 
        // this.currentUserFirstName = "XYZ";
        // this.handleUser(this.currentUser, "XYZ");
    },
    // POST to the server to verify an existing user e-mail, or to create a new emails table entry if it's the first time the email has been used
    handleUser: function(email) {
    
        // Reference the local instance of the Polymer model
        var model = this;

        // POST handling routine.
        $.ajax({
            type: "POST",
            url: "/email",
            data: { email: email },
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.user) {
                    model.closeWelcomeModal();
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    // User flow: clear the layout when a user signs out
    signOut: function() {
        console.log("\nUser signed out!");
        this.currentUser = "";
        this.currentUserFirstName = "";
        this.menuButtons = [];
        this.clearLayout();
        this.deactivateEnterSessionsBar();
        this.updateGraph({ sessions: [] });
        this.openWelcomeModal();
    },
    // Deactivate the inputs for saving a new session
    deactivateEnterSessionsBar: function() {
        $("#enterSets").val("");
        this.$.enterSets.disabled = true;
        $("#enterReps").val("");
        this.$.enterReps.disabled = true;
        $("#enterWeight").val("");
        this.$.enterWeight.disabled = true;
        $("#enterNotes").val("");
        this.$.enterNotes.disabled = true;
        this.$.saveSession.disabled = true;
    },
    // Clear the menu areas of content
    clearLayout: function() {
        $("#editMenuWrapper").hide();
        $("#viewSummary").hide();
        $("#editExercises").hide();
        $("#entryMessage").html('<div class="centered"><div class="exerciseTitle">Signed Out</div></div>');
    },
    // User flow: handles the initial welcome / sign in modal on app load and user sign out
    openWelcomeModal: function() {
        $(".iron-overlay-backdrop-0").show();
        this.$.welcomeModal.open();
    },
    closeWelcomeModal: function() {
        this.$.welcomeModal.close();
        $(".iron-overlay-backdrop-0").hide();
        $("#viewSummary").fadeIn().show();
        $("#editExercises").fadeIn().show();
        this.setMenuButtons();
        $("#viewSummary").click();
    },
    // The "read" in the CRUD routines for the list of exercise names
    setMenuButtons: function(e) {
        
        // Reference the local instance of the Polymer model
        var model = this;
        var data = {
            name: "all",
            email: model.currentUser
        };
        
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/exercise/read",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.found) {
                    model.updateMenuButtons(response.found);
                } else {
                    model.updateMenuButtons([]);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    // Response handler for setMenuButtons()
    updateMenuButtons: function(data) {

        // Sort and process the exercise name strings
        if (data.length > 0) {
            // data = data.sort(this.sortByProperty("name"));
            var list = [];
            var lowercaseList = [];
            var item, lowercased;
            for (var i = 0; i < data.length; i++) {
                item = data[i].name;
                lowercased = item.toLowerCase();
                list.push({
                    lowercase: lowercased,
                    hyphenated: lowercased.replace(/ /gi, "-")
                });
                lowercaseList.push(lowercased);
            }
            this.menuButtons = list.sort(this.sortByProperty("lowercase"));
            this.exerciseNames = lowercaseList.sort();
        } else {
            this.menuButtons = []
            this.exerciseNames = [];
            var lowercaseList = [];
        }
        
        // Set the graph's color map
        this.getColorMap();
        
        // Add event listeners to the edit menu pop ups
        var vCEI = this.validateCreateExerciseInput;
        this.$.enterCreateExerciseName.addEventListener("keyup", function() { vCEI(lowercaseList); });
        var vUEI = this.validateUpdateExerciseInput;
        this.$.enterUpdateOldName.addEventListener("keyup", function() { vUEI(lowercaseList); });
        this.$.enterUpdateNewName.addEventListener("keyup", function() { vUEI(lowercaseList); });
        var vDEI = this.validateDeleteExerciseInput;
        this.$.enterDeleteExerciseName.addEventListener("keyup", function() { vDEI(lowercaseList); });
    },
    // Event listener to update the menu button list, session entry toolbar, and graph content
    updateContentView: function(e) {
        
        // Retrieve the button's original exercise name from its template model. 
        // Source for syntax: https://stackoverflow.com/questions/32212836/how-to-get-data-attribute-value-of-paper-card-from-on-tap-event
        if (e.model) {
            // For named exercises
            var tag = e.model.item.lowercase;
        } else {
            // For the "summary" view, since it's not actually a named exercise and not in that list, but needed to trigger graph updates
            var tag = (e.target.innerText).toLowerCase();
        }
        if (tag === "summary") {
            this.deactivateEnterSessionsBar();
        } else {
            this.$.enterSets.disabled = false;
            this.$.enterReps.disabled = false;
            this.$.enterWeight.disabled = false;
            this.$.enterNotes.disabled = false;
            this.toggleSaveSession();
        }
        $("#entryMessage").html('<div class="centered"><div class="exerciseTitle">' + tag + '</div></div>');
        console.log("\nMenu button clicked:", tag);
        this.currentExercise = tag;
        this.readSessions();
    },
    // From: https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
    sortByProperty: function(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    },
    // User flow: toggles the visibility of the menu bar to add/update/delete exercise names
    toggleEditMenuWrapper: function() {
        var menu = $("#editMenuWrapper");
        if (menu.css("display") === "none") {
            menu.fadeIn();
        } else {
            menu.fadeOut();
        }
    },
    // User flow: toggle the modal to create a new exercise
    openCreateExerciseModal: function() {
        this.$.createExerciseModal.open();
    },
    closeCreateExerciseModal: function() {
        this.$.createExerciseModal.close();
    },
    // Validate the name: must be new, no duplicate exercise names
    validateCreateExerciseInput: function(list) {
        var val = $("#enterCreateExerciseName").val().toLowerCase();
        if (val.length > 0 && list && list.indexOf(val) < 0) {
            $("#enterCreateExerciseName").parent().find(".buttonHover").removeAttr("disabled");
        } else {
            $("#enterCreateExerciseName").parent().find(".buttonHover").attr("disabled", true);
        }
    },
    // The "create" in the CRUD routines for the list of exercise names
    createExercise: function() {

        // Reference the local instance of the Polymer model
        var model = this;
        
        // Extract the POST data and reset the input
        var name = $("#enterCreateExerciseName").val().toLowerCase();
        var data = {
            name: name,
            email: model.currentUser
        };
        $("#enterCreateExerciseName").val("");
        $("#createExerciseButton").attr("disabled", true);
        
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/exercise/create",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.exercises) {
                    model.updateMenuButtons(response.exercises);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    // User flow: toggle the modal to update an exercise's name
    openUpdateExerciseModal: function() {
        this.$.updateExerciseModal.open();
    },
    closeUpdateExerciseModal: function() {
        this.$.updateExerciseModal.close();
    },
    // Validate the inputted names: the exercise name must exist, and the new name must be unique in the list of existing exercise names
    validateUpdateExerciseInput: function(list) {
        var valOld = $("#enterUpdateOldName").val().toLowerCase();
        var valNew = $("#enterUpdateNewName").val().toLowerCase();
        if (valOld !== valNew && valOld.length > 0 && valNew.length > 0 && list.indexOf(valOld) > -1 && list && list.indexOf(valNew) < 0) {
            $("#enterUpdateOldName").parent().find(".buttonHover").removeAttr("disabled");
        } else {
            $("#enterUpdateOldName").parent().find(".buttonHover").attr("disabled", true);
        }
    },
    // The "update" in the CRUD routines for the list of exercise names
    updateExercise: function() {
        
        // Reference the local instance of the Polymer model
        var model = this;
        
        // Extract the POST data and reset the input
        var name = $("#enterUpdateOldName").val().toLowerCase();
        var updateTo = $("#enterUpdateNewName").val().toLowerCase();
        var data = {
            name: name,
            updateTo: updateTo,
            email: model.currentUser
        };
        $("#enterUpdateOldName").val("");
        $("#enterUpdateNewName").val("");
        $("#updateExerciseButton").attr("disabled", true);
        
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/exercise/update",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.updated) {
                    model.updateMenuButtons(response.updated);
                    if (name === model.currentExercise) {
                        $("#entryMessage").fadeOut().html('<div class="centered"><div class="exerciseTitle">' + updateTo + '</div></div>').fadeIn();
                        model.currentExercise = updateTo;
                    }
                    $("#viewSummary").click();
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    // User flow: toggle the modal to delete an exercise and all of its associated sessions
    openDeleteExerciseModal: function() {
        this.$.deleteExerciseModal.open();
    },
    closeDeleteExerciseModal: function() {
        this.$.deleteExerciseModal.close();
    },
    // Validate the inputted name: must exist in the list of exercises
    validateDeleteExerciseInput: function(list) {
        var val = $("#enterDeleteExerciseName").val().toLowerCase();
        if (val.length > 0 && list && list.indexOf(val) > -1) {
            $("#enterDeleteExerciseName").parent().find(".buttonHover").removeAttr("disabled");
        } else {
            $("#enterDeleteExerciseName").parent().find(".buttonHover").attr("disabled", true);
        }
    },
    // The "delete" in the CRUD routines for the list of exercise names
    deleteExercise: function() {
    
        // Reference the local instance of the Polymer model
        var model = this;
        
        // Extract the POST data and reset the input
        var name = $("#enterDeleteExerciseName").val().toLowerCase();
        var data = {
            name: name,
            email: model.currentUser
        };
        $("#enterDeleteExerciseName").val("");
        $("#deleteExerciseButton").attr("disabled", true);
        
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/exercise/delete",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.updated) {
                    model.updateMenuButtons(response.updated);
                    if (model.currentExercise === "summary" || model.currentExercise === name || response.updated.length < 1) {
                        $("#viewSummary").click();
                    }
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });              
    },
    // Only activate the save session button when the main fields have usable values
    toggleSaveSession: function() {
        var sets = $("#enterSets").val();
        var reps = $("#enterReps").val();
        var weight = $("#enterWeight").val();
        if (sets !== "" && parseInt(sets) && reps !== "" && parseInt(reps) && weight !== "" && parseInt(weight)) {
            $("#saveSession").removeAttr("disabled");
        } else {
            $("#saveSession").attr("disabled", true);
        }
    },
    // Add event listeners to the input bar above the graph
    addSessionInputEventListeners: function() {
        this.$.enterSets.addEventListener("keyup", this.toggleSaveSession);
        this.$.enterSets.addEventListener("change", this.toggleSaveSession);
        this.$.enterReps.addEventListener("keyup", this.toggleSaveSession);
        this.$.enterReps.addEventListener("change", this.toggleSaveSession);
        this.$.enterWeight.addEventListener("keyup", this.toggleSaveSession);
        this.$.enterWeight.addEventListener("change", this.toggleSaveSession);  
    },
    // The "create" in the CRUD routines for managing individual workout sessions per exercise
    createSession: function() {
        
        // Reference the local instance of the Polymer model
        var model = this;
        
        // Can't save a session without a signed in user and a selected exercise!
        if (model.currentUser === "" || model.currentExercise === "") { return false; }
        
        // If the values for sets, reps AND weight are all zero, do nothing - prevents accidental entries.
        if ($("#enterSets").val() === "" && $("#enterReps").val() === "" && $("#enterWeight").val() === "") { return false; }
        
        // Validate the POST data and reset the inputs
        var data = {
            email: model.currentUser,
            name: model.currentExercise,
            sets: model.validateSessionValues($("#enterSets")),
            reps: model.validateSessionValues($("#enterReps")),
            weight: model.validateSessionValues($("#enterWeight")),
            notes: model.validateSessionValues($("#enterNotes"))
        };
        
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/session/create",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.sessions) {
                    model.updateGraph(response);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    // The "read" in the CRUD routines for managing individual workout sessions per exercise
    readSessions: function() {
        
        // Reference the local instance of the Polymer model
        var model = this;
        
        // Prevent server activity without a signed in user (probably redundant, but just in case)
        if (model.currentUser === "") { return false; }
        
        // Validate the POST data and reset the inputs
        var data = {
            email: model.currentUser,
            name: model.currentExercise
        };
        
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/session/read",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.sessions) {
                    model.updateGraph(response);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    // Workout session general input validation
    validateSessionValues: function(item) {
        var value = $(item).val()
        if (parseInt(value)) {
            return value;
        } else {
            if ($(item).attr("id") === "enterNotes") {
                return "No notes saved for this session.";
            }
            return "0";
        }
    },
    // Date input validation for saved sessions
    validateSessionDate: function(originalDate) {
        var inputDate = $("#sessionDate").val();
        if (inputDate.length !== 10) {
            return originalDate;
        }
        return inputDate;
    },
    // Inject new DOM HTML while retaining data-binding
    // From: https://stackoverflow.com/questions/30836412/polymer-1-0-injectboundhtml-alternative
    injectBoundHTML: function(html, element) {
        var template = document.createElement('template', 'dom-bind');
        var doc = template.content.ownerDocument;
        var div = doc.createElement('div');
        div.innerHTML = html;
        template.content.appendChild(div);
        if (element.firstChild) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
        element.appendChild(Polymer.Base.instanceTemplate(template));
    },
    // Draws and dynamically updates the graph's lines, dots, tooltips, brush and legend
    // This code is pretty verbose and monolithic; given time, I would refactor it to make it shorter and more modular.
    updateGraph: function(data) {
        
        // Reference the Polymer model object
        var model = this;
        
        // User flow: first empty, close and hide the tooltip, if open from a previous graph view
        model.removeTooltip();
        
        // User flow: remove any prior clicked dot states/effects
        d3.selectAll(".dot")
            .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
            .attr("data-click", "off");
        
        // Get the graph & layout graphConfig
        var graphConfig = model.getConfiguration();

        // Find the layout dimensions for the base canvas for later reference
        var margin = graphConfig.margin; 
        var width = +graphConfig.graphWidth - +margin.left - +margin.right;
        var paddedWidth = width - 15;
        var height = +graphConfig.graphHeight - +margin.top - +margin.bottom;
        
        // For empty graphs
        if (data.sessions.length === 0) {
            d3.selectAll(".line").remove();
            d3.selectAll(".dot").remove();
            d3.selectAll(".legend").remove();
            var x = d3.time.scale().range([0, paddedWidth]).domain([model.getDate("2015-01-01"), model.getDate(new Date())]);
            var xBrush = d3.time.scale().range([0, paddedWidth]).domain([model.getDate("2015-01-01"), model.getDate(new Date())]);
            var y = d3.scale.linear().range([height, 0]).domain([0, 10000]);
            var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(graphConfig.xAxisTicks).tickFormat(d3.time.format('%b. %e'));
            var xAxisBrush = d3.svg.axis().scale(x).orient("bottom").ticks(graphConfig.xAxisTicks).tickFormat(d3.time.format('%b. %e'));
            var yAxis = d3.svg.axis().scale(y).orient("left").ticks(graphConfig.yAxisTicks);
            d3.select("g.x.axis").transition().call(xAxis);
            d3.select("g.y.axis").transition().call(yAxis);
            var brush = d3.svg.brush().x(xBrush);
            brush.clear();
            d3.selectAll(".x.brush").transition().call(brush);
            d3.select("#xAxisBrush").transition().call(xAxisBrush);
            return false;
        }
        
        // Map the values in the data object
        var values = data.sessions;
        var minDate = model.getDate(values[0].created_at);
        var maxDate = minDate;
        var minTotal = +values[0].sets * +values[0].reps * +values[0].weight;
        var maxTotal = minTotal;
        var mappedData = undefined; // Make absolutely sure the old mapped object is empty!
        var currentExercises = [];
        mappedData = values.map(function(d, i) {
            var thisDate = model.getDate(d.created_at);
            if (thisDate > maxDate) { maxDate = thisDate; }
            if (thisDate < minDate) { minDate = thisDate; }
            var thisTotal = +d.sets * +d.reps * +d.weight;
            if (thisTotal > maxTotal) { maxTotal = thisTotal; }
            if (thisTotal < minTotal) { minTotal = thisTotal; }
            // console.log(i, thisTotal, minTotal, maxTotal, minDate, maxDate);
            values[i].total = thisTotal;
            currentExercises.push(d.name);
            return {
                name: d.name,
                date: thisDate,
                sets: +d.sets,
                reps: +d.reps,
                weight: +d.weight,
                total: thisTotal
            };
        });
        maxTotal = maxTotal * 1.01;
        mappedData = d3.nest()
            .key(function(d) { return d.name; })
            .sortKeys(d3.ascending)
            .sortValues(function(a,b) { return a.date - b.date; })
            .entries(mappedData);
        // console.log("mappedData:", mappedData);
        
        // Define the min/max canvas ranges for x and y values
        var x = d3.time.scale().range([0, paddedWidth]).domain([minDate, maxDate]);
        var xBrush = d3.time.scale().range([0, paddedWidth]).domain([minDate, maxDate]);
        var y = d3.scale.linear().range([height, 0]).domain([0, maxTotal]);
        
        // Define the x-axis dimensions, ticks, and orientation
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(graphConfig.xAxisTicks).tickFormat(d3.time.format('%b. %e'));
        var xAxisBrush = d3.svg.axis().scale(x).orient("bottom").ticks(graphConfig.xAxisTicks).tickFormat(d3.time.format('%b. %e'));
        
        // Define the y-axis dimensions, ticks, and orientation
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(graphConfig.yAxisTicks);
        
        // Call the axes
        d3.select("g.x.axis").transition().call(xAxis);
        d3.select("g.y.axis").transition().call(yAxis);
        
        // Append a <div> to act as the container for the tooltip
        if (!document.getElementById("tooltipContainer")) {
            var tooltipDiv = d3.select("#" + (graphConfig.graphID || "graph"))
                .append("div")
                .attr("id", "tooltipContainer")
                .style("z-index", "9999")
                .style("position", "absolute")
                .style("-webkit-font-smoothing", "subpixel-antialiased !important")
                .style("opacity", "0");
        }
        
        // Grab the rendering area on the canvas
        var clippedSVG = d3.select(".clippedSVG");
        
        // Set the dots
        var dateFormatter = d3.time.format('%B %e, %Y');
        var removeDots = clippedSVG.selectAll(".dot").remove();
        var dots = clippedSVG.selectAll(".dot");
        dots.data(values)
            .enter()
            .append("circle")
            .attr("id", function(d) {
                return "dot-" + d.id;
            })
            .attr("class", function(d) {
                return "dot dot-" + (d.name).replace(/ /gi, "-");
            })
            .attr("data-id", function(d) { return d.id; })
            .attr("data-name", function(d) { return d.name; })
            .attr("data-date", function(d) { return d.created_at; })
            .attr("data-sets", function(d) { return d.sets; })
            .attr("data-reps", function(d) { return d.reps; })
            .attr("data-weight", function(d) { return d.weight; })
            .attr("data-total", function(d) { return d.total; })
            .attr("data-notes", function(d) { return d.notes; })
            .attr("data-state", "on")
            .attr("data-click", "off")
            .attr("cx", function(d) { return x(model.getDate(d.created_at)); })       
            .attr("cy", function(d) { return y(d.total); })
            .attr("r", graphConfig.circleRadiusSize)
            .attr("data-size-base", graphConfig.circleRadiusSize)
            .style("stroke", function(d) { return model.colorMap[(d.name).replace(/ /gi, "-").toLowerCase()]; })
            .style("fill", function(d) { return model.colorMap[(d.name).replace(/ /gi, "-").toLowerCase()]; })
            .style("cursor", "pointer")
            .style("opacity", "0")
            .on("click", function(d) {
                
                var dot = d3.select(this);
                var tooltip = d3.select("#tooltipContainer");
                
                var click = dot.attr("data-click");
                if (click === "off") {
                    
                    // Remove any prior clicked dot states/effects
                    d3.selectAll(".dot")
                        .transition()
                        .duration(200)
                        .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
                        .attr("data-click", "off");
                        
                    // Toggle the click state for the selected dot
                    dot.attr("data-click", "on")
                    dot.transition()
                        .duration(200)
                        .attr("r", function(d) { return +d3.select(this).attr("data-size-base") + graphConfig.circleRadiusExpandedPadding; })
                        
                    // Set the tooltip HTML content
                    var formattedDate = dateFormatter(model.getDate(dot.attr("data-date")));
                    var tooltipContentTemplate = '<paper-material id="tooltipSessionWrapper" elevation="2">'
                        + '<paper-input type="date" id="sessionDate" class="tooltipSession tooltipSessionDate" label="' + formattedDate + '" value=" "></paper-input>'
                        + '<paper-input type="number" min="0" max="500" id="sessionSets" class="tooltipSession" label="Sets" maxlength="3" value="' + dot.attr("data-sets") + '"></paper-input>'
                        + '<paper-input type="number" min="0" max="500" id="sessionReps" class="tooltipSession" label="Reps" maxlength="3" value="' + dot.attr("data-reps") + '"></paper-input>'
                        + '<paper-input type="number" id="sessionWeight" class="tooltipSession tooltipSessionWeight" label="Weight" maxlength="4" value="' + dot.attr("data-weight") + '"></paper-input>'
                        + '<paper-input id="sessionNotes" class="tooltipSession tooltipSessionNotes" char-counter label="Notes" maxlength="140" value="' + dot.attr("data-notes") + '"></paper-input>'
                        + '<paper-fab id="updateSession" class="buttonHover" icon="icons:done" on-tap="updateSession" title="Update this session?"></paper-fab>'
                        + '<paper-fab id="deleteSession" class="buttonHover" icon="icons:content-cut" on-tap="deleteSession" title="Delete this session?"></paper-fab>'
                        + '</paper-material>';
                    
                    // Inject the tooltip HTML into the DOM
                    model.injectBoundHTML(tooltipContentTemplate, document.getElementById("tooltipContainer"));

                    // Set the tooltip's location on the canvas
                    var pageXValue = +d3.select(this).attr("cx");
                    var pageYValue = +d3.select(this).attr("cy");
                    var xOffset = Math.round(pageXValue - graphConfig.tooltipXOffset);
                    var yOffset = Math.round(pageYValue - graphConfig.tooltipYOffset);
                    tooltip.style("left", "" + xOffset + "px").style("top", "" + yOffset + "px");

                    // Attach event listeners to the inputs and buttons
                    $("#sessionDate").on("change", function() {
                        if ($(this).val() === "") { $(this).val(" "); }
                    });
                    $("#updateSession").on("click", updateSession);
                    $("#deleteSession").on("click", deleteSession);
                    
                    // Set the tooltip's opacity back to visible
                    tooltip.transition().duration(200).style("opacity", "1.0");
                    
                    // This is clunkier than I would have liked, but nesting the update/delete POST functions here 
                    // prevents scope conflicts between the Polymer app object and D3's internal scope.
                    function updateSession() {
                        
                        // Need a signed in user and a selected exercise to update a session
                        if (model.currentUser === "" || model.currentExercise === "") { return false; }
                        
                        // Set up the CSRF token.
                        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
                    
                        // Validate the POST data and reset the inputs
                        var data = {
                            view: model.currentExercise,
                            id: dot.attr("data-id"),
                            email: model.currentUser,
                            name: dot.attr("data-name"),
                            date: model.validateSessionDate(dot.attr("data-date")),
                            sets: model.validateSessionValues($("#sessionSets")),
                            reps: model.validateSessionValues($("#sessionReps")),
                            weight: model.validateSessionValues($("#sessionWeight")),
                            notes: model.validateSessionValues($("#sessionNotes"))
                        };
                        
                        // POST handling routine
                        $.ajax({
                            type: "POST",
                            url: "/session/update",
                            data: data,
                            success: function(response) {
                                console.log("\nResponse:", response);
                                if (response.sessions) {
                                    model.updateGraph(response);
                                }
                            },
                            error: function(error) {
                                console.log("\nError:", error);
                            }
                        });
                    }  
                    
                    function deleteSession() {

                        // Need a signed in user to delete a session
                        if (model.currentUser === "") { return false; }
                        
                        // Validate the POST data and reset the inputs
                        var data = {
                            view: model.currentExercise,
                            id: dot.attr("data-id"),
                            email: model.currentUser,
                            name: dot.attr("data-name")
                        };
                        
                        // POST handling routine
                        $.ajax({
                            type: "POST",
                            url: "/session/delete",
                            data: data,
                            success: function(response) {
                                console.log("\nResponse:", response);
                                if (response.sessions) {
                                    model.updateGraph(response);
                                }
                            },
                            error: function(error) {
                                console.log("\nError:", error);
                            }
                        });
                    }

                } else {
                    
                    // Toggle the click state
                    dot.transition()
                        .duration(200)
                        .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
                        .attr("data-click", "off");
                        
                    // Remove the tooltip
                    model.removeTooltip();
                }
                
                return false;
            });
        clippedSVG.selectAll(".dot").transition().delay(150).style("opacity", "1.0");
        
        // Define the interpolation for the graphed line(s)
        var newLine = d3.svg.line()
            .x(function(d) { return x(model.getDate(d.date)); })
            .y(function (d) { return y(d.total); })
            .interpolate("linear");
            
        // Render the line(s) on the canvas
        var mappedLength = Object.keys(mappedData).length;
        var qsaLength = document.querySelectorAll(".line").length;
        
        // Case: only one line on the canvas to update.
        if (qsaLength === 1 && mappedLength === 1) {
            var newPath = newLine(mappedData[0].values);
            var keyMD = (mappedData[0].key).replace(/ /gi, "-");
            clippedSVG.select(".line")
                .transition()
                .attr("class", "line line-" + keyMD)
                .attr("d", newPath)
                .attr("data-name", keyMD)
                .style("stroke", function() { return d3.select(".dot-" + keyMD).style("fill"); });
        } else {
            if (qsaLength < mappedLength) {
                var loopLength = mappedLength;
            } else {
                var loopLength = qsaLength;
            }
            var arrayMD = [];
            for (var i = 0; i < loopLength; i++) {
                if (mappedData[i]) {
                    var newPath = newLine(mappedData[i].values);
                    var keyMD = (mappedData[i].key).replace(/ /gi, "-");
                    arrayMD.push(keyMD);
                    
                    // Case: update an existing line
                    if (document.querySelector(".line-" + keyMD)) {
                        clippedSVG.select(".line-" + keyMD)
                            .transition()
                            .attr("d", newPath)
                            .attr("data-name", keyMD)
                            .style("stroke", function() { return d3.select(".dot-" + keyMD).style("fill"); });
                            
                    // Case: add a new line
                    } else {
                        clippedSVG.append("g")
                            .attr("class", "line-wrapper")
                            .append("path")
                            .attr("class", "line line-" + keyMD)
                            .attr("d", newPath)
                            .attr("data-name", keyMD)
                            .style("stroke", function() { return d3.select(".dot-" + keyMD).style("fill"); })
                            .style("stroke-width", graphConfig.lineStrokeSize)
                            .style("fill", "none")
                            .style("opacity", "1.0");
                    }
                }
            }
            
            // Case: remove superfluous lines
            clippedSVG.selectAll(".line").each(function() {
                var removeLine = d3.select(this);
                if (arrayMD.indexOf(removeLine.attr("data-name")) < 0)  { removeLine.remove(); }
            });
        }

        // Define the brush
        var brush = d3.svg.brush()
            .x(xBrush)
            .on("brush", function() {
                
                // Remove the tooltip
                model.removeTooltip();
                
                // Set the brush extent range
                var extent = brush.extent();
                var extent0 = model.getDate(extent[0]);
                var extent1 = model.getDate(extent[1]);
                var range = extent1 - extent0;
                if (range > 10) { range = 5; }
                if (range < 1) { range = 1; }
                x.domain(brush.extent());
                
                // Update the x-axis
                d3.select("g.x.axis").transition().call(xAxis.ticks(range));
                
                // Update the line(s)
                if (mappedLength > 1){
                    for (var i = 0; i < mappedLength; i++) {
                        // console.log(mappedData[i]);
                        var lineID = ".line-" + (mappedData[i].key).replace(/ /gi, "-");
                        var newPath = newLine(mappedData[i].values);
                        clippedSVG.select(lineID).transition().attr("d", newPath).attr("clip-path", "url(#clip)");
                    }
                } else {
                    var newPath = newLine(mappedData[0].values);
                    clippedSVG.select(".line")
                        .transition()
                        .attr("d", newPath)
                        .attr("clip-path", "url(#clip)");
                }
                
                // Update the dots
                d3.selectAll(".dot")
                    .attr("data-click", "off")
                    .transition()
                    .style("opacity", "0");
                d3.selectAll(".dot")
                    .data(values)
                    .attr("clip-path", "url(#clip)")
                    .transition()
                    .attr("cx", function(d) { return x(model.getDate(d.created_at)); })
                    .attr("cy", function(d) { return y(d.total); })
                    .attr("r", function(d) {
                        var thisDot = d3.select(this);
                        return thisDot.attr("data-size-base");
                    })
                    .style("opacity", function(d) {
                        var thisDot = d3.select(this);
                        var name = thisDot.attr("data-name");
                        name = "legend-icon-" + name.replace(/ /gi, "-");
                        if (document.getElementById(name)) {
                            var checkState = d3.select("#" + name).attr("data-state");
                            if (checkState === "on") {
                                return "1.0";
                            } else {
                                return "0";
                            }
                            thisDot.attr("data-state", checkState);
                        }
                        thisDot.attr("data-state", "on");
                        return "1.0";
                    });
            });
        brush.clear();
        d3.selectAll(".x.brush").transition().call(brush);
        d3.select("#xAxisBrush").transition().call(xAxisBrush);
            
        // Set the graph reset button
        d3.select("#resetGraph").on("click", function(d) {
                
                // Remove the tooltip
                model.removeTooltip();
                
                // Reset the brush
                brush.clear();
                d3.selectAll(".brush").transition().duration(200).call(brush);
                
                // Reset the x-axis
                x.domain([minDate, maxDate]);
                d3.select(".x.axis").transition().duration(200).call(xAxis.ticks(graphConfig.xAxisTicks));
                
                // Reset the line(s)
                if (mappedLength > 1){
                    for (var i = 0; i < mappedLength; i++) {
                        // console.log(mappedData[i]);
                        var lineID = ".line-" + (mappedData[i].key).replace(/ /gi, "-");
                        var newPath = newLine(mappedData[i].values);
                        clippedSVG.select(lineID).transition().attr("d", newPath).style("opacity", "1.0");
                    }
                } else {
                    var newPath = newLine(mappedData[0].values);
                    clippedSVG.select(".line")
                        .transition()
                        .attr("d", newPath)
                        .style("opacity", "1.0");
                }

                // Reset the dots
                clippedSVG.selectAll(".dot")
                    .data(values)
                    .attr("data-state", "on")
                    .attr("data-click", "off")
                    .transition()
                    .duration(200)
                    .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
                    .attr("cx", function(d) { return x(model.getDate(d.created_at)); })
                    .attr("cy", function(d) { return y(d.total); })
                    .attr("clip-path", "url(#clip)")
                    .style("opacity", "1.0");
                
                // If present, reset the legend
                d3.selectAll(".legend-icon")
                    .attr("data-state", "on")
                    .transition()
                    .duration(200)
                    .style("opacity", "1.0");
                    
                return false;   
            });
        
        // Reset the legend area
        d3.selectAll(".legend").remove();
        
        // No legend needed when displaying individual exercises
        if (mappedLength < 2) {
            return false;
        }
        
        // Set the legend's domain
        var legendDomain = d3.scale.ordinal();
        legendDomain.domain(currentExercises.sort(d3.ascending));
        console.log(legendDomain.domain());
        
        // Define the legend layout
        var legendMarginLeft = 45;
        var svg = d3.select("#graph-svg");
        var legend = svg.selectAll(".legend")
            .data(legendDomain.domain())
            .enter()
            .append("g")
            .attr("class", "legend");
            legend.attr("transform", function(d, i) {
                if (i < 5) {
                    return "translate(" + ((i * 160) + legendMarginLeft) + ", " + (height + 78) + ")";
                } else if (i > 4 && i < 8) {
                    var j = i - 5;
                    return "translate(" + ((j * 160) + legendMarginLeft) + ", " + (height + 108) + ")";
                } else {
                    var j = i - 8;
                    return "translate(" + ((j * 160) + legendMarginLeft) + ", " + (height + 138) + ")";
                }
            });
            
        // Define the selection circles in the legend
        legend.append("circle")
            .data(mappedData)
            .attr("x", 0)
            .attr("y", 0)
            .attr("r", 12)
            .attr("transform", "translate(11, 11)")
            .style("fill", function(d) { return d3.select(".dot-" + (d.key).replace(/ /gi, "-")).style("fill"); });
            
        // Render the legend check marks
        legend.append("image")
            .data(mappedData)
            .attr("xlink:href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH3wYbFBkXJBgGFwAAAEtJREFUOMvt07ERACAIA0DC/jvHCQzmwI50NH8ICJIxlYzBLCbDKYw3MBsdoYNJSGF0oRtGMRu424TbUfVMFLV9Z3Cgl21iP/pf7ABAcQ4jwRBahgAAAABJRU5ErkJggg==")
            .attr("id", function(d) {
                return "legend-icon-" + (d.key).replace(/ /gi, "-");
            })
            .attr("class", "legend-icon")
            .attr("data-name", function(d, i) {
                return (d.key).replace(/ /gi, "-");
            })
            .attr("data-state", "on")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("transform", "translate(2, 2)")
            .style("cursor", "pointer");
            
        // Define the text labels in the legend
        legend.append("text")
            .attr("x", 26)
            .attr("y", 11)
            .attr("dy", "0.35em")
            .style("text-anchor", "start")
            .style("font-family", "'Roboto', 'Noto', sans-serif")
            .style("font-size", "12px")
            .text(function(d) {
                return model.capString(d);
            });
            
        // Add click functionality to the legend
        d3.selectAll(".legend-icon").on("click", function(d) {
            
                // Remove the tooltip
                model.removeTooltip();
                
                // Reset the dot sizes
                clippedSVG.selectAll(".dot")
                    .attr("data-click", "off")
                    .transition()
                    .duration(200)
                    .attr("r", function(d) { return d3.select(this).attr("data-size-base"); });
                
                var item = d3.select(this);
                var referenceName = item.attr("data-name").replace(/ /gi, "-");
                var state = "" + item.attr("data-state").toLowerCase();
                if (state === "off") {
                    item.attr("data-state", "on");
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", "1.0");
                    svg.selectAll(".dot-" + referenceName)
                        .transition()
                        .duration(200)
                        .style("opacity", "1.0")
                        .attr("data-state", "on")
                        .attr("r", function(d) { return d3.select(this).attr("data-size-base"); });
                    svg.select(".line-" + referenceName)
                        .transition()
                        .duration(200)
                        .style("opacity", "1.0");
                    return false;
                } else {
                    item.attr("data-state", "off");
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", "0");
                    d3.selectAll(".dot-" + referenceName)
                        .transition()
                        .duration(200)
                        .style("opacity", "0")
                        .attr("r", "0")
                        .attr("data-state", "off");
                    svg.selectAll(".line-" + referenceName)
                        .transition()
                        .duration(200)
                        .style("opacity", "0");
                    return false;
                }
            });
            
        return false;
    },
    // Draws an empty graph / sets the basic SVG scaffolding for use by the updateGraph() function
    createEmptyGraph: function() {
        
        var model = this;
        
        // Get the graph & layout graphConfig
        var graphConfig = model.getConfiguration();
        
        // Clear the graph's container of any prior content
        model.clearElement(graphConfig.graphID);

        // Find the layout dimensions for the base canvas for later reference
        var margin = graphConfig.margin; 
        var width = +graphConfig.graphWidth - +margin.left - +margin.right;
        var paddedWidth = width - 15;
        var height = +graphConfig.graphHeight - +margin.top - +margin.bottom;
        
        // Define the min/max canvas ranges for x and y values
        var x = d3.time.scale().range([0, paddedWidth]).domain([model.getDate("2015-01-01"), model.getDate(new Date())]);
        var xBrush = d3.time.scale().range([0, paddedWidth]).domain([model.getDate("2015-01-01"), model.getDate(new Date())]);
        var y = d3.scale.linear().range([height, 0]).domain([0, 10000]);
        
        // Define the x-axis dimensions, ticks, and orientation
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(graphConfig.xAxisTicks).tickFormat(d3.time.format('%b. %e'));
        var xAxisBrush = d3.svg.axis().scale(x).orient("bottom").ticks(graphConfig.xAxisTicks).tickFormat(d3.time.format('%b. %e'));
        
        // Define the y-axis dimensions, ticks, and orientation
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(graphConfig.yAxisTicks);
        
        // Append the base canvas for the graph
        var graphContainer = document.getElementById(graphConfig.graphID);
        var svg = d3.select(graphContainer)
            .append("svg")
            .attr("id", "graph-svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
        // Clip path for circles that overlap graph borders
        var clip = svg.append("defs")
            .append("svg:clipPath")
            .attr("id", "clip");
        svg.append("svg:rect")
            .attr("id", "clip-rect")
            .attr("x", 1)
            .attr("y", 1)
            .attr("width", graphConfig.clippedSVGWidth)
            .attr("height", graphConfig.clippedSVGHeight)
            .style("cursor", "default")
            .style("fill", "white");      
        clip.append("use").attr("xlink:href", "#clip-rect");
        var clippedSVG = svg.append("g").attr("class", "clippedSVG").attr("clip-path", "url(#clip)");

        // Append the x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);

        // Append the y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        // Append the top border line
        svg.append("line")
            .attr("id", "topBorder")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width - 15)
            .attr("y2", 0)
            .style("stroke", "rgb(0, 0, 0)")
            .style("stroke-width", "1.0")
            .style("shape-rendering", "crispEdges");
            
        // Append the far right border line
        svg.append("line")
            .attr("id", "rightBorder")
            .attr("x1", width - 15)
            .attr("y1", 0)
            .attr("x2", width - 15)
            .attr("y2", height)
            .style("stroke", "rgb(0, 0, 0)")
            .style("stroke-width", "1.0")
            .style("shape-rendering", "crispEdges");
        
        // Define the range slider base canvas
        var context = svg.append("g")
            .attr("transform", "translate(0," + graphConfig.brushOffset + ")")
            .attr("class", "context");
        
        // Define the range slider's tick marks
        context.append("g")
            .attr("id", "xAxisBrush")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + graphConfig.brushHeight + ")")
            .call(xAxisBrush);
        
        // Define the range slider's background color
        context.append("rect")
            .attr("x", 0)
            .attr("height", graphConfig.brushHeight)
            .attr("width", width - 15)
            .attr("fill", "#fff")
            .style("cursor", "pointer");
        
        // Define the brush
        var brush = d3.svg.brush().x(xBrush);
        
        // Append the brush to the base canvas
        context.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("height", graphConfig.brushHeight)
            .attr("fill", "#002147")
            .style("cursor", "pointer");
            
        // Append the brush's top border line
        svg.append("line")
            .attr("id", "topBorderBrush")
            .attr("x1", 0)
            .attr("y1", graphConfig.brushOffset)
            .attr("x2", width - 15)
            .attr("y2", graphConfig.brushOffset)
            .style("stroke", "rgb(0, 0, 0)")
            .style("stroke-width", "1.0")
            .style("shape-rendering", "crispEdges");

        // Append the brush's left border line
        svg.append("line")
            .attr("id", "rightBorderBrush")
            .attr("x1", 0)
            .attr("y1", graphConfig.brushOffset)
            .attr("x2", 0)
            .attr("y2", graphConfig.brushOffset + graphConfig.brushHeight)
            .style("stroke", "rgb(0, 0, 0)")
            .style("stroke-width", "1.0")
            .style("shape-rendering", "crispEdges");
            
        // Append the brush's right border line
        svg.append("line")
            .attr("id", "rightBorderBrush")
            .attr("x1", width - 15)
            .attr("y1", graphConfig.brushOffset)
            .attr("x2", width - 15)
            .attr("y2", graphConfig.brushOffset + graphConfig.brushHeight)
            .style("stroke", "rgb(0, 0, 0)")
            .style("stroke-width", "1.0")
            .style("shape-rendering", "crispEdges");
        
        // Helps ensure tick visibility across browsers
        svg.selectAll(".tick")
            .style("font-family", "'Roboto', 'Noto', sans-serif")
            .style("text-rendering", "geometricPrecision")
            .style("stroke", "rgb(0, 0, 0)")
            .style("stroke-width", "1.0")
            .style("shape-rendering", "crispEdges");
        
        return false;
    },
    // Helper function to hide the graph's tooltip
    removeTooltip: function() {
        var tooltip = d3.select("#tooltipContainer");
        tooltip.transition()
            .duration(200)
            .style("padding", "0px")
            .style("opacity", "0")
            .style("border", "none");
        tooltip.html("");
    },
    // Helper function to clear the a DOM element of content
    clearElement: function(a) {
        a = "" + a;
        if (document.getElementById(a) !== null) {
            document.getElementById(a).innerHTML = "";
        }
        return false;
    },
    // Helper function to capitalize strings
    capString: function(text) {
        return text.substring(0, 1).toUpperCase() + text.substring(1, text.length);
    },
    // Helper function to format dates for D3's internal use
    // From: https://stackoverflow.com/questions/8301531/dealing-with-dates-on-d3-js-axis
    getDate: function(date) {
        return new Date(date);
    },
    // Helper object to store some basic layout and graph presentation details
    getConfiguration: function() {
        return {
            graphID: "graph",
            graphWidth: 1150,
            graphHeight: 900,
            clippedSVGWidth: 1085,
            clippedSVGHeight: 444,
            circleRadiusSize: 3.618,
            circleRadiusExpandedPadding: 3.0,
            lineStrokeSize: 1.618,
            xAxisTicks: 5,
            yAxisTicks: 10,
            yAxisLabelPadding: -36,
            margin: {
                top: 5, 
                right: 5, 
                bottom: 450, 
                left: 45
            },
            brushHeight: 8,
            brushOffset: 478,
            tooltipXOffset: 185,
            tooltipYOffset: 190
        };
    },
    // Sets the graph's line and dot colors
    getColorMap: function() {
        var colors = [
            "#4184f3",
            "#d32f2f",
            "#ffa000",
            "#388e3c",
            "#ff5722",
            "#7c4dff",
            "#303f9f",
            "#3674be",
            "#009688",
            "#003399"
        ];
        var map = {};
        var i, item;
        for (i = 0; i < this.exerciseNames.length; i++) {
            map[this.exerciseNames[i].replace(/ /gi, "-")] = colors[i];
        }
        this.colorMap = map;
    }
});