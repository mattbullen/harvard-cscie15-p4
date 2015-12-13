<?php

use Illuminate\Database\Seeder;

class SessionsTableSeeder extends Seeder
{
    private function getWeight($exercise, $session)
    {   
        if ($session > 0 && rand(0, 1) === 0) {
            $session = $session - 1;
        }
        if ($exercise === 0) {
            return 50 + ($session * 5);
        } else if ($exercise === 1) {
            return 100 + ($session * 5);
        } else if ($exercise === 2) {
            return 75 + ($session * 5);
        } else {
            return 25 + ($session * 5);
        }
    }
    
    private function createList($id)
    {
        $list = array(
            0 => 'Bench Press',
            1 => 'Deadlift',
            2 => 'Squat',
            3 => 'Overhead Press'
        );
        
        for ($i = 0; $i < 4; $i++) {
            for ($j = 0; $j < 30; $j++) {
                $date = Carbon\Carbon::now()->addDays(($j * 3) + $i)->toDateTimeString();
                DB::table('sessions')->insert([
                    'created_at' => $date,
                    'updated_at' => $date,
                    'name' => $list[$i],
                    'sets' => rand(0, 3) + 3,
                    'reps' => rand(0, 3) + 3,
                    'weight' => self::getWeight($i, $j),
                    'notes' => 'This is ' . strtolower($list[$i]) . ' note #' . ($j + 1) . '.',
                    'email_id' => $id
                ]);
            }
        }
    }
    
    public function run()
    {
        self::createList(1);
        self::createList(2);
    }
}
