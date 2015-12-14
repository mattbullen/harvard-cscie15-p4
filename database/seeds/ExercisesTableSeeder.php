<?php

use Illuminate\Database\Seeder;

class ExercisesTableSeeder extends Seeder
{
    private function createList($id)
    {
        $list = array(
            0 => 'bench press',
            1 => 'deadlift',
            2 => 'squat',
            3 => 'overhead press'
        );
        
        for ($i = 0; $i < 4; $i++) {
            $date = Carbon\Carbon::now()->toDateTimeString();
            DB::table('exercises')->insert([
                'created_at' => $date,
                'updated_at' => $date,
                'name' => $list[$i],
                'email_id' => $id
            ]);
        }
    }
    
    public function run()
    {
        self::createList(1);
        self::createList(2);
    }
}