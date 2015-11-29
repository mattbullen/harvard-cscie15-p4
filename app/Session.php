<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Session extends ModelValidationLayer
{
   // Based on:
    // http://laravel.com/docs/5.1/validation
    // http://daylerees.com/trick-validation-within-models/
    protected $rules = array(
        'email' => 'required|max:255|email',
        'name' => 'min:1|max:20|regex:/^([A-za-z0-9\-]+)([\s]+[A-za-z0-9\-]*)*$/',
        'sets' => 'numeric',
        'reps' => 'numeric',
        'weight' => 'numeric',
        'notes' => 'max:140',
    );
    
    protected $messages = array(
        'required' => 'This field is required!',
        'regex' => 'Unusable character! Please use only letters, numbers, spaces or hyphens.',
        'min' => 'Please use at least one character.',
        'max' => 'You\'ve gone over the character limit!',
        'numeric' => 'This entry must be a number!',
        'email' => 'Please use a valid e-mail format: abc@xyx.com'
    );
    
    public function email() {
        return $this->belongsTo('\App\Email');
    }
}