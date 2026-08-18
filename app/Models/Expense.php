<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property int $id
 * @property int $user_id
 * @property string $expense_name
 * @property float $amount
 * @property string|null $description
 * @property string|null $date
 * @property int|null $buy_auction_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at */
#[Fillable(['expense_name', 'amount', 'description', 'date', 'stock_id', 'buy_auction_id'])]
class Expense extends Model
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

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    public function buyAuction(): BelongsTo
    {
        return $this->belongsTo(BuyAuction::class);
    }
}
