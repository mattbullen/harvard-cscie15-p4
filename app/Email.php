<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Email extends ModelValidationLayer
{
    protected $rules = array(
        'email' => 'required|max:255|email'
    );
    
    protected $messages = array(
        'required' => 'Please use a valid email!',
        'max' => 'You\'ve gone over the character limit! E-mails may contain a maximum of 255 characters.',
        'email' => 'Please use a valid e-mail format: abc@xyx.com'
    );
}