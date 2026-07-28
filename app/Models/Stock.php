<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    protected $fillable = [
        'name', 'company', 'colour', 'shopname', 'chassisnumber',
        'description', 'price', 't_price', 'n_price', 'a_price', 'expected_profit',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
