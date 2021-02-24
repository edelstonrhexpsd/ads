<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('index');
});

Route::any('index', 'IndexController@index');
Route::any('blockList', 'IndexController@blockList');
Route::any('transactionList', 'IndexController@transactionList');
Route::any('hashInfo', 'IndexController@hashInfo');
Route::any('blockInfo', 'IndexController@blockInfo');
Route::any('addressInfo', 'IndexController@addressInfo');
Route::any('holeInfo', 'IndexController@holeInfo');
Route::any('search', 'IndexController@search');


