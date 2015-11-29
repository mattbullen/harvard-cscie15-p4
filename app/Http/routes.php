<?php

// Debugging routine from class notes
Route::get('/debug', function() {
    echo '<pre>';
    echo '<h1>Environment</h1>';
    echo App::environment().'</h1>';
    echo '<h1>Debugging?</h1>';
    if(config('app.debug')) echo "Yes"; else echo "No";
    echo '<h1>Database Config</h1>';
    //print_r(config('database.connections.mysql'));
    echo '<h1>Test Database Connection</h1>';
    try {
        $results = DB::select('SHOW DATABASES;');
        echo '<strong style="background-color:green; padding:5px;">Connection confirmed</strong>';
        echo "<br><br>Your Databases:<br><br>";
        print_r($results);
    }
    catch (Exception $e) {
        echo '<strong style="background-color:crimson; padding:5px;">Caught exception: ', $e->getMessage(), "</strong>\n";
    }
    echo '</pre>'; //94zW1KxWaQ
});

// For the table of exercise names/types
Route::post('/exercise/create', 'ExerciseController@createExercise');
Route::post('/exercise/read', 'ExerciseController@readExercises');
Route::post('/exercise/update', 'ExerciseController@updateExercise');
Route::post('/exercise/delete', 'ExerciseController@deleteExercise');

// For the table of individual work out sessions
Route::post('/session/create', 'SessionController@createSession');
Route::post('/session/read/individual', 'SessionController@readSessions');
Route::post('/session/read/all', 'SessionController@readAllSessions');
Route::post('/session/update', 'SessionController@updateSession');
Route::post('/session/delete', 'SessionController@deleteSession');

// For the table of email addresses (used to identify users in conjunction with the Google OAuth2 sign in API)
Route::post('/email', 'EmailController@handleUser');

// Default route
Route::get('/', function () {
    return view('layouts.master');
});

