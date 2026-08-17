<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuyAuction extends Model
{
    protected $fillable = [
        'date', 'vehicle_name', 'company', 'colour', 'shopname',
        'chassisnumber', 'description', 'for_who', 'price',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
