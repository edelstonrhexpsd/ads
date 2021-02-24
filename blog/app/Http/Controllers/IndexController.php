<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\{Block,Info,GetLog};
use \DB;
class IndexController extends Controller
{
    
    // 'GET /data/index': index,
    // 'GET /data/blockList': blockList,
    // 'GET /data/transactionList': transactionList,
    // 'GET /data/tokenList': tokenList,
    // 'GET /data/hashInfo': hashInfo,
    // 'GET /data/blockInfo': blockInfo,
    // 'GET /data/addressInfo':addressInfo,
    // 'GET /data/holeInfo':holeInfo,
    // 'GET /data/search':search
    public function index(Request $request)
    {
        $blockList = Block::orderBy('blockNumber','desc')->limit(10)->get();
        $traList = GetLog::orderBy('id','desc')->limit(10)->get();
        $now_price = json_decode((file_get_contents('http://dfma.cyber-department.io/tasking/ads_price')),true  )['data']['price'];
        $now_blockNumber = DB::table('private_block_log')->max('blockNumber');
        $now_transaction = DB::table('money_log')->where('assets_type',3)->count();
        $hole_address = DB::table('adsheidongxiaohui')->find(1)->money;
        $out_num = strval(DB::table("adsloop")->where('state',3)->sum('ADSnum'))+(DB::table('money_log')->where('types',28)->sum('amount'));
        return [
            'blockList' => $blockList,
            'traList' => $traList,
            'now_price' => $now_price,
            'now_blockNumber' => $now_blockNumber,
            'now_transaction' => $now_transaction,
            'hole_address' => $hole_address,
            'out_num' => $out_num,
            ];
    }
    
     public function blockList(Request $request)
    {
        return Block::orderBy('blockNumber','desc')->paginate(10);
    }
    
     public function transactionList(Request $request)
    {
        return GetLog::orderBy('id','desc')->paginate(10);
    }
    
     public function hashInfo(Request $request)
    {
        return [
            'info'=>GetLog::where('hash',$request->hash)->first()
        ];
    }
    
     public function blockInfo(Request $request)
    {
        return [
            'block'=>Block::where('blockNumber',$request->block)->first(),
            'tra'=>GetLog::where('blockNumber',$request->block)->paginate(10)
        ];
    }
    
     public function addressInfo(Request $request)
    {
        $address = substr($request->address,3);
        $user = DB::table('user')->where('emailphone',$address)->first();
        $client=new \Hprose\Socket\Client('tcp://127.0.0.1:3000',false);
        return [//emailphone
            'asset_ads'=> $client->balance(2,"Trx",$address),// DB::table('assets_wallet_ads')->where('uid',$user->id??'')->first()->number??0,
            'asset_usdt'=> DB::table('assets_wallet_usdt')->where('uid',$user->id??'')->first()->number??0,
            'address'=>$request->address,
            'tra'=>GetLog::where(function ($query) use ($address){
                    $query->where('from', $address)
                         ->orWhere('to', $address);
                })->paginate(10)
        ];
        
    }
    
    public function holeInfo()
    {
        $hole = DB::table('adsheidongxiaohui')->find(1);
        return [//emailphone
            'asset_ads'=> $hole->money,
            'address'=>'ADS'.$hole->address,
            'tra'=>Info::where('assets_type',3)->where('to_address', $hole->address)->paginate(10)
        ];
    }
    
    public function search(Request $request)
    {
        $user = DB::table('user')->where('emailphone',substr($request->q,3) )->first();
        //地址
        if($user){
            return ['type'=>'Address','q'=>$request->q];
        }
        //hash
        $info = Info::where('assets_type',3)->where('hash',$request->q)->first();
        if($info){
            return ['type'=>'Hash','q'=>$request->q];
        }
        //区块高度
        $blockInfo = Block::where('blockNumber',$request->q )->first();
        if($blockInfo){
            return ['type'=>'Block','q'=>$request->q];
        }
        //查不到
        return ['type'=>'Null','q'=>$request->q];
    }

    
}
