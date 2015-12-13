<?php

use Illuminate\Database\Seeder;

class EmailsTableSeeder extends Seeder
{
    public function run()
    {
        $date = Carbon\Carbon::now()->toDateTimeString();
        DB::table('emails')->insert([
            'created_at' => $date,
            'updated_at' => $date,
            'email' => 'jamalcscie15@gmail.com',
        ]);
        DB::table('emails')->insert([
            'created_at' => $date,
            'updated_at' => $date,
            'email' => 'jillcscie15@gmail.com',
        ]);
    }
}