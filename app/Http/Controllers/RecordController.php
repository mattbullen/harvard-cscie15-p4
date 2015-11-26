<?php namespace App\Http\Controllers;

use Request;
use Response;

class RecordController extends Controller {
    
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
    
    public function createExercise() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $reqName = Request::input('name');
        $retrieveName = \App\Exercise::where('name', '=', $reqName)->get();
        if ($retrieveName && sizeof($retrieveName) > 0) {
            return Response::json(array('conflict' => 'exists'));
        } else {
            $item = new \App\Exercise();
            $item->name = $reqName;
            $item->save();
            return Response::json(array('exercises' => \App\Exercise::all()));
        }
    }
    
    public function readExercise() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $reqName = Request::input('name');
        if (strtolower($reqName) == "all") { $reqName = ''; }
        $item = \App\Exercise::where('name', 'LIKE', '%' . $reqName . '%')->get();
        if ($item && sizeof($item) > 0) {
            return Response::json(array('found' => $item));
        } else {
            return Response::json(array('conflict' => 'none'));
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
            return Response::json(array('error' => 'names are the same'));
        }
        if ($reqNameUpdateTo == '') {
            return Response::json(array('error' => 'need update-to name'));
        }
        $item = \App\Exercise::where('name', '=', $reqNameOld)->first();
        if ($item) {
            $item->name = Request::input('updateTo');
            $item->save();
            return Response::json(array('updated' => \App\Exercise::all()));
        } else {
            return Response::json(array('conflict' => 'none'));
        }
    }
    
    public function deleteExercise() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $item = \App\Exercise::where('name', '=', Request::input('name'))->first();
        if ($item) {
            $item->delete();
            $remainder = \App\Exercise::all();
            if (sizeof($remainder) < 1) {
                $message = 'no saved exercises';
            } else {
                $message = $remainder;
            }
            return Response::json(array('updated' => $message));
        } else {
            return Response::json(array('conflict' => 'none'));
        }
    }
    
}