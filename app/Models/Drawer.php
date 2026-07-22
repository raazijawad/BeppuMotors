<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Drawer extends Model
{
    protected $fillable = ['name', 'amount', 'date'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
