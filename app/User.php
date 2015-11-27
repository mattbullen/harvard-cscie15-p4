<?php

namespace App;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

class User extends ModelValidationLayer implements AuthenticatableContract, AuthorizableContract, CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword;

    protected $table = 'users';
    protected $fillable = ['email'];
    protected $hidden = ['remember_token'];
    
    // Based on: 
    // http://laravel.com/docs/5.1/validation
    // http://daylerees.com/trick-validation-within-models/
    protected $rules = array(
        'email' => 'required|max:255|email'
    );
    
    protected $messages = array(
        'required' => 'Please use a valid email!',
        'max' => 'You\'ve gone over the character limit! E-mails may contain a maximum of 255 characters.',
        'email' => 'Please use a valid e-mail format: abc@xyx.com'
    );
}
