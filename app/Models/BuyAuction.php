<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BuyAuction extends Model
{
    protected $fillable = [
        'date', 'vehicle_name', 'company', 'colour', 'shopname',
        'chassisnumber', 'description', 'for_who', 'price', 'paid',
        'fax', 'fax_confirmed',
    ];

    protected $casts = [
        'paid' => 'boolean',
        'fax' => 'boolean',
        'fax_confirmed' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Stock, $this>
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }
}
