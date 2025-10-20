<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $games = [
            [
                'title' => 'Puzzle Master',
                'description' => 'Challenge your mind with this addictive puzzle game featuring hundreds of levels.',
                'thumbnail' => 'https://via.placeholder.com/400x225/ff6b35/ffffff?text=Puzzle+Master',
                'view_name' => 'puzzle-master',
            ],
            [
                'title' => 'Space Adventure',
                'description' => 'Explore the galaxy in this thrilling space exploration game with stunning graphics.',
                'thumbnail' => 'https://via.placeholder.com/400x225/4a90e2/ffffff?text=Space+Adventure',
                'view_name' => 'space-adventure',
            ],
            [
                'title' => 'Racing Thunder',
                'description' => 'Feel the adrenaline rush in this high-speed racing game with realistic physics.',
                'thumbnail' => 'https://via.placeholder.com/400x225/f5a623/ffffff?text=Racing+Thunder',
                'view_name' => 'racing-thunder',
            ],
            [
                'title' => 'Memory Challenge',
                'description' => 'Test and improve your memory skills with this engaging brain training game.',
                'thumbnail' => 'https://via.placeholder.com/400x225/7ed321/ffffff?text=Memory+Challenge',
                'view_name' => 'memory-challenge',
            ],
            [
                'title' => 'Tower Defense Pro',
                'description' => 'Defend your base against waves of enemies in this strategic tower defense game.',
                'thumbnail' => 'https://via.placeholder.com/400x225/9013fe/ffffff?text=Tower+Defense',
                'view_name' => 'tower-defense-pro',
            ],
            [
                'title' => 'Word Quest',
                'description' => 'Expand your vocabulary and have fun with this challenging word puzzle game.',
                'thumbnail' => 'https://via.placeholder.com/400x225/50e3c2/ffffff?text=Word+Quest',
                'view_name' => 'word-quest',
            ],
            [
                'title' => 'Ninja Runner',
                'description' => 'Run, jump, and slide through obstacles in this fast-paced endless runner.',
                'thumbnail' => 'https://via.placeholder.com/400x225/bd10e0/ffffff?text=Ninja+Runner',
                'view_name' => 'ninja-runner',
            ],
            [
                'title' => 'Card Master',
                'description' => 'Master the art of card games with this collection of classic and modern variants.',
                'thumbnail' => 'https://via.placeholder.com/400x225/f53003/ffffff?text=Card+Master',
                'view_name' => 'card-master',
            ],
        ];

        foreach ($games as $game) {
            Game::create($game);
        }
    }
}