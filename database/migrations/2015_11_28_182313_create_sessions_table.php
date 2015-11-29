<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreateSessionsTable extends Migration
{
    public function up()
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();
            $table->softDeletes();
            $table->rememberToken();
            $table->string('name');
            $table->integer('sets');
            $table->integer('reps');
            $table->integer('weight');
            $table->string('notes');
        });
    }

    public function down()
    {
        Schema::drop('sessions');
    }

}
