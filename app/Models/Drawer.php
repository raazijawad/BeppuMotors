<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Drawer extends Model
{
    protected $fillable = ['name', 'amount', 'date', 'parent_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Drawer::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Drawer::class, 'parent_id');
    }
}
