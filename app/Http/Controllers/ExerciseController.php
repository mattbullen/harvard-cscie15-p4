<?php 

namespace App\Http\Controllers;

use Request;
use Response;

class ExerciseController extends Controller {
    
    // Based on: 
    // http://laravel.com/docs/5.1/validation
    // http://daylerees.com/trick-validation-within-models/
    private function validateInput() {
        $check = new \App\Exercise(); 
        if ($check->validate(Request::all())) {
            return false;
        } else {
            return $check->errors();
        }
    }
    
    private function getEmailObject() {
        return \App\Email::where('email', '=', Request::input('email'))->first();
    }
    
    public function createExercise() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $reqName = Request::input('name');
        $emailObject = self::getEmailObject();
        $retrieveName = \App\Exercise::where('name', '=', $reqName)->where('email_id', '=', $emailObject->id)->get();
        if ($retrieveName && sizeof($retrieveName) > 0) {
            return Response::json(array('conflict' => 'Already exists!'));
        } else {
            $item = new \App\Exercise();
            $item->name = $reqName;
            $item->email()->associate($emailObject);
            $item->save();
            return Response::json(array('exercises' => \App\Exercise::where('email_id', '=', $emailObject->id)->get()));
        }
    }
    
    public function readExercises() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $reqName = Request::input('name');
        if (strtolower($reqName) == "all") { $reqName = ''; }
        $emailObject = self::getEmailObject();
        $item = \App\Exercise::where('name', 'LIKE', '%' . $reqName . '%')->where('email_id', '=', $emailObject->id)->get();
        if ($item && sizeof($item) > 0) {
            return Response::json(array('found' => $item));
        } else {
            return Response::json(array('conflict' => $reqName . ' not found!'));
        }
    }
    
    public function updateExercise() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $reqNameOld = Request::input('name');
        $reqNameUpdateTo = Request::input('updateTo');
        if ($reqNameOld == $reqNameUpdateTo) {
            return Response::json(array('error' => 'Names are the same!'));
        }
        if ($reqNameUpdateTo == '') {
            return Response::json(array('error' => 'Need an update-to name!'));
        }
        $emailObject = self::getEmailObject();
        $item = \App\Exercise::where('name', '=', $reqNameOld)->where('email_id', '=', $emailObject->id)->first();
        if ($item) {
            $item->name = $reqNameUpdateTo;
            $item->save();
            \App\Session::where('name', $reqNameOld)->update(array('name' => $reqNameUpdateTo));
            return Response::json(array('updated' => \App\Exercise::where('email_id', '=', $emailObject->id)->get()));
        } else {
            return Response::json(array('conflict' => $reqNameOld . ' not found!'));
        }
    }
    
    public function deleteExercise() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $reqName = Request::input('name');
        $emailObject = self::getEmailObject();
        $item = \App\Exercise::where('name', '=', $reqName)->first();
        if ($item) {
            $item->delete();
            \App\Session::where('name', $reqName)->where('email_id', '=', $emailObject->id)->delete();
            return Response::json(array('updated' => \App\Exercise::->where('email_id', '=', $emailObject->id)->get()));
        } else {
            return Response::json(array('conflict' => $reqName . ' not found!'));
        }
    }
}