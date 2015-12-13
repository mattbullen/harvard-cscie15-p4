<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();
        $this->call(EmailsTableSeeder::class);
        $this->call(ExercisesTableSeeder::class);
        $this->call(SessionsTableSeeder::class);
        Model::reguard();
    }
}