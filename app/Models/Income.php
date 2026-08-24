<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property int $id
 * @property int $user_id
 * @property string $income_name
 * @property float $amount
 * @property string|null $description
 * @property string|null $date
 * @property int|null $sell_auction_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at */
#[Fillable(['income_name', 'amount', 'description', 'date', 'sell_auction_id'])]
class Income extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sellAuction(): BelongsTo
    {
        return $this->belongsTo(SellAuction::class);
    }
}
