<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stock extends Model
{
    protected $casts = [
        'vehicle_received' => 'boolean',
        'document_received' => 'boolean',
        'masho_fax' => 'boolean',
    ];

    protected $fillable = [
        'name', 'company', 'colour', 'shopname', 'chassisnumber',
        'description', 'price', 't_price', 'n_price', 'a_price', 'expected_profit',
        'buy_auction_id',
        'vehicle_received',
        'document_received',
        'masho_fax',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<BuyAuction, $this>
     */
    public function buyAuction(): BelongsTo
    {
        return $this->belongsTo(BuyAuction::class);
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
