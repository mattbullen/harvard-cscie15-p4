// Main page loading sequence.
$(document).ready(function() {
    highlightActiveTab();
    setZurb($(this));
    setMenu();
    setAccordion();
    setPasswordRequest();  
});

// Highlight the active menu tab
function highlightActiveTab() {
    $("#a-password").addClass("button-active");
}

// Start the Zurb Foundation 5 accordion and slider plugins.
function setZurb(page) {
    $(page).foundation({
        accordion: {
            multi_expand: true,
            toggleable: true
        },
        slider: {
            on_change: function() {
                $("#range-button-words").text($("#quantity-words").val());
                $("#range-button-numbers").text($("#quantity-numbers").val());
                $("#range-button-special").text($("#quantity-special").val());
            }
        }
    });
    console.log("\nZurb Foundation 5 has started.");
}

// Set the sidebar menu click/change events.
function setMenu() {
    
    // Set the numbers selection part of the menu.
    $("#include-numbers").on("click", function includeNumbers() {
        if (this.checked) {
            this.value = true;
            $("#range-slider-numbers").removeClass("disabled");
            $("#range-button-numbers").text($("#quantity-numbers").val());
        } else {
            this.value = false;
            $("#range-slider-numbers").addClass("disabled").val(1);
        }
    });
    
    // Set the special characters selection part of the menu.
    $("#include-special").on("click", function includeSpecial() {
        if (this.checked) {
            this.value = true;
            $("#range-slider-special").removeClass("disabled");
            $("#range-button-special").text($("#quantity-special").val());
        } else {
            this.value = false;
            $("#range-slider-special").addClass("disabled").val(1);
        }
    });
    
    // Set the spacers choice selection part of the menu.
    $(".checkbox-box-spacers").on("change", function spacersChange() {
        $(this).prop("checked", true).val(true);
        $(".checkbox-box-spacers").not(this).prop("checked", false).val(false);
    });
    
    // Set the case selection part of the menu.
    $(".checkbox-box-case").on("change", function caseChange() {
        $(this).prop("checked", true).val(true);
        $(".checkbox-box-case").not(this).prop("checked", false).val(false);
    });
}

// Set the accordion presentation on page load and header tab click event.
function setAccordion() {
    
    // Display the first accordion tab content.
    $(".accordion-navigation-first").find(".content").slideToggle("fast");
    
    // Set the navigation behavior for the accordion.
    $(".accordion-navigation").on("click", function accordionClick() {
        $(this).find(".content").slideToggle("fast");
    });

    // Make sure the comic stays visible after clicking its link button.
    $("#xkcd-button").on("click", function xkcdButtonClick() {
        $("#comic-panel").removeClass("active");
        $("#panel3d-heading").click();
    });
}

// Get the form values for the POST request to the server.
function getFormValues() {
    var values = {};
    $("input").each(function() {
        values[this.name] = this.value;
    });
    if (values["include-numbers"] === "false") { values["quantity-numbers"] = "0"; }
    if (values["include-special"] === "false") { values["quantity-special"] = "0"; }
    console.log("\nPOST:", values);
    return values;
}

// Set the modal success message.
function showSuccessMessage(password) {
    $("#modalLeadTop").html("Your new password is:");
    $("#modalMessage").html(password);
    $("#modalLeadBottom").html("Save it to a safe place! Once you close this pop-up message, you'll need to make a new one.");
    $("#modal").foundation("reveal", "open");
}

// Set the modal error message.
function showErrorMessage() {
    $("#modalLeadTop").html("");
    $("#modalMessage").html("Server error! Try again in a few minutes.");
    $("#modalLeadBottom").html("");
    $("#modal").foundation("reveal", "open");
}

// Show a loading GIF after requesting a new password.
function showLoadingGIF() {
    $("#button-post").html("").css({
        "background": "url(data:image/gif;base64,R0lGODlhEAAQAPQAAP///zMzM/n5+V9fX5ycnDc3N1FRUd7e3rm5uURERJGRkYSEhOnp6aysrNHR0WxsbHd3dwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==) no-repeat",
        "background-size": "15px 15px",
        "background-position": "50% 50%"
    }).prop("disabled", true);
}

// Hide the loading GIF after receiving a response to a request for a new password.
function hideLoadingGIF() {
    window.setTimeout(function() { $("#button-post").css({"background": ""}).html("Get a new password!").prop("disabled", false); }, 100);
}

// Set the password request and modal display functionality.
function setPasswordRequest() {
    
    // Set up the CSRF token.
    $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });
    
    // AJAX request for a new password.
    $("#button-post").on("click", function generatePasswordRequest() {
        showLoadingGIF(); 
        $.ajax({
            type: "POST",
            url: "/password",
            data: getFormValues(),
            success: function(response) {
                console.log("\nResponse:", response);
                var password = atob(response.password);
                console.log("\nDecoded:", password);
                if (response.password && password) {
                    showSuccessMessage(password);
                } else {
                    showErrorMessage();
                }
                hideLoadingGIF();
            },
            error: function(error) {
                console.log("\nError:", error);
                showErrorMessage();
                hideLoadingGIF();
            }
        });
    });

    // Remove the password from the page HTML when the modal is closed.
    $("a.close-reveal-modal").on("click", function closeModal() {
        window.setTimeout(function() { $(".password").html(""); }, 500);
    });
}