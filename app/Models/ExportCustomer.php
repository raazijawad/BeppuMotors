<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExportCustomer extends Model
{
    protected $fillable = [
        'name',
        'export_country_id',
        'user_id',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<ExportCountry, $this>
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(ExportCountry::class, 'export_country_id');
    }
}
