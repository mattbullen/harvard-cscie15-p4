// Polymer app functionality
Polymer({
    is: "base-app",
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
        }
    },
    ready: function() {
        
        // Open the welcome message / sign in modal
        this.openWelcomeModal();
        
        // Pre-render the basic graph scaffolding
        this.createEmptyGraph();
        
        // User flow: add initial page element event listeners
        $("#viewSummary").hide();
        $("#editExercises").hide();
        $("#entryMessage").hide();
        $("#enterWeight").on("keyup", this.validateNewSessionWeight);
        
        // Set up the CSRF token for later use in POST requests
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
        
        // With the app ready to use, start the sign in process
        this.addEventListener('google-signin-success', this.signIn);
        this.addEventListener('google-signed-out', this.signOut);
        this.signIn();
    },
    createSession: function() {
        
        // Reference the local instance of the Polymer model
        var model = this;
        
        // Can't save a session without a signed in user and a selected exercise!
        if (model.currentUser === "" || model.currentExercise === "") { return false; }
        
        // Set up the CSRF token
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
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
                    model.handleGraph(response);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    readSessions: function() {
        
        // Reference the local instance of the Polymer model
        var model = this;
        
        // Prevent server activity without a signed in user (probably redundant, but just in case)
        if (model.currentUser === "") { return false; }
        
        // Set up the CSRF token
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
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
                    model.handleGraph(response);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    validateSessionValues: function(item) {
        var value = $(item).val()
        if (value.length) {
            return value;
        } else {
            if ($(item).attr("id") === "enterNotes") {
                return "No notes saved for this session.";
            }
            return "0";
        }
    },
    validateNewSessionWeight: function() {
        var input = $("#enterWeight #input");
        var value = input.val();
        var checked = value.replace(/\D*/g, "");
        input.val(+checked);
    },
    validateExistingSessionWeight: function() {
        var input = $("#sessionWeight #input");
        var value = input.val();
        var checked = value.replace(/\D*/g, "");
        input.val(+checked);
    },
    validateSessionDate: function(originalDate) {
        var inputDate = $("#sessionDate").val();
        if (inputDate.length !== 10) {
            return originalDate;
        }
        return inputDate;
    },
    createExercise: function() {

        // Reference the local instance of the Polymer model
        var model = this;
        
        // Set up the CSRF token
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
        // Extract the POST data and reset the input
        var data = {
            name: $("#enterNotes").val(),
            email: model.currentUser
        }
        $("#enterNotes").val("");
        
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
    setMenuButtons: function(e) {
        
        // Reference the local instance of the Polymer model for use inside the AJAX success callback
        var model = this;
        
        // Set up the CSRF token
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/exercise/read",
            data: { name: "all" },
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.found) {
                    model.updateMenuButtons(response.found);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
            }
        });
    },
    updateMenuButtons: function(data) {
        
        // Sort and process the exercise name strings
        data = data.sort(this.sortByProperty("name"));
        var list = [];
        var item;
        for (var i = 0; i < data.length; i++) {
            item = data[i].name;
            list.push({
                original: item,
                lowercase: item.toLowerCase(),
                hyphenated: (item.toLowerCase()).replace(/ /gi, "-")
            });
        }
        
        // Add them to the local template model
        this.menuButtons = list;
    },
    toggleButtonHighlighting: function() {
        $(".menuButton").on("click", function(e) {
            $(".buttonFocused").removeClass("buttonFocused"); console.log($(".buttonFocused"));
            $(this).addClass("buttonFocused");
        });
        $(".hoverButton").on("click", function() {
            $(this).blur();
        });
    },
    updateContentView: function(e) {
        // Retrieve the button's original exercise name from its template model: https://stackoverflow.com/questions/32212836/how-to-get-data-attribute-value-of-paper-card-from-on-tap-event
        if (e.model) {
            var tag = e.model.item.original;
        } else {
            var tag = (e.target.innerText).toLowerCase();
        }
        if (tag === "summary") {
            this.$.enterSets.disabled = true;
            this.$.enterReps.disabled = true;
            this.$.enterWeight.disabled = true;
            this.$.enterNotes.disabled = true;
            this.$.saveSession.disabled = true;
        } else {
            this.$.enterSets.disabled = false;
            this.$.enterReps.disabled = false;
            this.$.enterWeight.disabled = false;
            this.$.enterNotes.disabled = false;
            this.$.saveSession.disabled = false;
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
    signIn: function(e) {
        
        // Extract the user details from the Google OAuth2/JWT sign in object
        if (gapi && gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()) {
            
            // Add the user first name and e-mail address to the local template's model
            var user = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
            this.currentUser = user.po;
            this.currentUserFirstName = user.Ph;
            console.log("User signed in: " + user.Ph + ", " + user.po);
            
            // Move on to the "get the app ready for use" process
            this.handleUser(user.po, user.Ph);
        }
        //this.currentUser = "xyz@sample.com"; 
        //this.currentUserFirstName = "XYZ";
        //this.handleUser(this.currentUser, "XYZ");
    },
    handleUser: function(email, name) {
    
        // Reference the local instance of the Polymer model
        var model = this;

        // Set up the CSRF token
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
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
    signOut: function(e) {
        console.log("User signed out!");
        console.log(gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile());
        this.clearModelProperties();
        $("#viewSummary").fadeOut().hide();
        $("#editExercises").fadeOut().hide();
        $("#entryMessage").fadeOut().hide();
        this.createEmptyGraph();
    },
    clearModelProperties: function() {
        this.currentUser = "";
        this.currentUserFirstName = "";
        this.menuButtons = [];
    },
    openWelcomeModal: function() {
        this.$.welcomeModal.open();
    },
    closeWelcomeModal: function() {
        this.$.welcomeModal.close();
        $(".iron-overlay-backdrop-0").hide();
        this.setMenuButtons();
        $("#viewSummary").fadeIn().show();
        $("#editExercises").fadeIn().show();
        $("#entryMessage").fadeIn().show();
        // Autoselect the summary view when the app first opens
        $("#viewSummary").click();
    },
    // From: https://scotch.io/tutorials/build-a-real-time-polymer-to-do-app
    findWithAttribute: function(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) { return i; }
        }
        return -1;
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
    // Calls new graph content
    handleGraph: function(data) {
        var model = this;
        // if ((data.sessions).length < 1) { model.createEmptyGraph(); return false; }
        model.updateGraph(data);
    },
    // Draws and dynamically updates the graph's lines, dots, tooltips, brush and legend
    updateGraph: function(data) {
        
        // Reference the Polymer model object
        var model = this;
        
        // User flow: first empty, close and hide the tooltip, if open from a previous graph view
        d3.select("#tooltipContainer")
            .style("padding", "0px")
            .style("opacity", "0")
            .style("border", "none")
            .html("");
        
        // User flow: remove any prior clicked dot states/effects
        d3.selectAll(".dot")
            .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
            .attr("data-click", "off");
        
        // Get the graph & layout configurationObject
        var configurationObject = model.getConfiguration();

        // Find the layout dimensions for the base canvas for later reference
        var baseXYBoxSize = +configurationObject.graphWidth || 900;
        var margin = configurationObject.margin; 
        var width = baseXYBoxSize - +margin.left - +margin.right;
        var paddedWidth = width - 15;
        var height = baseXYBoxSize - +margin.top - +margin.bottom;
        var dateFormatter = d3.time.format('%B %e, %Y');
        
        // For empty graphs
        if (data.sessions.length === 0) {
            d3.selectAll(".line").remove();
            d3.selectAll(".dot").remove();
            d3.selectAll(".legend").remove();
            var x = d3.time.scale().range([0, paddedWidth]).domain([model.getDate("2015-01-01"), model.getDate(new Date())]);
            var xBrush = d3.time.scale().range([0, paddedWidth]).domain([model.getDate("2015-01-01"), model.getDate(new Date())]);
            var y = d3.scale.linear().range([height, 0]).domain([0, 10000]);
            var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
            var xAxisBrush = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
            var yAxis = d3.svg.axis().scale(y).orient("left").ticks(configurationObject.yAxisTicks);
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
        mappedData = values.map(function(d, i) {
            var thisDate = model.getDate(d.created_at);
            if (thisDate > maxDate) { maxDate = thisDate; }
            if (thisDate < minDate) { minDate = thisDate; }
            var thisTotal = +d.sets * +d.reps * +d.weight;
            if (thisTotal > maxTotal) { maxTotal = thisTotal; }
            if (thisTotal < minTotal) { minTotal = thisTotal; }
            // console.log(i, thisTotal, minTotal, maxTotal, minDate, maxDate);
            values[i].total = thisTotal;
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
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
        var xAxisBrush = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
        
        // Define the y-axis dimensions, ticks, and orientation
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(configurationObject.yAxisTicks);
        
        // Call the axes
        d3.select("g.x.axis").transition().call(xAxis);
        d3.select("g.y.axis").transition().call(yAxis);
        
        // Define the graph colors getter function
        var color = model.getColors();
         
        // Define the interpolation for the graphed line(s)
        var newLine = d3.svg.line()
            .x(function(d) { return x(model.getDate(d.date)); })
            .y(function (d) { return y(d.total); })
            .interpolate("linear");
        
        // Grab the rendering area on the canvas
        var clippedSVG = d3.select(".clippedSVG");
        
        // Render the line(s) on the canvas
        var mappedLength = Object.keys(mappedData).length;
        var qsaLength = document.querySelectorAll(".line").length;
        if (qsaLength < mappedLength) {
            // console.log("Case 1");
            if (qsaLength > 0) {
                clippedSVG.selectAll(".line").each(function(d, i) {
                   if (i > 0) { d3.select(this).remove(); } 
                });
                var newPath = newLine(mappedData[0].values);
                clippedSVG.select(".line")
                    .transition()
                    .attr("d", newPath)
                    .attr("class", function(d) {
                        return "line line-" + (mappedData[0].key).replace(/ /gi, "-");
                    });
                var newLinesStartCount = 1;
            } else {
                var newLinesStartCount = 0;
            }
            for (var i = newLinesStartCount; i < mappedLength; i++) {
                var lineClasses = "line line-" + (mappedData[i].key).replace(/ /gi, "-");
                var newPath = newLine(mappedData[i].values);
                var lineColor = color(mappedData[i].key);
                clippedSVG.append("g")
                    .attr("class", "line-wrapper")
                    .append("path")
                    .attr("class", lineClasses)
                    .attr("d", newPath)
                    .style("stroke", lineColor)
                    .style("stroke-width", configurationObject.lineStrokeSize)
                    .style("fill", "none")
                    .style("opacity", "1.0");
            }      
        } else {
            if (mappedLength > 1) {
                // console.log("Case 2");
                for (var i = 0; i < mappedLength; i++) {
                    var lineID = ".line-" + (mappedData[i].key).replace(/ /gi, "-");
                    var newPath = newLine(mappedData[i].values);
                    clippedSVG.select(lineID).transition().attr("d", newPath);
                }
            } else {
                // console.log("Case 3");
                clippedSVG.selectAll(".line").each(function(d, i) {
                   if (i > 0) { d3.select(this).remove(); } 
                });
                var newPath = newLine(mappedData[0].values);
                clippedSVG.select(".line")
                    .transition()
                    .attr("d", newPath)
                    .attr("class", function(d) {
                        return "line line-" + (mappedData[0].key).replace(/ /gi, "-");
                    });
            }
        }
        
        // Append a <div> to act as the container for the tooltip
        if (!document.getElementById("tooltipContainer")) {
            var tooltipDiv = d3.select("#" + (configurationObject.graphID || "graph"))
                .append("div")
                .attr("id", "tooltipContainer")
                .style("z-index", "9999")
                .style("position", "absolute")
                .style("-webkit-font-smoothing", "subpixel-antialiased !important")
                .style("opacity", "0");
        }
        
        // Set the dots
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
            .attr("r", configurationObject.circleStrokeSize)
            .attr("data-size-base", configurationObject.circleStrokeSize)
            .style("stroke", function(d, i) { return color(d.name); })
            .style("fill", function(d) { return color(d.name); })
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
                        .attr("r", function(d) { return +d3.select(this).attr("data-size-base") + 1.618; })
                        
                    // Set the tooltip HTML content
                    var formattedDate = dateFormatter(model.getDate(dot.attr("data-date")));
                    var tooltipContentTemplate = '<paper-material id="tooltipSessionWrapper" elevation="2">'
                        + '<paper-input type="date" id="sessionDate" class="tooltipSession tooltipSessionDate" label="' + formattedDate + '" value=" "></paper-input>'
                        + '<paper-input type="number" min="0" max="500" id="sessionSets" class="tooltipSession" label="Sets" maxlength="3" value="' + dot.attr("data-sets") + '"></paper-input>'
                        + '<paper-input type="number" min="0" max="500" id="sessionReps" class="tooltipSession" label="Reps" maxlength="3" value="' + dot.attr("data-reps") + '"></paper-input>'
                        + '<paper-input id="sessionWeight" class="tooltipSession tooltipSessionWeight" label="Weight" maxlength="4" value="' + dot.attr("data-weight") + '"></paper-input>'
                        + '<paper-input id="sessionNotes" class="tooltipSession tooltipSessionNotes" char-counter label="Notes" maxlength="140" value="' + dot.attr("data-notes") + '"></paper-input>'
                        + '<paper-fab id="updateSession" class="buttonHover" icon="icons:done" on-tap="updateSession" title="Update this session?"></paper-fab>'
                        + '<paper-fab id="deleteSession" class="buttonHover" icon="icons:content-cut" on-tap="deleteSession" title="Delete this session?"></paper-fab>'
                        + '</paper-material>';
                    
                    // Inject the tooltip HTML into the DOM
                    model.injectBoundHTML(tooltipContentTemplate, document.getElementById("tooltipContainer"));

                    // Set the tooltip's location on the canvas
                    var pageXValue = +d3.select(this).attr("cx");
                    var pageYValue = +d3.select(this).attr("cy");
                    var xOffset = Math.round(pageXValue - 185);
                    var yOffset = Math.round(pageYValue - 188);
                    tooltip.style("left", "" + xOffset + "px").style("top", "" + yOffset + "px");

                    // Attach event listeners to the inputs and buttons
                    $("#sessionWeight").on("keyup", model.validateExistingSessionWeight);
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
                        }; console.log(data);
                        
                        // POST handling routine
                        $.ajax({
                            type: "POST",
                            url: "/session/update",
                            data: data,
                            success: function(response) {
                                console.log("\nResponse:", response);
                                if (response.sessions) {
                                    model.handleGraph(response);
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
                                    model.handleGraph(response);
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
                    tooltip.transition()
                        .duration(200)
                        .style("padding", "0px")
                        .style("opacity", "0")
                        .style("border", "none");
                    tooltip.html("");
                    
                    // Remove the notes
                    d3.select("#entryMessage").html("No session selected!");
                
                }
                
                return false;
            });
        clippedSVG.selectAll(".dot").transition().delay(150).style("opacity", "1.0");
        
        // Define the brush
        var brush = d3.svg.brush()
            .x(xBrush)
            .on("brush", function() {
                
                // Remove the tooltip
                var tooltip = d3.select("#tooltipContainer");
                tooltip.style("padding", "0px")
                    .style("opacity", "0")
                    .style("border", "none");
                tooltip.html("");
                
                // Remove the notes
                d3.select("#entryMessage").html("No session selected!");
                
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
                        name = "legendCheckMark-" + name.replace(/ /gi, "-");
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
                var tooltip = d3.select("#tooltipContainer");
                tooltip.transition()
                    .duration(200)
                    .style("padding", "0px")
                    .style("opacity", "0")
                    .style("border", "none");
                tooltip.html("");
                
                // Reset the brush
                brush.clear();
                d3.selectAll(".brush").transition().duration(200).call(brush);
                
                // Reset the x-axis
                x.domain([minDate, maxDate]);
                d3.select(".x.axis").transition().duration(200).call(xAxis.ticks(configurationObject.xAxisTicks));
                
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
                d3.selectAll(".legendCheckMark")
                    .attr("data-state", "on")
                    .transition().duration(200)
                    .style("opacity", "1.0");
                    
                return false;   
            });
        
        // No legend needed when displaying individual exercises
        if (mappedLength === 1 ) {
            d3.selectAll(".legend").remove();
            return false;
        }
        
        // Define the graph's legend dimensions (for the summary chart)
        var svg = d3.select("#graph-svg");
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter()
            .append("g")
            .attr("class", "legend");
            legend.attr("transform", function(d, i) {
                var legendMarginLeft = 45;
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
            
        // Define the selection boxes in the legend
        legend.append("rect")
            .attr("x", 0)
            .attr("width", 22)
            .attr("height", 22)
            .style("fill", color);
            
        // Render the legend check marks
        legend.append("image")
            .data(mappedData)
            .attr("xlink:href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH3wYbFBkXJBgGFwAAAEtJREFUOMvt07ERACAIA0DC/jvHCQzmwI50NH8ICJIxlYzBLCbDKYw3MBsdoYNJSGF0oRtGMRu424TbUfVMFLV9Z3Cgl21iP/pf7ABAcQ4jwRBahgAAAABJRU5ErkJggg==")
            .attr("id", function(d) {
                return "legendCheckMark-" + (d.key).replace(/ /gi, "-");
            })
            .attr("class", "legendCheckMark")
            .attr("data-name", function(d, i) {
                return (d.key).replace(/ /gi, "-");
            })
            .attr("data-state", "on")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 22)
            .attr("height", 22)
            .style("cursor", "pointer");
        
        // Add click functionality to the legend
        var legendClick = d3.selectAll(".legendCheckMark").on("click", function(d) {
                var item = d3.select(this);
                var referenceName = item.attr("data-name");
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
                        .attr("r", function(d) { return d3.select(this).attr("data-size-base"); });
                    svg.select(".line-" + referenceName)
                        .transition()
                        .duration(200)
                        .style("opacity", "1.0");
                    return false;
                } else {
                    item.attr("data-state", "off");
                    d3.select("#tooltipContainer")
                        .style("padding", "0px")
                        .style("opacity", "0")
                        .style("border", "none")
                        .html("");
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", "0");
                    d3.selectAll(".dot-" + referenceName)
                        .transition()
                        .duration(200)
                        .style("opacity", "0")
                        .attr("r", "0");
                    svg.select(".line-" + referenceName)
                        .transition()
                        .duration(200)
                        .style("opacity", "0");
                    return false;
                }
                return false;
            });
        
        // Define the text labels in the legend
        legend.append("text")
            .attr("x", 26)
            .attr("y", 11)
            .attr("dy", "0.35em")
            .style("text-anchor", "start")
            .style("font-family", "'Roboto', 'Noto', sans-serif")
            .style("font-size", "12px")
            .text(function(d) { return model.capString(d); });
            
        return false;
    },
    // Draws an empty graph / sets the basic SVG scaffolding for use by the updateGraph() function
    createEmptyGraph: function() {
        
        var model = this;
        
        // Get the graph & layout configurationObject
        var configurationObject = model.getConfiguration();
        
        // Clear the graph's container of any prior content
        model.clearElement(configurationObject.graphID);

        // Find the layout dimensions for the base canvas for later reference
        var baseXYBoxSize = +configurationObject.graphWidth || 900;
        var margin = configurationObject.margin; 
        var width = baseXYBoxSize - +margin.left - +margin.right;
        var paddedWidth = width - 15;
        var height = baseXYBoxSize - +margin.top - +margin.bottom;
        
        // Define the min/max canvas ranges for x and y values
        var x = d3.time.scale().range([0, paddedWidth]).domain([model.getDate("2015-01-01"), model.getDate(new Date())]);
        var xBrush = d3.time.scale().range([0, paddedWidth]).domain([model.getDate("2015-01-01"), model.getDate(new Date())]);
        var y = d3.scale.linear().range([height, 0]).domain([0, 10000]);
        
        // Define the x-axis dimensions, ticks, and orientation
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
        var xAxisBrush = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
        
        // Define the y-axis dimensions, ticks, and orientation
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(configurationObject.yAxisTicks);
        
        // Append the base canvas for the graph
        var graphContainer = document.getElementById(configurationObject.graphID);
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
            .attr("width", 840)
            .attr("height", 444)
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
            .attr("transform", "translate(0," + configurationObject.brushOffset + ")")
            .attr("class", "context");
        
        // Define the range slider's tick marks
        context.append("g")
            .attr("id", "xAxisBrush")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + configurationObject.brushHeight + ")")
            .call(xAxisBrush);
        
        // Define the range slider's background color
        context.append("rect")
            .attr("x", 0)
            .attr("height", configurationObject.brushHeight)
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
            .attr("height", configurationObject.brushHeight)
            .attr("fill", "#002147")
            .style("cursor", "pointer");
            
        // Append the brush's top border line
        svg.append("line")
            .attr("id", "topBorderBrush")
            .attr("x1", 0)
            .attr("y1", configurationObject.brushOffset)
            .attr("x2", width - 15)
            .attr("y2", configurationObject.brushOffset)
            .style("stroke", "rgb(0, 0, 0)")
            .style("stroke-width", "1.0")
            .style("shape-rendering", "crispEdges");

        // Append the brush's left border line
        svg.append("line")
            .attr("id", "rightBorderBrush")
            .attr("x1", 0)
            .attr("y1", configurationObject.brushOffset)
            .attr("x2", 0)
            .attr("y2", configurationObject.brushOffset + configurationObject.brushHeight)
            .style("stroke", "rgb(0, 0, 0)")
            .style("stroke-width", "1.0")
            .style("shape-rendering", "crispEdges");
            
        // Append the brush's right border line
        svg.append("line")
            .attr("id", "rightBorderBrush")
            .attr("x1", width - 15)
            .attr("y1", configurationObject.brushOffset)
            .attr("x2", width - 15)
            .attr("y2", configurationObject.brushOffset + configurationObject.brushHeight)
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
            graphWidth: 900,
            circleStrokeSize: 3.0,
            lineStrokeSize: 1.0,
            xAxisTicks: 5,
            yAxisTicks: 10,
            yAxisLabelPadding: -36,
            margin: {
                top: 5, 
                right: 0, 
                bottom: 450, 
                left: 45
            },
            brushHeight: 8,
            brushOffset: 478
        };
    },
    // Sets the graph's line and dot colors
    getColors: function() {
        return d3.scale.ordinal().range([
            "#4184f3",
            "#0033ff",
            "#0055bb",
            "#1c49a4",
            "#24dccc",
            "#3399ff",
            "#006f88",
            "#3674be",
            "#000099",
            "#003399"
        ]);
    }
});

