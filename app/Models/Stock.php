<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function sellAuctions(): HasMany
    {
        return $this->hasMany(SellAuction::class);
    }
}
