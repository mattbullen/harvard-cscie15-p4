// Main page loading sequence.
$(document).ready(function() {
    highlightActiveTab();
    setUnixPermissionsRequest();
    console.log("\nApp JS loaded.");
});

// Highlight the active menu tab
function highlightActiveTab() {
    $("#a-unix").addClass("button-active");
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
    window.setTimeout(function() { $("#button-post").css({"background": ""}).html("Get the permissions!").prop("disabled", false); }, 300);
}

// Get the form values for the POST request to the server.
function getFormValues() {
    var values = {};
    var counter = 0;
    $("input").each(function() {
        var state = $(this).prop("checked");
        if (!state) { counter++; }
        values[this.name] = "" + state;
    });
    if (counter === 12) { return false; } // Flag to show an error message if no user details were selected.
    console.log("\nPOST:", values);
    return values;
}

// Display the list of random users if a POST request was successful.
function showSuccessMessage(text) {
    $("#result-content").fadeOut();
    window.setTimeout(function() { $("#result-content").html(text).fadeIn() }, 300);
}

// Display an error message if a POST request was not successful.
function showErrorMessage() {
    $("#result-content").fadeOut();
    window.setTimeout(function() { $("#result-content").html('<p class="error">Server error! Try again.</p>').fadeIn() }, 300);
}

// Set the set button functionality to request random users.
function setUnixPermissionsRequest() {
    
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
            $("#result-content").fadeOut();
            window.setTimeout(function() { $("#result-content").html('<p class="error">Nothing selected!</p>').fadeIn() }, 300);
            return false;
        }
        
        // Show the loading GIF in case of a slow server response.
        showLoadingGIF();
        
        // POST handling routine.
        $.ajax({
            type: "POST",
            url: "/unix",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                showSuccessMessage(response.permissions);
                hideLoadingGIF();
            },
            error: function(error) {
                console.log("\nError:", error);
                // $("#row-content").html(error.responseText);
                showErrorMessage();
                hideLoadingGIF();
            }
        });
    });
}