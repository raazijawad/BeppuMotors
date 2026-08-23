<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellAuction extends Model
{
    protected $fillable = [
        'stock_id',
        'auction_price',
        'sold',
        'document_submitted',
    ];

    protected $casts = [
        'sold' => 'boolean',
        'document_submitted' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }
}
