<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Info extends Model
{
    protected $table = 'money_log';
    
    public function getFromAddressAttribute($value)
    {
        return 'ADS'.$value;
    }
    
    public function getToAddressAttribute($value)
    {
        return 'ADS'.$value;
    }
}
