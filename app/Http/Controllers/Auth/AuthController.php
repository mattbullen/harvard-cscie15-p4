<?php

namespace App\Http\Controllers\Auth;

use Request;
use Response;
use App\User;
//use Validator;
use App\Http\Controllers\Controller;
//use Illuminate\Foundation\Auth\ThrottlesLogins;
//use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;

class AuthController extends Controller
{
/*
    use AuthenticatesAndRegistersUsers, ThrottlesLogins;

    protected $redirectPath = '/';
    protected $loginPath = '/';
    protected $redirectAfterLogout = '/';
    
    public function __construct()
    {
        $this->middleware('guest', ['except' => 'getLogout']);
    }

    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|confirmed|min:6',
        ]);
    }

    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);
    }
*/
    // Based on: 
    // http://laravel.com/docs/5.1/validation
    // http://daylerees.com/trick-validation-within-models/
    private function validateInput() {
        $check = new \App\User(); 
        if ($check->validate(Request::all())) {
            return false;
        } else {
            return $check->errors();
        }
    }
    
    protected function handlerUser() {
        $reqErrors = self::validateInput();
        if ($reqErrors) {
            return Response::json(array('error' => $reqErrors));
        }
        $reqEmail = Request::input('email');
        $retrieveEmail = \App\User::where('email', '=', $reqEmail)->get();
        if ($retrieveEmail && sizeof($retrieveEmail) > 0) {
            return Response::json(array('user' => 'User exists and is logged in.'));
        } else {
            User::create([
                'email' => $reqEmail
            ]);
            return Response::json(array('user' => 'User created and logged in.'));
        }
    }
}






