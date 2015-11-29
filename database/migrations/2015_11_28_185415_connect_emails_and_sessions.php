<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ConnectEmailsAndSessions extends Migration
{
    public function up()
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->integer('email_id')->unsigned();
            $table->foreign('email_id')->references('id')->on('emails');
        });
    }

    public function down()
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropForeign('sessions_email_id_foreign');
            $table->dropColumn('email_id');
        });
    }
}
