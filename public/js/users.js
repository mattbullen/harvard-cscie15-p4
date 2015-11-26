// Main page loading sequence.
$(document).ready(function() {
    highlightActiveTab();
    setZurb($(this));
    setScroll();
    setMenu();
    setUsersRequest();
});

// Highlight the active menu tab
function highlightActiveTab() {
    $("#a-users").addClass("button-active");
}

// Start the Zurb Foundation 5 slider plugin.
function setZurb(page) {
    $(page).foundation({
        slider: {
            on_change: function() {
                $("#range-button-users").text($("#quantity-users").val());
            }
        }
    });
    console.log("\nZurb Foundation 5 has started.");
}

// Initialize the scroll effect for div#result.
function setScroll() {
    $(".nano").nanoScroller();
}

// Set the sidebar menu company / catchphrase linked click events.
function setMenu() {
    $("#include-company").on("click", function includeCompany() {
        if (this.checked) {
            this.value = true;
        } else {
            this.value = false;
            if ($("#include-catchphrase").prop("checked")) { $("#include-catchphrase").prop("checked", false); }
        }
        
    });
}

// Show a loading GIF after requesting some lorem ipsum text.
function showLoadingGIF() {
    $("#button-post").html("").css({
        "background": "url(data:image/gif;base64,R0lGODlhEAAQAPQAAP///zMzM/n5+V9fX5ycnDc3N1FRUd7e3rm5uURERJGRkYSEhOnp6aysrNHR0WxsbHd3dwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==) no-repeat",
        "background-size": "15px 15px",
        "background-position": "50% 50%"
    }).prop("disabled", true);
}

// Hide the loading GIF after receiving a response to a POST request to the server.
function hideLoadingGIF() {
    window.setTimeout(function() { $("#button-post").css({"background": ""}).html("Get random users!").prop("disabled", false); }, 100);
}

// Get the form values for the POST request to the server.
function getFormValues() {
    var values = {};
    var counter = 0;
    $("input").each(function() {
        if (this.id === "quantity-users") {
            values[this.name] = "" + this.value;
        } else {
            var state = $(this).prop("checked");
            if (!state) { counter++; }
            values[this.name] = "" + state;
        }
    });
    if (counter === 7) { return false; } // Flag to show an error message if no user details were selected.
    console.log("\nPOST:", values);
    return values;
}

// Check if an object is empty. Source: https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
function emptyObject(o) {
    for (var p in o) {
        if (o.hasOwnProperty(p)) { return false; }
    }
    return true;
}

// Display the list of random users if a POST request was successful.
function showSuccessMessage(users) {
    
    // Error checking.
    if (users.length === 1 && emptyObject(users)) { return false; }
    
    // Generate the HTML for each user.
    var content = "";
    
    for (var i = 0; i < users.length; i++) {
        content += '<div class="user-wrapper">';
        if (users[i].name) { content += '<div class="user"><div class="user-label">Name:</div><div class="user-value">' + users[i].name + '</div></div>'; }
        if (users[i].gender) { content += '<div class="user"><div class="user-label">Gender:</div><div class="user-value">' + users[i].gender + '</div></div>'; }
        if (users[i].address) {
            var address = users[i].address.split("\n");
            content += '<div class="user"><div class="user-label">Address:</div><div class="user-value">' + address[0] + '<br>' + address[1] + '</div></div>';
        }
        if (users[i].phone) { content += '<div class="user"><div class="user-label">Phone:</div><div class="user-value">' + users[i].phone + '</div></div>'; }
        if (users[i].email) { content += '<div class="user"><div class="user-label">E-mail:</div><div class="user-value">' + users[i].email + '</div></div>'; }
        if (users[i].company) { content += '<div class="user"><div class="user-label">Company:</div><div class="user-value">' + users[i].company + '</div></div>'; }
        if (users[i].catchphrase) { content += '<div class="user"><div class="user-label">Company Description:</div><div class="user-value">' + users[i].catchphrase + '</div></div>'; }
        if (users[i].birthday) { content += '<div class="user"><div class="user-label">Birthday:</div><div class="user-value">' + users[i].birthday + '</div></div>'; }
        content += '</div>';
    }
    
    // Render the HTML to the DOM.
    $("#result").fadeOut();
    window.setTimeout(function() { $("#result").html(content).fadeIn() }, 300);
    
}

// Display an error message if a POST request was not successful.
function showErrorMessage() {
    $("#result").fadeOut();
    window.setTimeout(function() { $("#result").html('<p class="error">Server error!<br>Try again later.</p>').fadeIn() }, 300);
}

// Set the set button functionality to request random users.
function setUsersRequest() {
    
    // Set up the CSRF token.
    $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
    // AJAX request for a new password.
    $("#button-post").on("click", function getText(e) {
        
        // Prevent the page from reloading.
        e.preventDefault();
        e.stopPropagation();
        
        // Get the form values.
        var data = getFormValues();
        
        // Show an error message if no user details were selected, then end the request - no need for a server call in this case.
        if (!data) {
            $("#result").fadeOut();
            window.setTimeout(function() { $("#result").html('<p class="error error-user-title">← No user details!</p><p class="error-user-message">Please select at least one type of user detail, then try again.</p>').fadeIn() }, 300);
            return false;
        }
        
        // Show the loading GIF in case of a slow server response.
        showLoadingGIF();
        
        // POST handling routine.
        $.ajax({
            type: "POST",
            url: "/users",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                showSuccessMessage(response);
                hideLoadingGIF();
            },
            error: function(error) {
                console.log("\nError:", error);
                // $("#result").html(error.responseText);
                showErrorMessage();
                hideLoadingGIF();
            }
        });
    });
}