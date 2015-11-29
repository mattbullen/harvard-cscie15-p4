<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Exercise extends ModelValidationLayer
{
    // Based on: 
    // http://laravel.com/docs/5.1/validation
    // http://daylerees.com/trick-validation-within-models/
    protected $rules = array(
        'name' => 'required|min:1|max:20|regex:/^([A-za-z0-9\-]+)([\s]+[A-za-z0-9\-]*)*$/',
        'updateTo' => 'min:1|max:20|regex:/^([A-za-z0-9\-]+)([\s]*[A-za-z0-9\-]*)*$/'
    );
    
    protected $messages = array(
        'required' => 'Please name the exercise!',
        'regex' => 'Unusable character! Please use only letters, numbers, spaces or hyphens.',
        'min' => 'Typo? The exercise name needs to start with at least one letter or number.',
        'max' => 'You\'ve gone over the character limit! The exercise name may contain a maximum of twenty characters.'
    );
    
    public function email() {
        return $this->belongsTo('\App\Email');
    }
}