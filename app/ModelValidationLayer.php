<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Validator;

// Based on: 
// http://laravel.com/docs/5.1/validation
// http://daylerees.com/trick-validation-within-models/

class ModelValidationLayer extends Model
{
    use SoftDeletes;
    
    protected $dates = ['deleted_at'];
    
    protected $rules = array();
    
    protected $messages = array();
    
    protected $errors = array();
    
    public function validate($data) {
        $validation = Validator::make($data, $this->rules, $this->messages);
        if ($validation->fails()) {
            $this->errors = $validation->errors();
            return false;
        }
        return true;
    }

    public function errors() {
        return $this->errors;
    }
    
}