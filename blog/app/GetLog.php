<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class GetLog extends Model
{
    protected $table = 'get_log';
    
     protected $appends = ['from_address','to_address','amount','block_num','currency','created_at'];
    public function getFromAddressAttribute()
    {
        return 'ADS'.$this->from;
    }
    
    public function getToAddressAttribute()
    {
        return 'ADS'.$this->to;
    }
    
     public function getAmountAttribute()
    {
        return strval($this->value) ;
    }
    
    public function getBlockNumAttribute()
    {
        return $this->blockNumber;
    }
    
    public function getCurrencyAttribute()
    {
        return 2;
    }
    
    public function getCreatedAtAttribute()
    {
        return date('Y-m-d H:i:s',intval($this->transactionsTimestamp/1000) ) ;
    }
    
}
