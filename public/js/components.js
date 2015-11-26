// Main page loading sequence.
$(document).ready(function() {
    highlightActiveTab();
    
    // Set up the CSRF token.
    $.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") } });

    createExercise();
    readExercise();
    updateExercise();
    deleteExercise();
    console.log("\nApp JS loaded.");
});

// Highlight the active menu tab
function highlightActiveTab() {
    $("#a-home").addClass("button-active");
}

function createExercise() {
    $("#input-exercise-create").on("keypress", function(e) {
        if (e.keyCode && (e.keyCode === 9 || e.keyCode === 13)) {
            createExercisePOST(e);
        }
    });
    $("#button-exercise-create").on("click", createExercisePOST);
}

    function createExercisePOST(e) {
        
        // Prevent the page from reloading.
         e.preventDefault();
         e.stopPropagation();

        // Blur the input or button
        e.target.blur();
        
        // Show the loading GIF in case of a slow server response.
        // showLoadingGIF();
        
        // Extract the POST data and reset the input
        var data = {
            name: $("#input-exercise-create").val()
        }
        $("#input-exercise-create").val('');
        
        // POST handling routine.
        $.ajax({
            type: "POST",
            url: "/record/exercise/create",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                $("#log").html(JSON.stringify(response));
                /*if (response.text) {
                    showSuccessMessage(response.text);
                } else {
                    showErrorMessage();
                }
                hideLoadingGIF();*/
            },
            error: function(error) {
                console.log("\nError:", error);
                $("#log").html(error.responseText);
                // showErrorMessage();
                // hideLoadingGIF();
            }
        });
    }

function readExercise() {
    
    // AJAX request for a new password.
    $("#button-exercise-read").on("click", function readExercisePOST(e) {
        
        // Prevent the page from reloading.
        e.preventDefault();
        e.stopPropagation();
        
        // Blur the button
        e.target.blur();
        
        // Show the loading GIF in case of a slow server response.
        // showLoadingGIF();
        
        // Extract the POST data and reset the input
        var data = {
            name: $("#input-exercise-read").val()
        }
        $("#input-exercise-read").val('');
        
        // POST handling routine.
        $.ajax({
            type: "POST",
            url: "/record/exercise/read",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                $("#log").html(JSON.stringify(response));
                /*if (response.text) {
                    showSuccessMessage(response.text);
                } else {
                    showErrorMessage();
                }
                hideLoadingGIF();*/
            },
            error: function(error) {
                console.log("\nError:", error);
                $("#wrapper").html(error.responseText);
                // showErrorMessage();
                // hideLoadingGIF();
            }
        });
    });
}

function updateExercise() {

    // AJAX request for a new password.
    $("#button-exercise-update").on("click", function updateExercisePOST(e) {
        
        // Prevent the page from reloading.
        e.preventDefault();
        e.stopPropagation();
        
        // Blur the button
        e.target.blur();
        
        // Show the loading GIF in case of a slow server response.
        // showLoadingGIF();
        
        // Extract the POST data and reset the inputs
        var data = {
            name: $("#input-exercise-update-name").val(),
            updateTo: $("#input-exercise-update-updateTo").val()
        }
        $("#input-exercise-update-name").val('');
        $("#input-exercise-update-updateTo").val('');
        
        // POST handling routine.
        $.ajax({
            type: "POST",
            url: "/record/exercise/update",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                $("#log").html(JSON.stringify(response));
                /*if (response.text) {
                    showSuccessMessage(response.text);
                } else {
                    showErrorMessage();
                }
                hideLoadingGIF();*/
            },
            error: function(error) {
                console.log("\nError:", error);
                $("#log").html(error.responseText);
                // showErrorMessage();
                // hideLoadingGIF();
            }
        });
    });
}

function deleteExercise() {
    
    // AJAX request for a new password.
    $("#button-exercise-delete").on("click", function deleteExercisePOST(e) {
        
        // Prevent the page from reloading.
        e.preventDefault();
        e.stopPropagation();
        
        // Blur the button
        e.target.blur();
        
        // Show the loading GIF in case of a slow server response.
        // showLoadingGIF();
        
        // Extract the POST data and reset the input
        var data = {
            name: $("#input-exercise-delete").val()
        }
        $("#input-exercise-delete").val('');
        
        // POST handling routine.
        $.ajax({
            type: "POST",
            url: "/record/exercise/delete",
            data: data,
            success: function(response) {
                console.log("\nResponse:", response);
                $("#log").html(JSON.stringify(response));
                /*if (response.text) {
                    showSuccessMessage(response.text);
                } else {
                    showErrorMessage();
                }
                hideLoadingGIF();*/
            },
            error: function(error) {
                console.log("\nError:", error);
                $("#log").html(error.responseText);
                // showErrorMessage();
                // hideLoadingGIF();
            }
        });
    });
}