<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'featuredGames' => \App\Models\Game::take(8)->get()
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::resource('game', App\Http\Controllers\GameController::class);

// Direct route to Puzzle Master game
Route::get('/puzzle-master', function () {
    $game = \App\Models\Game::where('view_name', 'puzzle-master')->first();
    return Inertia::render('games/puzzle-master', [
        'game' => $game,
    ]);
})->name('puzzle-master');

// Direct route to Space Adventure game
Route::get('/space-adventure', function () {
    $game = \App\Models\Game::where('view_name', 'space-adventure')->first();
    return Inertia::render('games/space-adventure', [
        'game' => $game,
    ]);
})->name('space-adventure');

// Direct route to Racing Thunder game
Route::get('/racing-thunder', function () {
    $game = \App\Models\Game::where('view_name', 'racing-thunder')->first();
    return Inertia::render('games/racing-thunder', [
        'game' => $game,
    ]);
})->name('racing-thunder');

// Direct route to Tower Defense Pro game
Route::get('/tower-defense-pro', function () {
    $game = \App\Models\Game::where('view_name', 'tower-defense-pro')->first();
    return Inertia::render('games/tower-defence-pro', [
        'game' => $game,
    ]);
})->name('tower-defense-pro');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
