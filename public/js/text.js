// Main page loading sequence.
$(document).ready(function() {
    highlightActiveTab();
    setZurb($(this));
    setScroll();
    setTextRequest();
});

// Highlight the active menu tab
function highlightActiveTab() {
    $("#a-text").addClass("button-active");
}

// Start the Zurb Foundation 5 slider plugin.
function setZurb(page) {
    $(page).foundation({
        slider: {
            on_change: function() {
                $("#range-button-paragraphs").text($("#quantity-paragraphs").val());
            }
        }
    });
    console.log("\nZurb Foundation 5 has started.");
}

// Initialize the scroll effect for div#result.
function setScroll() {
    $(".nano").nanoScroller();
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
    window.setTimeout(function() { $("#button-post").css({"background": ""}).html("Get lorem ipsum text!").prop("disabled", false); }, 100);
}

// Get the input element value for the POST request to the server.
function getNumberOfParagraphs() {
    return {
        quantity: $("#quantity-paragraphs").val()
    };
}

// Display the lorem ipsum paragraphs if a POST request was successful.
function showSuccessMessage(text) {
    var content = "";
    for (var i = 0; i < text.length; i++) {
        content += '<p class="lorem">' + text[i] + '</p>';
    }
    $("#result").fadeOut();
    window.setTimeout(function() { $("#result").html(content).fadeIn() }, 300);
}

// Display an error message if a POST request was not successful.
function showErrorMessage() {
    $("#result").fadeOut();
    window.setTimeout(function() { $("#result").html('<p class="error">Server error! Try again later.</p>').fadeIn() }, 300);
}

// Set the set button functionality to request some lorem ipsum text.
function setTextRequest() {
    
    // Set up the CSRF token.
    $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
    // AJAX request for a new password.
    $("#button-post").on("click", function getText(e) {
        
        // Prevent the page from reloading.
        e.preventDefault();
        e.stopPropagation();
        
        // Show the loading GIF in case of a slow server response.
        showLoadingGIF();
        
        // POST handling routine.
        $.ajax({
            type: "POST",
            url: "/text",
            data: getNumberOfParagraphs(),
            success: function(response) {
                console.log("\nResponse:", response);
                if (response.text) {
                    showSuccessMessage(response.text);
                } else {
                    showErrorMessage();
                }
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