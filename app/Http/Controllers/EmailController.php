<?php

namespace App\Http\Controllers;

use Request;
use Response;

class EmailController extends Controller {
    
    // Based on: 
    // http://laravel.com/docs/5.1/validation
    // http://daylerees.com/trick-validation-within-models/
    private function validateInput() {
        $check = new \App\Email(); 
        if ($check->validate(Request::all())) {
            return false;
        } else {
            return $check->errors();
        }
    }
    
    public function handleUser() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $reqEmail = Request::input('email');
        $retrieveEmail = \App\Email::where('email', '=', $reqEmail)->get();
        if ($retrieveEmail && sizeof($retrieveEmail)) {
            return Response::json(array('user' => 'Existing user e-mail found: ' . $reqEmail));
        } else {
            $item = new \App\Email();
            $item->email = $reqEmail;
            $item->save();
            return Response::json(array('user' => 'New user e-mail saved: ' . $reqEmail));
        }
    }
}