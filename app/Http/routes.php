<?php

// From class notes
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
Route::post('/record/exercise/create', 'RecordController@createExercise');
Route::post('/record/exercise/read', 'RecordController@readExercise');
Route::post('/record/exercise/update', 'RecordController@updateExercise');
Route::post('/record/exercise/delete', 'RecordController@deleteExercise');

// For the table of users
Route::post('/user', 'EmailController@handleUser');

// Default route
Route::get('/', function () {
    return view('layouts.master');
});

