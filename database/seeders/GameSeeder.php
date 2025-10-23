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
                'description' => 'A classic sliding puzzle game where you arrange numbered tiles in order. Choose between 3x3 and 4x4 grids and challenge yourself to solve it in the fewest moves!',
                'thumbnail' => null,
                'view_name' => 'puzzle-master',
            ],
            [
                'title' => 'Space Adventure',
                'description' => 'Navigate through space, avoid asteroids, and collect power-ups in this thrilling space exploration game with stunning graphics.',
                'thumbnail' => null,
                'view_name' => 'space-adventure',
            ],
            [
                'title' => 'Racing Thunder',
                'description' => 'Feel the adrenaline rush in this high-speed racing game with realistic physics and multiple tracks to master.',
                'thumbnail' => null,
                'view_name' => 'racing-thunder',
            ],
            [
                'title' => 'Memory Challenge',
                'description' => 'Test and improve your memory skills by matching pairs of cards in this engaging brain training game.',
                'thumbnail' => null,
                'view_name' => 'memory-match',
            ],
            [
                'title' => 'Tower Defense Pro',
                'description' => 'Defend your base against waves of enemies using strategic tower placement in this challenging defense game.',
                'thumbnail' => null,
                'view_name' => 'tower-defense-pro',
            ],
            [
                'title' => 'Word Quest',
                'description' => 'Expand your vocabulary and have fun with this challenging word puzzle game featuring multiple difficulty levels.',
                'thumbnail' => null,
                'view_name' => 'word-quest',
            ],
            [
                'title' => 'Ninja Runner',
                'description' => 'Run, jump, and slide through obstacles in this fast-paced endless runner featuring ninja skills.',
                'thumbnail' => null,
                'view_name' => 'ninja-runner',
            ],
            [
                'title' => 'Card Master',
                'description' => 'Master the art of card games with this collection of classic and modern card game variants.',
                'thumbnail' => null,
                'view_name' => 'card-master',
            ],
            [
                'title' => '2048',
                'description' => 'Combine numbered tiles to reach 2048 in this addictive puzzle game that tests your strategic thinking.',
                'thumbnail' => null,
                'view_name' => '2048',
            ],
            [
                'title' => 'Simon Says',
                'description' => 'Follow the sequence of colors and sounds in this classic memory game that gets progressively challenging.',
                'thumbnail' => null,
                'view_name' => 'simon-says',
            ],
            [
                'title' => 'Snake Classic',
                'description' => 'Guide the snake to eat food and grow longer while avoiding walls and your own tail in this timeless classic.',
                'thumbnail' => null,
                'view_name' => 'snake-classic',
            ],
            [
                'title' => 'Tic Tac Toe',
                'description' => 'Challenge the AI in this classic strategy game. Can you outsmart the computer and achieve victory?',
                'thumbnail' => null,
                'view_name' => 'tic-tac-toe',
            ],
        ];

        foreach ($games as $game) {
            Game::create($game);
        }
    }
}