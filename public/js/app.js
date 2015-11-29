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
        },
        graphData: {
            type: Array,
            value: [],
            reflect: true
        }
    },
    saveNewSession: function() {
        
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
        }; console.log(data);
        
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
                $("#graphWrapper").html(error.responseText);
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
        // console.log("\nPOST data():", data);
        
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/session/read/individual",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.sessions) {
                    model.handleGraph(response);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
                $("#graphWrapper").html(error.responseText);
            }
        });
    },
    readAllSessions: function() {
        
        // Reference the local instance of the Polymer model
        var model = this;
        
        // Prevent server activity without a signed in user
        if (model.currentUser === "") { return false; }
        
        // Set up the CSRF token
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
        // Validate the POST data and reset the inputs
        var data = {
            email: model.currentUser
        };
        
        // POST handling routine
        $.ajax({
            type: "POST",
            url: "/session/read/all",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.sessions) {
                    model.showSummary(response);
                }
            },
            error: function(error) {
                console.log("\nError:", error);
                $("#graphWrapper").html(error.responseText);
            }
        });
    },
    updateSession: function() {
        
        // Reference the local instance of the Polymer model
        var model = this;
        
        // Need a signed in user and a selected exercise to update a session
        if (model.currentUser === "" || model.currentExercise === "") { return false; }
        
        // Set up the CSRF token.
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
        // Validate the POST data and reset the inputs
        var data = {
            id: $("#sessionID").val(),
            email: model.currentUser,
            name: model.currentExercise,
            sets: $("#sessionSets").val(),
            reps: $("#sessionReps").val(),
            weight: $("#sessionWeight").val(),
            notes: $("#sessionNotes").val(),
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
                $("#graphWrapper").html(error.responseText);
            }
        });
    },
    deleteSession: function() {
        
        // Reference the local instance of the Polymer model for use inside the AJAX success callback
        var model = this;
        
        // Set up the CSRF token
        $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
        // Validate the POST data and reset the inputs
        var data = {
            id: $("#sessionID").val(),
            email: model.currentUser
        }; console.log(data);
        
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
                $("#graphWrapper").html(error.responseText);
            }
        });
    },
    validateSessionValues: function(item) {
        var value = $(item).val()
        $(item).val("");
        if (value.length) {
            return value;
        } else {
            if ($(item).attr("id") === "enterNotes") {
                return "No notes saved for this session.";
            } else {
                return "0";
            }
        }
    },
    validateWeight: function() {
        var input = $("#enterWeight #input");
        var value = input.val();
        var checked = value.replace(/\D*/g, "");
        input.val(checked);
    },
    editExercises: function() {
        
        
        
        
        
        
        
    },
    saveNewExercise: function() {

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
                $("#graphWrapper").html(error.responseText);
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
                $("#graphWrapper").html(error.responseText);
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
    toggleMenuButtonHighlighting: function() {
        
    },
    updateContentView: function(e) {
        // Retrieve the button's original exercise name from its template model: https://stackoverflow.com/questions/32212836/how-to-get-data-attribute-value-of-paper-card-from-on-tap-event
        var name = e.model.item.original;
        console.log("\nMenu button clicked:", name);
        this.currentExercise = name;
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
        if (gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()) {
            
            // Add the user first name and e-mail address to the local template's model
            var user = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
            this.currentUser = user.po;
            this.currentUserFirstName = user.Ph;
            console.log("User signed in: " + user.Ph + ", " + user.po);
            
            // Move on to the "get the app ready for use" process
            this.handleUser(user.po, user.Ph);
        }
        // this.currentUser = "xyz@sample.com"; console.log(this.currentUser);
        // this.handleUser(this.currentUser, "XYZ");
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
        $("#viewSummary").hide();
        $("#editExercises").hide();
        createEmptyGraph();
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
        $("#viewSummary").show();
        $("#editExercises").show();
        
        // Autoselect the summary view when the app first opens
        $("#viewSummary").click();
    },
    handleGraph: function(data) {
        if ((data.sessions).length < 1) { createEmptyGraph(); return false; }
        updateGraph(data);
    },
    showSummary: function(data) {
        this.handleGraph(data);
    },
    ready: function() {
        this.openWelcomeModal();
        createEmptyGraph();
        $("#enterWeight").on("keyup", this.validateWeight);
        this.addEventListener('google-signin-success', this.signIn);
        this.addEventListener('google-signed-out', this.signOut);
        this.signIn();
    },
    // From: https://scotch.io/tutorials/build-a-real-time-polymer-to-do-app
    findWithAttribute: function(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) { return i; }
        }
        return -1;
    },
});