<?php 

namespace App\Http\Controllers;

use Request;
use Response;
use Illuminate\Database\Eloquent\Collection;

class SessionController extends Controller {
    
    // Based on: 
    // http://laravel.com/docs/5.1/validation
    // http://daylerees.com/trick-validation-within-models/
    private function validateInput() {
        $check = new \App\Session(); 
        if ($check->validate(Request::all())) {
            return false;
        } else {
            return $check->errors();
        }
    }
    
    private function getEmailObject() {
        return \App\Email::where('email', '=', Request::input('email'))->first();
    }
    
    public function readSessions() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $emailObject = self::getEmailObject();
        $emailSaved = $emailObject->email;
        $emailSubmitted = Request::input('email');
        if ($emailSaved == $emailSubmitted) {
            if (Request::input('name') == "summary") {
                $sessions = \App\Session::where('email_id', '=', $emailObject->id)->get();
                return Response::json(array('sessions' => $sessions));
            } else {
                $sessions = \App\Session::where('email_id', '=', $emailObject->id)->where('name', '=', Request::input('name'))->get();
                return Response::json(array('sessions' => $sessions));
            }
        } else {
            return Response::json(array('error' => 'Submitted e-mail does not match saved e-mail for this user.'));
        }
    }
    
    public function readAllSessions() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $emailObject = self::getEmailObject();
        $emailSaved = $emailObject->email;
        $emailSubmitted = Request::input('email');
        if ($emailSaved == $emailSubmitted) {
            $sessions = \App\Session::where('email_id', '=', $emailObject->id)->get();
            return Response::json(array('sessions' => $sessions));
        } else {
            return Response::json(array('error' => 'Submitted e-mail does not match saved e-mail for this user.'));
        }
    }
    
    public function createSession() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $emailObject = self::getEmailObject();
        $emailSaved = $emailObject->email;
        $emailSubmitted = Request::input('email');
        if ($emailSaved == $emailSubmitted) {
            $item = new \App\Session();
            $item->name = Request::input('name');
            $item->sets = Request::input('sets');
            $item->reps = Request::input('reps');
            $item->weight = Request::input('weight');
            $item->notes = Request::input('notes');
            $item->email()->associate($emailObject);
            $item->save();
            $sessions = \App\Session::where('email_id', '=', $emailObject->id)->where('name', '=', Request::input('name'))->get();
            return Response::json(array('sessions' => $sessions));
        } else {
            return Response::json(array('error' => 'Submitted e-mail does not match saved e-mail for this user.'));
        }
    }
    
    public function updateSession() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $emailObject = self::getEmailObject();
        $emailSaved = $emailObject->email;
        $emailSubmitted = Request::input('email');
        if ($emailSaved == $emailSubmitted) {
            $item = \App\Session::where('email_id', '=', $emailObject->id)->where('id', '=', Request::input('id'))->first();
            $item->created_at = Request::input('date');
            $item->sets = Request::input('sets');
            $item->reps = Request::input('reps');
            $item->weight = Request::input('weight');
            $item->notes = Request::input('notes');
            $item->save();
            if (Request::input('view') == "summary") {
                $sessions = \App\Session::where('email_id', '=', $emailObject->id)->get();
                return Response::json(array('sessions' => $sessions));
            } else {
                $sessions = \App\Session::where('email_id', '=', $emailObject->id)->where('name', '=', Request::input('name'))->get();
                return Response::json(array('sessions' => $sessions));
            }
        } else {
            return Response::json(array('error' => 'Submitted e-mail does not match saved e-mail for this user.'));
        }
    }
    
    public function deleteSession() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $emailObject = self::getEmailObject();
        $emailSaved = $emailObject->email;
        $emailSubmitted = Request::input('email');
        if ($emailSaved == $emailSubmitted) {
            $item = \App\Session::where('email_id', '=', $emailObject->id)->where('id', '=', Request::input('id'))->first();
            $item->delete();
            if (Request::input('view') == "summary") {
                $sessions = \App\Session::where('email_id', '=', $emailObject->id)->get();
                return Response::json(array('sessions' => $sessions));
            } else {
                $sessions = \App\Session::where('email_id', '=', $emailObject->id)->where('name', '=', Request::input('name'))->get();
                return Response::json(array('sessions' => $sessions));
            }
        } else {
            return Response::json(array('error' => 'Submitted e-mail does not match saved e-mail for this user.'));
        }
    }
    
}