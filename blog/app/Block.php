<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    protected $table = 'private_block_log';
    
    protected $appends = ['now_num'];

    public function getNowNumAttribute()
    {
        return $this->transactionsNum;
    }
}
